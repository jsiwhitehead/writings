import { fromJs } from 'maraca';
import * as webfont from 'webfontloader';

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
};
