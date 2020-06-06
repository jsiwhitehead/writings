import { capitalise, last, sortMultiple } from '../utils';

export const url =
  'https://www.bahai.org/library/authoritative-texts/bahaullah/call-divine-beloved/call-divine-beloved.xhtml';

// "The Call of the Divine Beloved"
// "Selected Mystical Works of Bahá’u’lláh"
//   "Preface"
//   "1"
//   "Rashḥ‑i‑‘Amá"
//   "(The Clouds of the Realms Above)"
//   "2"
//   "The Seven Valleys"
//     "*"
//   "3"
//   "From the Letter Bá’ to the Letter Há’"
//   "Three Other Tablets"
//     "4"
//     "5"
//     "6"
//   "7"
//   "The Four Valleys"

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

// const isNumber = (v: string) => !isNaN(v as any) && !isNaN(parseFloat(v));

const sliceContent = ({ content, spans }, start, end?) => ({
  content: content.slice(start, end),
  spans: spans
    ?.filter((s) => s.start >= start && (!end || s.end <= end))
    .map((s) => ({ ...s, start: s.start - start, end: s.end - start })),
});
const trimContent = (c) =>
  sliceContent(c, c.content.search(/\S/), c.content.search(/\s*$/));
const joinContent = (...contents) => {
  const result = {
    content: contents.reduce(
      (res, c) => res + (typeof c === 'string' ? c : c.content),
      '',
    ),
    spans: contents.reduce(
      (res, c) => [...res, ...((typeof c !== 'string' && c.spans) || [])],
      [],
    ),
  };
  if (result.spans.length === 0) delete result.spans;
  return result;
};

const structure = (data, levels, ignore?) => {
  let header = 0;
  let index = [];
  let inHeader = false;
  const titles = {};
  const chunks = {};
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
      const chunk = hash(url + index.slice(0, -1).join('.'));
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

const extractQuotes = (data, infos) =>
  data.map((d) => {
    if (!d.notes) return d;
    const spans = [...(d.spans || [])];
    const quoteSpans = [] as any[];
    let start;
    while (
      (start = d.content.slice(last(quoteSpans)?.end).indexOf('“')) !== -1
    ) {
      start += last(quoteSpans)?.end || 0;
      const end = start + d.content.slice(start).indexOf('”') + 1;
      quoteSpans.push({ start, end });
    }
    if (spans.some((s) => s.type === 'l')) {
      quoteSpans.push({ start: 0, end: d.content.length });
    }
    const notes = d.notes.filter((n) => {
      const i = quoteSpans.findIndex((x) => Math.abs(n.position - x.end) <= 1);
      if (i === -1) return true;
      const info = infos[d.index]?.[i];
      if (info === null) return true;
      const split = info?.split && n.content[0].content.indexOf(info.split);
      spans.push(
        ...quoteSpans.slice(i - (info?.extra || 0), i + 1).map((q) => ({
          ...q,
          type: 'q',
          content: split
            ? [
                joinContent(
                  sliceContent(n.content[0], 0, split),
                  info.split.slice(0, -1),
                  '.',
                ),
              ]
            : n.content,
        })),
      );
      if (split) {
        n.content = [
          trimContent(sliceContent(n.content[0], split + info.split.length)),
          ...n.content.slice(1),
        ];
        n.content[0].content = capitalise(n.content[0].content);
        return true;
      }
    });
    const res = { ...d, spans, notes };
    if (res.spans.length === 0) delete res.spans;
    if (res.notes.length === 0) delete res.notes;
    return res;
  });

export default (data) => {
  const { content, outline } = structure(
    data.slice(
      0,
      data.findIndex((d) => d.content === 'Notes'),
    ),
    [0, 0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1],
    // (t) => isNumber(t),
  );
  return {
    content: extractQuotes(content, {
      '1.1.1': { 1: { extra: 1 } },
      '1.3.1.14': { 1: null },
      '1.3.1.56': { 4: null },
      '1.3.1.65': { 0: { split: ';' } },
      '1.3.1.73': { 0: null },
      '1.3.1.108': { 0: { split: '.' } },
      '1.4.3': { 1: null },
      '1.5.3.11': { 2: null },
      '1.6.2': { 0: { split: '.' } },
      '1.6.15': { 0: { split: 'í.' } },
      '1.6.20': { 2: null },
      '1.6.37': { 0: { split: '.' } },
      '1.6.68': { 0: { split: '.' } },
    }),
    outline,
  };
};
