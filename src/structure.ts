import process from './process';
import { last } from './utils';

const getLevel = (levels, header, index) => {
  if (Array.isArray(levels)) return levels[index];
  return levels[header?.trim()] ?? levels[''];
};

const set = (data, index, key, value) =>
  index.reduce((res, i, j) => {
    if (!res.content) res.content = [];
    if (!res.content[i - 1]) res.content[i - 1] = {};
    if (j === index.length - 1) {
      res.content[i - 1][key] =
        typeof value === 'function' ? value(res.content[i - 1][key]) : value;
    }
    return res.content[i - 1];
  }, data);

const flattenSpans = (spans, first, last) => {
  const result = { spans: [] as any[], content: '' };
  spans.forEach((s) => {
    const start = result.content.length;
    if (s.type === 'note') {
      result.spans.push({
        start,
        ...s,
        content: s.content.map((x) => flattenSpans(x, true, true)),
      });
    } else if (s.type === 'quote') {
      result.content += '￿';
      result.spans.push({
        start,
        ...s,
        content: s.content.map((x, i) =>
          flattenSpans(x, i === 0, i === s.content.length - 1),
        ),
      });
    } else {
      result.content +=
        (spans[0].type !== 'quote' && !result.content && first) ||
        result.content.endsWith(' ')
          ? (s.text || '').trimLeft()
          : s.text || '';
      result.content = result.content.replace(/￿/g, '');
      if (s.type) {
        const end = result.content.length;
        result.spans.push({ start, end, type: s.type });
      }
    }
  });
  result.content = result.content.replace(/￿/g, '');
  if (last && spans[spans.length - 1].type !== 'quote') {
    result.content = result.content.trimRight();
  }
  result.spans = result.spans.map(({ start, end, ...other }) => ({
    start: Math.min(start, result.content.length),
    end: end && Math.min(end, result.content.length),
    ...other,
  }));
  if (!result.spans.length) delete result.spans;
  return result;
};

const structure = (data, _, levelsConfig) => {
  let header = 0;
  let index = [];
  let inHeader = false;
  const outline = {} as any;
  const levels = data
    .filter((d) => d.type === 'header')
    .map((h, i) => getLevel(levelsConfig, h.spans?.[0].text, i));
  const content = data
    .map(({ type, spans, ...other }) => {
      const level =
        type === 'header'
          ? levels[header++]
          : Math.max(levels[header - 1] || 0, levels[header] || 0) + 1;
      if (level + 1 > index.length) {
        Array.from({ length: level + 1 }).forEach((_, i) => {
          index[i] = index[i] || 1;
        });
      } else if (!(inHeader && index.length === level + 1)) {
        index = index.slice(0, level + 1);
        index[level]++;
      }
      const content = spans && flattenSpans(spans, true, true);
      inHeader = type === 'header';
      if (type === 'header') {
        if (content && !/^(\d+|– \d+ –)$/.test(content.content)) {
          set(outline, index, 'title', (v) => [...(v || []), content]);
        }
        set(outline, index.slice(0, -1), 'text', index.slice(0, -1).join('.'));
      } else {
        set(outline, index.slice(0, -1), 'text', index.slice(0, -1).join('.'));
        return {
          type: content?.spans?.some((x) => x.type === 'break')
            ? 'lines'
            : type,
          ...other,
          ...(content || {}),
          index: index.join('.'),
          item: last(index),
        };
      }
    })
    .filter((x) => x);
  return { content, outline: outline.content[0] };
};

process('organised', 'structured', (data, { url, levels }) => {
  const { content, outline } = structure(data, url, levels);
  return { content, outline };
});
