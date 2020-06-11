import process from './process';
import { last } from './utils';

process('parsed', 'structured', (data, fullConfig) => {
  const removePlainQuotes = (spans) => {
    const result = [] as any[];
    spans.forEach((s) => {
      if (s.type === 'quote' && !s.source) {
        result.push({ text: '“' }, ...s.spans, { text: '”' });
      } else {
        result.push(s);
      }
    });
    return result;
  };

  let quoteCount = 0;
  const combineQuotes = (spans, config = {}) => {
    const result = [] as any[];
    let quoteRun = 0;
    spans.forEach((s) => {
      if (s.type === 'note') {
        const content = s.content.map((c) => ({
          ...c,
          spans: removePlainQuotes(combineQuotes(c.spans, config)),
        }));
        result.push({ ...s, content });
      } else if (s.type === 'quote') {
        quoteCount++;
        if (quoteRun > 0) {
          last(result).spans.push(...s.spans);
        } else {
          quoteRun = config[quoteCount] || 1;
          result.push(s);
        }
        quoteRun--;
      } else {
        if (quoteRun > 0) {
          const c = last(result).spans;
          if (last(c).type !== 'join') c.push({ type: 'join', content: [] });
          last(c).content.push(s);
        } else {
          result.push(s);
        }
      }
    });
    return result;
  };

  let noteCount = 0;
  const addSources = (spans, config = [] as any[]) => {
    const result = [] as any[];
    spans.forEach((s, i) => {
      if (s.type !== 'note') {
        result.push(s);
      } else {
        noteCount++;
        const q =
          !config.includes(noteCount) &&
          spans
            .slice(i - 2, i)
            .reverse()
            .find((s) => s.type === 'quote');
        if (q) q.source = s.content;
        else result.push(s);
      }
    });
    return result;
  };

  let blockCount = 0;
  return data.map((x) => {
    if (!x.spans) return x;
    if (x.type === 'block') {
      blockCount++;
      if (
        last(x.spans).type === 'note' &&
        !(fullConfig.skipBlocks || []).includes(blockCount)
      ) {
        x.source = x.spans.pop().content;
        // removePlainQuotes on source!
      }
    }
    const spans = removePlainQuotes(
      addSources(
        combineQuotes(x.spans, fullConfig.quotes),
        fullConfig.skipNotes,
      ),
    );
    return { ...x, spans };
  });
});
