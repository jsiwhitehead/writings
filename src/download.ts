import fetch from 'node-fetch';
import * as fs from 'fs-extra';

(async () => {
  const files = (await fs.readdir('./src/books')).map(f => f.slice(0, -3));
  await fs.ensureDir('./data/downloaded');
  await Promise.all(
    files.map(async f => {
      const config = require(`./books/${f}`).config;
      const html = await (await fetch(config.url)).text();
      await fs.writeFile(
        `./data/downloaded/${f}.html`,
        (config.replace || []).reduce((res, [a, b]) => res.replace(a, b), html),
      );
    }),
  );
})();
