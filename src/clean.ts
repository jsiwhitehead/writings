import * as fs from 'fs-extra';
import * as distance from 'js-levenshtein';

import { flatten, stringify } from './util';

(async () => {
  const data = JSON.parse(await fs.readFile('./data/extracted.json', 'utf8'))
    .map(d => {
      const text = d.content
        .map(c => c.content)
        .filter(s => s)
        .map(s =>
          s
            .toLowerCase()
            .replace(/\(.+\)/g, '')
            .replace(/[^a-z…]/g, ''),
        );
      const length = text.reduce((res, s) => res + s.length, 0);
      return {
        ...d,
        text,
        length,
        combined: length < 20000 && text.join(''),
        chunks:
          (['Prayer', 'Tablet'].includes(d.type) || d.excerpt) &&
          flatten(
            text.map(s =>
              flatten(
                s.split('…').map(s =>
                  Array.from({
                    length: Math.ceil(s.length / 20),
                  }).map((_, i) => s.slice(i * 20, (i + 1) * 20)),
                ),
              ),
            ),
          ),
      };
    })
    .sort((a, b) => b.length - a.length);

  data.forEach((a, i) => {
    data.slice(i + 1).forEach(b => {
      if (
        ['Prayer', 'Tablet'].includes(a.type) &&
        ['Prayer', 'Tablet'].includes(b.type) &&
        a.author === b.author &&
        !a.part &&
        !b.part &&
        a.combined &&
        b.combined
      ) {
        const ratio = Math.abs(a.length - b.length) / (a.length + b.length);
        if (ratio < 0.1) {
          if (
            a.combined === b.combined ||
            distance(a.combined, b.combined) / (a.length + b.length) < 0.1
          ) {
            const k = data.indexOf(b);
            data[i] = { ...data[k], ...data[i] };
            data[i].categories = {
              ...(data[k].categories || {}),
              ...(data[i].categories || {}),
            };
            if (Object.keys(data[i].categories).length === 0) {
              delete data[i].categories;
            }
            data.splice(k, 1);
          }
        }
      }
    });
  });

  data.forEach((a, i) => {
    data.slice(i + 1).forEach(b => {
      if (
        a.author === b.author &&
        b.excerpt &&
        b.chunks.filter(s => a.text.some(x => x.includes(s))).length /
          b.chunks.length >
          0.5
      ) {
        data.splice(data.indexOf(b), 1);
      }
    });
  });

  await fs.writeFile(
    `./data/data.json`,
    stringify(data.map(({ excerpt, text, combined, chunks, ...d }) => d)),
  );
})();
