import * as fs from 'fs-extra';
import * as PDFParser from 'pdf2json';

import { stringify } from '../util';

import parsePdf from './pdf';
import scrape from './scrape';
import structure from './structure';

const spellings = require('../spellings.json');
const spellKeys = Object.keys(spellings);

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

(async () => {
  const files = (await fs.readdir('./src/books')).map(f => f.slice(0, -3));
  await fs.ensureDir('./data/parsed');
  await Promise.all(
    files.map(async f => {
      const config = require(`../books/${f}`).config;
      if (config.url.endsWith('.pdf')) {
        await new Promise(resolve => {
          const pdfParser = new PDFParser();
          pdfParser.on('pdfParser_dataReady', async data => {
            await fs.writeFile(
              `./data/parsed/${f}.json`,
              stringify(parsePdf(data, config.start, config.end)),
            );
            resolve();
          });
          pdfParser.loadPDF(`./data/downloaded/${f}.pdf`);
        });
      } else {
        const html = await fs.readFile(`./data/downloaded/${f}.html`, 'utf8');
        const parsed = structure(
          scrape(html, config.classes),
          config.start,
          config.end,
          config.smallBreak,
        );
        const spelled = spellKeys.reduce(
          (res, k) =>
            res.replace(new RegExp(`\\b${k}\\b`, 'ig'), m =>
              m[0].toUpperCase() === m[0]
                ? capitalize(spellings[k])
                : spellings[k],
            ),
          stringify(parsed),
        );
        await fs.writeFile(`./data/parsed/${f}.json`, spelled);
      }
    }),
  );
})();
