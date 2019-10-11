import * as fs from 'fs-extra';

import { stringify } from '../util';

import scrape from './scrape';
import structure from './structure';

(async () => {
  const files = (await fs.readdir('./src/books')).map(f => f.slice(0, -3));
  await fs.ensureDir('./data/parsed');
  await Promise.all(
    files.map(async f => {
      const config = require(`../books/${f}`).config;
      const html = await fs.readFile(`./data/downloaded/${f}.html`, 'utf8');
      const parsed = structure(
        scrape(html, config.classes),
        config.start,
        config.end,
        config.smallBreak,
      );
      await fs.writeFile(`./data/parsed/${f}.json`, stringify(parsed));
    }),
  );
})();
