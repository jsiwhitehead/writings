import { fromJs, toJs } from 'maraca';
import * as webfont from 'webfontloader';

webfont.load({
  google: { families: ['PT+Serif:400,700'] },
});

const data = require('../../data/data.json');

export default {
  '@': [
    emit => {
      let count = 1;
      let interval;
      return value => {
        if (interval) clearInterval(interval);
        if (value) {
          const inc = toJs(value);
          if (typeof inc === 'number') {
            emit(fromJs(count++));
            interval = setInterval(() => emit(fromJs(count++)), inc * 1000);
          } else {
            emit(fromJs(null));
          }
        }
      };
    },
  ],
  '#': {
    data: fromJs(
      data.filter(
        d =>
          d.name &&
          ['The Hidden Words: Part One', 'The Hidden Words: Part Two'].includes(
            d.name.content,
          ),
      ),
    ),
    tick: emit => {
      let count = 1;
      emit(fromJs(count++));
      const interval = setInterval(() => emit(fromJs(count++)), 1000);
      return () => clearInterval(interval);
    },
  },
};
