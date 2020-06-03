import { fromJs, resolve, streamMap } from 'maraca';
import * as webfont from 'webfontloader';
import { arabToRoman } from 'roman-numbers';

import parseColor from './color';

webfont.load({
  google: { families: ['PT+Serif:400,700'] },
});

const data = require('../../data/flattened/50-100.json');

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

const process = (data) => {
  const titles = { ...data.titles };
  const items = [] as any[];
  data.items.forEach((x, i) => {
    const itemTitles = Object.keys(titles)
      .filter((t) => x.index.join('.').startsWith(t))
      .sort((a, b) => a.length - b.length);

    const change = getIndexChange(data.items[i - 1]?.index, x.index);
    if (change === 0) {
      items.push({
        title: true,
        index: x.index.slice(0, 1),
        content: nestContent(arabToRoman(x.index[0])),
      });
    }
    if (x.index[0] === 1 && change === 1) {
      items.push({
        title: true,
        index: x.index.slice(0, 2),
        align: 'center',
        content: nestContent('⭑'),
      });
    }

    itemTitles.forEach((t) => {
      items.push({
        title: true,
        index: t.split('.'),
        content: nestContent(titles[t].content),
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
  data: fromJs(process(data)),
  hcl: map((color) => parseColor(color.type === 'value' ? color.value : '')),
};
