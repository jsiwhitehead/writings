import * as fs from 'fs-extra';
import maraca from 'maraca';

const toIndex = (v: string) => {
  const n = parseFloat(v);
  return !isNaN(v as any) && !isNaN(n) && n === Math.floor(n) && n > 0 && n;
};
const toJson = (data) => {
  if (data.type === 'value') return data.value;
  const result = { indices: [] as any[], values: {} };
  for (const { key, value } of data.value.toPairs()) {
    if (key.type === 'value') {
      const v = toJson(value);
      if (!key.value) for (const t of v.split(' ')) result.values[t] = 1;
      else if (toIndex(key.value)) result.indices.push(v);
      else result.values[key.value] = v;
    }
  }
  return result;
};

(async () => {
  // const files = (await fs.readdir('./src/books')).map((f) => f.slice(0, -3));
  const files = ['50-100'];
  await fs.ensureDir('./data/flattened');
  await Promise.all(
    files.map(async (f) => {
      const data = toJson(
        maraca(await fs.readFile(`./writings/${f}.ma`, 'utf8')),
      );

      const items = [] as any[];
      const walk = (
        data,
        index = 0,
        base = { title: [] } as any,
        content = false,
      ) => {
        if (typeof data === 'string') {
          items[items.length - 1].content += data;
        } else if (content) {
          const { indices, values } = data;
          const span = {
            start: items[items.length - 1].content.length,
            ...values,
          };
          indices.forEach((d, i) => walk(d, i, values, true));
          span.end = items[items.length - 1].content.length;
          items[items.length - 1].spans = items[items.length - 1].spans || [];
          items[items.length - 1].spans.push(span);
        } else {
          const { indices, values } = data;
          const newBase = {
            ...base,
            ...values,
            title: [...base.title, [index + 1, values.title].filter((x) => x)],
            list: (base.list || 0) + (values.list || 0),
          };
          if (!newBase.list) delete newBase.list;
          const newContent = indices.every(
            (d) =>
              typeof d === 'string' || ['i', 'b', 'q'].some((x) => d.values[x]),
          );
          if (newContent) items.push({ content: '', ...newBase });
          indices.forEach((d, i) => walk(d, i, newBase, newContent));
        }
      };
      data.indices.forEach((d, i) => walk(d, i));

      await fs.writeFile(
        `./data/flattened/${f}.json`,
        JSON.stringify({ ...data.values, items }, null, 2),
      );
    }),
  );
})();
