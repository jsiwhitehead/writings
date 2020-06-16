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
  '2 Corinthians',
  'Kitáb‑i‑Íqán',
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
  } else if (/\d+/.test(parts[0])) {
    return parseInt(parts.shift(), 10);
  }
};
const parseRef = (parts) => {
  const result = [] as any[];
  let next;
  while ((next = parseSingleRef(parts))) result.push(next);
  return result.length <= 1 ? result[0] : result;
};

const parseSource = (spans, extra = '') => {
  const text =
    extra +
    spans
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
                .split(/\s*[.,;¶]\s*/g)
                .reduce(
                  (res, x) => [...res, ...x.split(/\s*(\d+:\s*\d+(?:–\d+)?)/g)],
                  [] as any[],
                ),
            ],
      [] as any[],
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
  'organised',
  (
    fullData,
    {
      quotes = {},
      skipNotes = [] as any[],
      sliceNotes = {},
      extraNotes = {},
      headers,
    },
  ) => {
    const data = fullData.slice(
      headers
        ? fullData.findIndex(
            (d) => d.type === 'header' && d.number === headers[0],
          )
        : 0,
      headers
        ? fullData.findIndex(
            (d) => d.type === 'header' && d.number === headers[1],
          )
        : undefined,
    );
    const combineQuotes = (spans) => {
      const result = [] as any[];
      let quoteRun = 0;
      spans.forEach((s, i) => {
        if (s.type === 'note') {
          result.push(s);
        } else if (s.type === 'quote') {
          if (quoteRun > 0) {
            last(result).content.push(s.spans);
          } else {
            quoteRun = quotes[s.number] || 1;
            result.push({ type: 'quote', content: [s.spans] });
          }
          quoteRun--;
        } else {
          if (quoteRun > 0) {
            if (spans[i - 1].type === 'quote') {
              last(result).content.push([]);
            }
            last(last(result).content).push(s);
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
                s.content[0],
                sliceNotes[s.number],
              );
              q.source = parseSource(source, extraNotes[s.number]);
              result.push({ ...s, content: [note] });
            } else {
              q.source = parseSource(s.content[0], extraNotes[s.number]);
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
          result.push(
            { text: '“' },
            ...s.content.reduce((res, s) => [...res, ...s], []),
            { text: '”' },
          );
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
            l.content[0],
            sliceNotes[l.number],
          );
          x.source = parseSource(source, extraNotes[l.number]);
          l.content[0] = note;
        } else {
          x.source = parseSource(
            x.spans.pop().content[0],
            extraNotes[l.number],
          );
        }
        delete x.source.number;
      }
      return {
        ...x,
        spans: removePlainQuotes(addSources(combineQuotes(x.spans))),
        number: undefined,
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
