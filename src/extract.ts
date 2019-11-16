import * as fs from 'fs-extra';

import { flatten, stringify } from './util';

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

  const messages = JSON.parse(
    await fs.readFile(`./data/parsed/messages.json`, 'utf8'),
  );
  const messageKeys = Object.keys(messages).sort();
  const messageResults = messageKeys.map(k => {
    const { data, ...info } = messages[k];
    const content = data
      .map((n, i) => {
        const prev = data[i - 1];
        if (prev) {
          n.content.unshift(
            prev.info[1][0] !== n.info[1][0]
              ? { header: 3, ...n.info[1][1] }
              : { divide: true },
          );
        }
        return n;
      })
      .reduce((res, n) => [...res, ...n.content], []);
    return {
      type: 'Message',
      author: 'The Universal House of Justice',
      key: k,
      ...info,
      content: content,
    };
  });
  await fs.writeFile(
    `./data/extracted/messages.json`,
    stringify(messageResults),
  );

  await fs.writeFile(
    `./data/extracted.json`,
    stringify(flatten([...files.map(f => all[f]), ...messageResults])),
  );
})();
