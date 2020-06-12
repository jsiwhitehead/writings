import process from './process';
import { last } from './utils';

process('parsed', 'structured', (data, fullConfig) => {
  let quoteCount = 0;
  const combineQuotes = (spans, config = {}) => {
    const result = [] as any[];
    let quoteRun = 0;
    spans.forEach((s) => {
      if (s.type === 'note') {
        result.push(s);
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
          if (last(c).type !== 'join') c.push({ type: 'join', spans: [] });
          last(c).spans.push(s);
        } else {
          result.push(s);
        }
      }
    });
    return result;
  };

  let noteCount = 0;
  const addSources = (spans, skipLast, config = [] as any[]) => {
    const result = [] as any[];
    spans.forEach((s, i) => {
      if (s.type !== 'note') {
        result.push(s);
      } else {
        noteCount++;
        const q =
          !(skipLast && i === spans.length - 1) &&
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

  return data.map((x) => {
    if (!x.spans) return x;
    const spans = removePlainQuotes(
      addSources(
        combineQuotes(x.spans, fullConfig.quotes),
        x.type === 'block',
        fullConfig.skipNotes,
      ),
    );
    if (x.type === 'block') {
      if (
        last(spans).type === 'note' &&
        !(fullConfig.skipNotes || []).includes(noteCount)
      ) {
        x.source = spans.pop().content;
      }
    }
    return { ...x, spans };
  });
});
