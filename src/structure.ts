import { romanToArab } from 'roman-numbers';

import process from './process';
import { capitalise, last } from './utils';

const sliceNote = (spans, index) => ({
  source: [{ text: spans[0].text.slice(0, index) }],
  note: [{ text: capitalise(spans[0].text.slice(index)) }, ...spans.slice(1)],
});

const authors = [
  'Bahá’u’lláh',
  'Saná’í',
  'Rúmí',
  'Hátif‑i‑Iṣfahání',
  'Sa‘dí',
  'Ibn‑i‑Fáriḍ',
  '‘Aṭṭár',
  'Imám ‘Alí',
];
const books = [
  'Epistle to the Son of the Wolf',
  'God Passes By',
  'Gleanings from the Writings of Bahá’u’lláh',
  'Qur’án',
  'Ḥadíth',
  'Arabic proverb',
];

const parseSingleRef = (parts) => {
  if (['p', 'pp'].includes(parts[0])) {
    const p = parts.splice(0, 2)[1];
    if (/^\d+\s+(,|and)\s+\d+$/.test(p)) {
      return p.split(/\s+(?:,|and)\s+/).map((n) => parseInt(n, 10));
    } else if (/^\d+–\d+$/.test(p)) {
      let [start, end] = p.split('–');
      if (end.length < start.length) {
        end = start.slice(0, start.length - end.length) + end;
      }
      return { start: parseInt(start, 10), end: parseInt(end, 10) };
    }
    return parseInt(p, 10);
  } else if (/^\d+:\s*\d+/.test(parts[0])) {
    const p = parts.shift();
    if (p.includes('–')) {
      let [start, end] = p.split('–');
      if (end.length < start.length) {
        end = start.slice(0, start.length - end.length) + end;
      }
      return {
        start: start.split(':').map((n) => parseInt(n, 10)),
        end: end.split(':').map((n) => parseInt(n, 10)),
      };
    } else {
      return p.split(':').map((n) => parseInt(n, 10));
    }
  } else if (/^[MDCLXVI]+$/.test(parts[0])) {
    return romanToArab(parts.shift());
  } else if (/^¶ /.test(parts[0])) {
    return parseInt(parts.shift().slice(2), 10);
  }
};
const parseRef = (parts) => {
  const result = [] as any[];
  let next;
  while ((next = parseSingleRef(parts))) result.push(next);
  return result.length <= 1 ? result[0] : result;
};

const parseSource = (spans) => {
  const text = spans
    .map((s) => s.text)
    .join('')
    .replace(/from an?/gi, '')
    .replace(/prayer attributed to/gi, '')
    .replace(/attributed to/gi, '')
    .replace(/prayer of/gi, '')
    .replace(/poem of/gi, '')
    .trim();
  const parts = (text[text.length - 1] === '.' ? text.slice(0, -1) : text)
    .split(/\s*(\([^\)]*\))\s*/g)
    .reduce(
      (res, t, i) =>
        i % 2 === 1
          ? [...res, t]
          : [
              ...res,
              ...t
                .split(/[.,;]\s*/g)
                .reduce(
                  (res, x) => [...res, ...x.split(/\s*(\d+:\s*\d+(?:–\d+)?)/g)],
                  [],
                ),
            ],
      [],
    )
    .filter((t) => t);
  const cf = parts[0].toLowerCase() === 'cf' ? !!parts.shift() : undefined;
  const author = authors.includes(parts[0]) ? parts.shift() : undefined;
  const authorInfo = parts[0]?.[0] === '(' ? parts.shift() : undefined;
  const book = books.includes(parts[0]) ? parts.shift() : undefined;
  const bookInfo = parts[0]?.[0] === '(' ? parts.shift() : undefined;
  const ref = parseRef(parts);

  return {
    cf,
    author,
    authorInfo,
    book,
    bookInfo,
    ref,
    info: parts.length ? `${capitalise(parts[0])}.` : undefined,
  };
};

process(
  'parsed',
  'structured',
  (data, { quotes = {}, skipNotes = [] as any[], sliceNotes = {} }) => {
    const combineQuotes = (spans) => {
      const result = [] as any[];
      let quoteRun = 0;
      spans.forEach((s) => {
        if (s.type === 'note') {
          result.push(s);
        } else if (s.type === 'quote') {
          if (quoteRun > 0) {
            last(result).spans.push(...s.spans);
          } else {
            quoteRun = quotes[s.number] || 1;
            result.push(s);
          }
          delete s.number;
          quoteRun--;
        } else {
          if (quoteRun > 0) {
            const c = last(result).spans;
            if (last(c).type !== 'join') c.push({ type: 'join', spans: [] });
            last(c).spans.push(s);
          } else {
            result.push(s);
          }
        }
      });
      return result;
    };

    const addSources = (spans) => {
      const result = [] as any[];
      spans.forEach((s, i) => {
        if (s.type !== 'note') {
          result.push(s);
        } else {
          const q =
            !skipNotes.includes(s.number) &&
            spans
              .slice(i - 2, i)
              .reverse()
              .find((s) => s.type === 'quote');
          if (q) {
            if (sliceNotes[s.number]) {
              const { source, note } = sliceNote(
                s.content[0].spans,
                sliceNotes[s.number],
              );
              q.source = parseSource(source);
              result.push({ ...s, content: [{ spans: note }] });
            } else {
              q.source = parseSource(s.content[0].spans);
            }
          } else {
            result.push(s);
          }
          delete s.number;
        }
      });
      return result;
    };

    const removePlainQuotes = (spans) => {
      const result = [] as any[];
      spans.forEach((s) => {
        if (s.type === 'quote' && !s.source) {
          result.push({ text: '“' }, ...s.spans, { text: '”' });
        } else {
          result.push(s);
        }
      });
      return result;
    };

    const res = data.map((x) => {
      if (!x.spans) return x;
      const l = last(x.spans);
      if (
        x.type === 'block' &&
        l.type === 'note' &&
        !skipNotes.includes(l.number)
      ) {
        if (sliceNotes[l.number]) {
          const { source, note } = sliceNote(
            l.content[0].spans,
            sliceNotes[l.number],
          );
          x.source = parseSource(source);
          l.content[0].spans = note;
        } else {
          x.source = parseSource(x.spans.pop().content[0].spans);
        }
        delete x.source.number;
      }
      return {
        ...x,
        spans: removePlainQuotes(addSources(combineQuotes(x.spans))),
      };
    });
    // res.forEach((x) => {
    //   if (x.source) console.log(JSON.stringify(x.source, null, 2));
    //   x.spans?.forEach((s) => {
    //     if (s.source) console.log(JSON.stringify(s.source, null, 2));
    //   });
    // });
    return res;
  },
);
