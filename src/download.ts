import fetch from 'node-fetch';
import * as fs from 'fs-extra';

(async () => {
  const files = (await fs.readdir('./src/books')).map(f => f.slice(0, -3));
  await fs.ensureDir('./data/downloaded');
  await Promise.all(
    files.map(async f => {
      const config = require(`./books/${f}`).config;
      if (config.url.endsWith('.pdf')) {
        const pdf = await (await fetch(config.url)).arrayBuffer();
        await fs.writeFile(`./data/downloaded/${f}.pdf`, Buffer.from(pdf));
      } else {
        const html = await (await fetch(config.url)).text();
        await fs.writeFile(
          `./data/downloaded/${f}.html`,
          (config.replace || []).reduce(
            (res, [a, b]) => res.replace(a, b),
            html,
          ),
        );
      }
    }),
  );

  const messageFiles = (
    await (
      await fetch(
        'https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/',
      )
    ).text()
  )
    .match(/id="([^"]*)" class="document-row"/g)!
    .map(s => s.slice(4, 16));
  const messages = {};
  for (const m of messageFiles) {
    const html = await (
      await fetch(
        `https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/${m}/${m}.xhtml`,
      )
    ).text();
    messages[m] = html;
  }
  await fs.writeFile(
    `./data/downloaded/messages.json`,
    JSON.stringify(messages),
  );
})();
