import * as fs from 'fs-extra';

const stringify = (x = null as any, ...content) => {
  if (Array.isArray(x)) {
    return `[${x.map((y) => stringify(y, ...content)).join(', ')}]`;
  }
  if (x === null || typeof x !== 'object') {
    return JSON.stringify(x);
  }
  const keys = [
    ...Object.keys(x)
      .filter((k) => !content.includes(k))
      .sort(),
    ...content,
  ];
  return `{ ${keys
    .filter((k) => x[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}: ${stringify(x[k], ...content)}`)
    .join(', ')} }`;
};

export default async (read, write, map) => {
  const files = (await fs.readdir('./src/books')).map((f) => f.slice(0, -5));
  await fs.emptyDir(`./data/${write}`);
  await Promise.all(
    files.map(async (f) => {
      const config = require(`./books/${f}.json`);
      const data = await fs.readFile(
        `./data/${read}/${f}.${read === 'downloaded' ? 'html' : 'json'}`,
        'utf8',
      );
      await fs.writeFile(
        `./data/${write}/${f}.json`,
        stringify(
          map(read === 'downloaded' ? data : JSON.parse(data), config),
          'spans',
          'text',
          'content',
          'source',
        ),
      );
    }),
  );
};
