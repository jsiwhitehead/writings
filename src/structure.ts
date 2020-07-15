import process from './process';
import { last, sortMultiple } from './utils';

const getLevel = (levels, header, index) => {
  if (Array.isArray(levels)) return levels[index];
  return levels[header?.trim()] ?? levels[''];
};

const hash = (s) => {
  let hash = 0;
  let i;
  let chr;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

const flattenSpans = (spans) => {
  const result = { spans: [] as any[], content: '' };
  spans.forEach((s) => {
    const start = result.content.length;
    if (s.type === 'note') {
      result.spans.push({
        start,
        ...s,
        content: s.content.map((x) => flattenSpans(x)),
      });
    } else if (s.type === 'quote') {
      result.content += '￿';
      result.spans.push({
        start,
        ...s,
        content: s.content.map((x) => flattenSpans(x)),
      });
    } else {
      result.content += result.content.endsWith(' ')
        ? (s.text || '').trimLeft()
        : s.text || '';
      result.content = result.content.replace(/￿/g, '').trimLeft();
      if (s.type) {
        const end = result.content.length;
        result.spans.push({ start, end, type: s.type });
      }
    }
  });
  result.content = result.content.replace(/￿/g, '').trimRight();
  result.spans = result.spans.map(({ start, end, ...other }) => ({
    start: Math.min(start, result.content.length),
    end: end && Math.min(end, result.content.length),
    ...other,
  }));
  if (!result.spans.length) delete result.spans;
  return result;
};

const structure = (data, url, levelsConfig) => {
  let header = 0;
  let index = [];
  let inHeader = false;
  const titles = {};
  const chunks = {};
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
      const chunk = hash(url + index.slice(0, -1).join('.'));
      const content = spans ? flattenSpans(spans) : ({} as any);
      inHeader = type === 'header';
      if (type === 'header') {
        if (spans && !/^\d+$/.test(content.content)) {
          titles[index.join('.')] = [
            ...(titles[index.join('.')] || []),
            content,
          ];
        }
      } else {
        chunks[index.slice(0, -1).join('.')] = chunk;
        return {
          ...other,
          ...content,
          // index: index.join('.'),
          chunk,
          item: last(index),
        };
      }
    })
    .filter((x) => x);
  const outline = [
    ...Object.keys(titles).map((k) => [
      k.split('.').map((x) => parseInt(x, 10)),
      titles[k],
    ]),
    ...Object.keys(chunks).map((k) => [
      k.split('.').map((x) => parseInt(x, 10)),
      chunks[k],
    ]),
  ]
    .sort((a, b) => sortMultiple(a[0], b[0], (a, b) => a - b))
    .map(([k, v]) => [k.length, v]);
  return { content, outline };
};

process('organised', 'structured', (data, { url, levels }) => {
  const { content, outline } = structure(data, url, levels);
  return { content, outline };
});
