import { last, sortMultiple } from './utils';

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

export default (hashBase, data, getLevel, ignore?) => {
  let header = 0;
  let index = [];
  let inHeader = false;
  const titles = {};
  const chunks = {};
  const levels = data
    .filter((d) => d.type === 'header')
    .map((h, i) => getLevel(h.content, i));
  const content = data
    .map((d) => {
      const level =
        d.type === 'header'
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
      const chunk = hash(hashBase + index.slice(0, -1).join('.'));
      if (d.type === 'header') {
        if (d.content && !ignore?.(d.content)) {
          titles[index.join('.')] = [
            ...(titles[index.join('.')] || []),
            { ...d, type: undefined },
          ];
        }
      } else {
        chunks[index.slice(0, -1).join('.')] = chunk;
      }
      inHeader = d.type === 'header';
      return { ...d, index: index.join('.'), chunk, item: last(index) };
    })
    .filter((x) => x.type !== 'header');
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
