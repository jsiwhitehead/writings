import fetch from 'node-fetch';
import * as fs from 'fs-extra';
// import * as unified from 'unified';
// import * as rehype from 'rehype-parse';

const findTable = (n) => {
  if (n.type === 'element' && n.tagName === 'tbody') return n;
  for (const c of n.children || []) {
    const res = findTable(c);
    if (res) return res;
  }
  return null;
};

(async () => {
  const files = (await fs.readdir('./src/books')).map((f) => f.slice(0, -3));
  await fs.ensureDir('./data/downloaded');
  await Promise.all(
    files.map(async (f) => {
      const { url, replace = [] } = require(`./books/${f}`);
      const html = await (await fetch(url)).text();
      await fs.writeFile(
        `./data/downloaded/${f}.html`,
        replace.reduce((res, [a, b]) => res.replace(a, b), html),
      );
    }),
  );

  // const table = findTable(
  //   unified()
  //     .use(rehype, { footnotes: true })
  //     .parse(
  //       await (
  //         await fetch(
  //           'https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/',
  //         )
  //       ).text(),
  //     ),
  // );
  // const messagesInfo = table.children
  //   .filter(
  //     (n) => n.type === 'element' && n.tagName === 'tr' && n.properties.id,
  //   )
  //   .map((r) => {
  //     const [date, addressed, summary] = r.children
  //       .filter((c) => c.type === 'element' && c.tagName === 'td')
  //       .map((c) => c.children[0].children[0].value);
  //     return {
  //       key: r.properties.id,
  //       date,
  //       addressed,
  //       summary,
  //     };
  //   });
  // const messages = {};
  // for (const { key, ...info } of messagesInfo) {
  //   const html = await (
  //     await fetch(
  //       `https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/${key}/${key}.xhtml`,
  //     )
  //   ).text();
  //   messages[key] = { html, ...info };
  // }
  // await fs.writeFile(
  //   `./data/downloaded/messages.json`,
  //   JSON.stringify(messages),
  // );
})();
