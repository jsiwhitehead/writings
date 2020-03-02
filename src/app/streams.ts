import { fromJs } from 'maraca';
import * as webfont from 'webfontloader';

import parseColor from './color';
import { split, isInteger, isNumber, toNumber } from './utils';

webfont.load({
  google: { families: ['PT+Serif:400,700'] },
});

const data = require('../../data/data.json');

const mapArrays = x => {
  if (Array.isArray(x))
    return x.map((y, i) => ({ key: i + 1, value: mapArrays(y) }));
  if (Object.prototype.toString.call(x) === '[object Object]') {
    return Object.keys(x).reduce(
      (res, k) => ({ ...res, [k]: mapArrays(x[k]) }),
      {},
    );
  }
  return x;
};

const map = func => fromJs(emit => x => x && emit(fromJs(func(x))));

export default {
  data: fromJs(
    mapArrays(
      data.filter(
        d =>
          d.name &&
          ['The Hidden Words: Part One', 'The Hidden Words: Part Two'].includes(
            d.name.content,
          ),
      ),
    ),
  ),
  tick: emit => {
    let count = 1;
    emit(fromJs(count++));
    const interval = setInterval(() => emit(fromJs(count++)), 1000);
    return () => clearInterval(interval);
  },
  floor: map(value => Math.floor(toNumber(value.value))),
  ceil: map(value => Math.ceil(toNumber(value.value))),
  parseDirs: map(value => {
    const parts = split(value.type === 'value' ? value.value : '');
    return {
      1: parts[0] || 0,
      2: parts[3] || parts[1] || parts[0] || 0,
      3: parts[2] || parts[0] || 0,
      4: parts[1] || parts[0] || 0,
    };
  }),
  px: map(value => {
    if (value.type === 'value') return null;
    return value.value
      .toPairs()
      .map(x => (x.value.type === 'value' ? x.value.value : ''))
      .filter(x => x)
      .map(x => `${x}px`)
      .join(' ');
  }),
  parseColor: map(color =>
    parseColor(color.type === 'value' ? color.value : ''),
  ),
  parseStyle: map(style => {
    // bullet
    // result.display = 'list-item';
    // result.listStylePosition = 'inside';

    const result = {} as any;
    const numbers = [] as number[];
    const parts = split(style.type === 'value' ? style.value : '').filter(p => {
      if (isNumber(p)) {
        const n = toNumber(p);
        numbers.push(n);
      } else if (p === 'normal') {
        result.fontWeight = 'normal';
        result.fontStyle = 'normal';
      } else if (p === 'bold') {
        result.fontWeight = 'bold';
      } else if (p === 'italic') {
        result.fontStyle = 'italic';
      } else if (['center', 'left', 'right'].includes(p)) {
        result.textAlign = p;
      } else if (p === 'strike') {
        result.textDecoration = 'line-through';
      } else if (p === 'exact') {
        result.whiteSpace = 'pre';
      } else if (['bullet', 'hidden', 'flow'].includes(p)) {
        result[p] = true;
      } else {
        return true;
      }
    });
    if (numbers.length > 0) {
      const [size, height] = numbers
        .sort((a, b) => a - b)
        .map(x => Math.round(x));
      result.size = size;
      if (height) result.height = height / size;
    }
    if (parts.length > 0) result.fontFamily = parts.join(' ');
    return result;
  }),
  parseSize: map(size => {
    const result = {} as any;
    split(size.type === 'value' ? size.value : '').forEach(p => {
      if (['left', 'middle', 'right', 'top', 'bottom'].includes(p)) {
        result.align = p;
      } else if (isNumber(p)) {
        const n = parseFloat(p);
        if (n <= 1) result.size = `${n * 100}%`;
        else result.size = `${n}px`;
      }
    });
    return result;
  }),
  parseCols: map(cols => {
    const result = {} as any;
    split(cols.type === 'value' ? cols.value : '').forEach(p => {
      if (p === 'all') result.cols = 'all';
      else if (p === 'equal') result.equal = true;
      else if (p === 'rows') result.cols = 'rows';
      else if (isInteger(p)) result.cols = toNumber(p);
    });
    if (result.equal) result.cols = result.cols || 'all';
  }),
};
