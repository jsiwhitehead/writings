import { fromJs, resolve, streamMap, toJs } from 'maraca';
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
      { ...info, content: content.slice(start, end ?? start) },
    ],
    [],
  );
  result.push({
    content: sorted.length
      ? content.slice(sorted[sorted.length - 1].end)
      : content,
  });
  return result.filter((x) => x.content);
};

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

export default {
  data: fromJs({
    outline: data.outline.map((x) => [
      x[0],
      Array.isArray(x[1])
        ? x[1].map((y) => nestContent(y.content, y.spans))
        : x[1],
    ]),
    content: data.content.map((x) => ({
      ...x,
      content: nestContent(x.content, x.spans),
    })),
  }),
  hcl: map((color) => parseColor(color.type === 'value' ? color.value : '')),
  simple: map((s) =>
    (toJs(s, 'string') || '').replace(/\s+/g, '-').toLowerCase(),
  ),
};
