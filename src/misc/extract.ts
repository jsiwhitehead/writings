// import * as fs from 'fs-extra';

// import { stringify } from './utils';

// (async () => {
//   const files = (await fs.readdir('./src/books')).map((f) => f.slice(0, -3));
//   await fs.ensureDir('./data/extracted');
//   await Promise.all(
//     files.map(async (f) => {
//       const map = require(`./books/${f}`).default;
//       const data = JSON.parse(
//         await fs.readFile(`./data/parsed/${f}.json`, 'utf8'),
//       );
//       await fs.writeFile(`./data/extracted/${f}.json`, stringify(map(data)));
//     }),
//   );
// })();
