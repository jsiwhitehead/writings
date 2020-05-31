import { fromJs, resolve, streamMap } from 'maraca';
import * as webfont from 'webfontloader';

import parseColor from './color';

webfont.load({
  google: { families: ['PT+Serif:400,700'] },
});

const data = require('../../data/flattened/50-100.json');

const process = (data) => {
  const titles = { ...data.titles };
  const items = [] as any[];
  data.items.forEach((x) => {
    const all = Object.keys(titles).filter((t) =>
      x.index.join('.').startsWith(t),
    );
    all
      .sort((a, b) => a.length - b.length)
      .forEach((t) => {
        items.push({ title: true, index: t.split('.'), content: titles[t] });
        delete titles[t];
      });
    items.push(x);
  });
  return { ...data, items };
};

// const last = (x) => x[x.length - 1];

// const nest = (data) => {
//   const items = [] as any[];
//   data.items.forEach((x) => {
//     if (!(x.quote || x.list)) {
//       items.push(x);
//     } else {
//       const current = last(items);
//       if (!Array.isArray(current)) items.push([]);
//       const prev = last(last(items));
//       if (
//         !prev ||
//         (prev.list && prev.list === x.list) ||
//         (prev.quote && prev.quote === x.quote)
//       ) {
//         last(items).push(x);
//       } else {
//         items.push([x]);
//       }
//     }
//   });
//   return { ...data, items };
// };

const map = (func) =>
  fromJs((x) => streamMap((get) => fromJs(func(resolve(x, get)))));

export default {
  data: fromJs(process(data)),
  hcl: map((color) => parseColor(color.type === 'value' ? color.value : '')),
};
