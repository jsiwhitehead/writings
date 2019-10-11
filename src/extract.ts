import * as fs from 'fs-extra';

import { stringify } from './util';

(async () => {
  const files = (await fs.readdir('./src/books')).map(f => f.slice(0, -3));
  await fs.ensureDir('./data/extracted');
  const all = {};
  await Promise.all(
    files.map(async f => {
      const parsed = await fs.readFile(`./data/parsed/${f}.json`, 'utf8');
      const func = require(`./books/${f}`).default;
      const extracted = func(JSON.parse(parsed));
      all[f] = extracted;
      await fs.writeFile(`./data/extracted/${f}.json`, stringify(extracted));
    }),
  );
  await fs.writeFile(
    `./data/extracted.json`,
    stringify(files.map(f => all[f])),
  );
})();
