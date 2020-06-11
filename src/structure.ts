import process from './process';
import { last } from './utils';

process('parsed', 'structured', (data, fullConfig) => {
  let quoteCount = 0;
  const structureQuotes = (spans, config = {}) => {
    const result = [] as any[];
    let quoteRun = 0;
    spans.forEach((s) => {
      if (s.type === 'note') {
        const content = s.content.map((c) => ({
          ...c,
          spans: structureQuotes(c.spans, config),
        }));
        result.push({ ...s, content });
      } else if (s.type === 'quote') {
        quoteCount++;
        if (quoteRun > 0) {
          last(result).content.push(...s.content);
        } else {
          quoteRun = config[quoteCount] || 0;
          if (quoteRun > 0) result.push(s);
          else result.push({ text: '“' }, ...s.content, { text: '”' });
        }
        quoteRun--;
      } else {
        if (quoteRun > 0) {
          const c = last(result).content;
          if (last(c).type !== 'join') c.push({ type: 'join', content: [] });
          last(c).content.push(s);
        } else {
          result.push(s);
        }
      }
    });
    return result;
  };

  const structureNotes = (spans) => {
    const result = [] as any[];
    spans.forEach((s, i) => {
      if (s.type !== 'note') {
        result.push(s);
      } else {
        const q = spans
          .slice(i - 2, i)
          .reverse()
          .find((s) => s.type === 'quote');
        if (q) {
          q.source = s.content;
        } else {
          result.push(s);
        }
      }
    });
    return result;
  };

  return data.map((x) => {
    if (!x.spans) return x;
    return {
      ...x,
      spans: structureNotes(structureQuotes(x.spans, fullConfig.quotes)),
    };
  });
});
