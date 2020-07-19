import { fromJs, print, resolve, streamMap, toJs } from 'maraca';
import * as webfont from 'webfontloader';

import parseColor from './color';

webfont.load({
  google: { families: ['PT+Serif:400,700'] },
});

const data = require('../../data/structured/call-divine-beloved.json');
// call-divine-beloved
// days-remembrance

const nestContent = (content, spans = [] as any[]) => {
  const sorted = spans.sort((a, b) => a.start - b.start);
  const result = sorted.reduce(
    (res, { start, end, ...info }, i) => [
      ...res,
      {
        content: content.slice(
          i === 0 ? 0 : sorted[i - 1].end ?? sorted[i - 1].start,
          start,
        ),
      },
      ...(info.type === 'quote'
        ? info.content.reduce(
            (r, c, i) => [
              ...r,
              ...nestContent(c.content, c.spans).map((x) => ({
                ...(i % 2 === 0 ? info : {}),
                ...x,
              })),
            ],
            [],
          )
        : [{ ...info, content: content.slice(start, end ?? start) }]),
    ],
    [],
  );
  result.push({
    content: sorted.length
      ? content.slice(
          sorted[sorted.length - 1].end ?? sorted[sorted.length - 1].start,
        )
      : content,
  });
  return result.filter((x) => x.content || x.type === 'break');
};

const nestOutline = ({ title, content, text }) => ({
  title: title?.map((x) => nestContent(x.content, x.spans)),
  content: content?.map((x) => nestOutline(x)),
  text,
});

// const loadData = async () => {
//   const files = (await fs.readdir('./src/books')).map((f) => f.slice(0, -5));
//   const data = await Promise.all(
//     files.map(async (f) =>
//       JSON.stringify(await fs.readFile(`./data/structured/${f}.json`, 'utf8')),
//     ),
//   );
//   return data;
// };

const map = (func) =>
  fromJs((x) => streamMap((get) => fromJs(func(resolve(x, get)))));

const nestedOutline = nestOutline(data.outline);

const flattenOutline = ({ content, ...outline }) => [
  outline,
  ...(content
    ? content.reduce((res, c) => [...res, ...flattenOutline(c)], [] as any)
    : outline.title
    ? [{ text: outline.text }]
    : []),
];

export default {
  outline: fromJs(nestedOutline),
  data: fromJs(
    data.content.map((x) => ({
      ...x,
      content: nestContent(x.content, x.spans),
    })),
  ),
  hcl: map((color) => parseColor(toJs(color, 'string'))),
  simple: map((s) =>
    (toJs(s, 'string') || '').replace(/\s+/g, '-').toLowerCase(),
  ),
  startswith: map((x) => {
    const [a, b] = toJs(x, ['string']);
    return a.startsWith(b);
  }),
  print: map((x) => print(x, (a) => a)),
  smooth: fromJs((x) => (set, get) => {
    let current;
    let timeout;
    return () => {
      const v = resolve(x, get).value;
      if (v !== current) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          set(fromJs(current));
          timeout = null;
        }, 25);
      }
      current = v;
    };
  }),
  split: map((x) => toJs(x, 'string').split('.')),
  getContent: map((x) => {
    const index = toJs(x, ['number']);
    const subset = index
      .slice(1)
      .reduce((res, i) => res.content[i - 1], nestedOutline);
    return flattenOutline(subset);
  }),
};
