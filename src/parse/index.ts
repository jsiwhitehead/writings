import * as fs from 'fs-extra';
import * as PDFParser from 'pdf2json';

import { stringify } from '../util';

import parsePdf from './pdf';
import scrape from './scrape';
import structure from './structure';

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
          scrape(html, config.classes, config.titleJoin),
          config.start,
          config.end,
          config.smallBreak,
          config.titleJoin,
        );
        await fs.writeFile(`./data/parsed/${f}.json`, stringify(parsed));
      }
    }),
  );
})();
