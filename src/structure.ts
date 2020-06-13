import process from './process';
import { last } from './utils';

process('parsed', 'structured', (data, fullConfig) => {
  const combineQuotes = (spans, config = {}) => {
    const result = [] as any[];
    let quoteRun = 0;
    spans.forEach((s) => {
      if (s.type === 'note') {
        result.push(s);
      } else if (s.type === 'quote') {
        if (quoteRun > 0) {
          last(result).spans.push(...s.spans);
        } else {
          quoteRun = config[s.number] || 1;
          result.push(s);
        }
        delete s.number;
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

  const addSources = (spans, config = [] as any[]) => {
    const result = [] as any[];
    spans.forEach((s, i) => {
      if (s.type !== 'note') {
        result.push(s);
      } else {
        const q =
          !config.includes(s.number) &&
          spans
            .slice(i - 2, i)
            .reverse()
            .find((s) => s.type === 'quote');
        if (q) q.source = s.content;
        else result.push(s);
        delete s.number;
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
    if (
      x.type === 'block' &&
      last(x.spans).type === 'note' &&
      !(fullConfig.skipNotes || []).includes(last(x.spans).number)
    ) {
      x.source = x.spans.pop().content;
      delete x.source.number;
    }
    return {
      ...x,
      spans: removePlainQuotes(
        addSources(
          combineQuotes(x.spans, fullConfig.quotes),
          fullConfig.skipNotes,
        ),
      ),
    };
  });
});
