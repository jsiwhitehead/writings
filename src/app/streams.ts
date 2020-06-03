import { fromJs, resolve, streamMap } from 'maraca';
import * as webfont from 'webfontloader';
import { arabToRoman } from 'roman-numbers';

import parseColor from './color';

webfont.load({
  google: { families: ['PT+Serif:400,700'] },
});

const config = {
  file: '50-100',
  title: (index, change) => {
    if (change === 0) return arabToRoman(index[0]);
    if (index[0] === 1 && change === 1) return '⭑';
  },
  format: (level) => ({ center: level === 0 }),
};
// const config = {
//   file: 'frontiers-learning',
//   numbers: 2,
//   format: (level) => ({
//     center: level === 0,
//     caps: level <= 1,
//     italic: level >= 3,
//   }),
// };
// const config = {
//   file: 'learning-growth',
//   title: (index, change) => {
//     if (change === 0 && index[0] > 2) return arabToRoman(index[0] - 2);
//   },
//   format: (level) => ({
//     center: level <= 1,
//   }),
// };

const getIndexChange = (prev, next) => {
  if (!prev) return 0;
  return Array.from({ length: Math.max(prev.length, next.length) }).findIndex(
    (_, i) => prev[i] !== next[i],
  );
};

const nestContent = (content, spans = [] as any[]) => {
  const sorted = spans.sort((a, b) => a.start - b.start);
  const result = sorted.reduce(
    (res, { start, end, ...info }, i) => [
      ...res,
      { content: content.slice(i === 0 ? 0 : sorted[i - 1].end, start) },
      { ...info, content: content.slice(start, end) },
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

const process = (config) => {
  const data = require(`../../data/flattened/${config.file}.json`);
  const titles = { ...data.titles };
  const items = [] as any[];
  let baseIndex = [-1];
  data.items.forEach((x, i) => {
    const itemTitles = Object.keys(titles)
      .filter((t) => x.index.join('.').startsWith(t))
      .sort((a, b) => a.length - b.length);

    const change = getIndexChange(data.items[i - 1]?.index, x.index);
    if (change >= baseIndex.length) {
      Array.from({ length: change + 1 }).forEach((_, i) => {
        baseIndex[i] = baseIndex[i] || 0;
      });
    } else {
      baseIndex = baseIndex.slice(0, change + 1);
    }
    baseIndex[change]++;

    const titleContent = config.title?.(x.index, change);
    if (titleContent) {
      items.push({
        title: true,
        ...config.format?.(change),
        index: x.index.slice(0, change + 1),
        content: nestContent(titleContent),
      });
    }

    itemTitles.forEach((t) => {
      const index = t === '1' ? [] : t.split('.');
      items.push({
        title: true,
        ...config.format?.(index.length),
        index,
        content: [
          ...(index.length > 0 && index.length <= config.numbers
            ? [
                {
                  content: `${baseIndex.join('.')}${
                    baseIndex.length === 1 ? '.' : ''
                  } `,
                },
              ]
            : []),
          ...nestContent(titles[t].content),
        ],
      });
      delete titles[t];
    });
    items.push({ ...x, content: nestContent(x.content, x.spans) });
  });
  return { ...data, items };
};

const map = (func) =>
  fromJs((x) => streamMap((get) => fromJs(func(resolve(x, get)))));

export default {
  data: fromJs(process(config)),
  hcl: map((color) => parseColor(color.type === 'value' ? color.value : '')),
};
