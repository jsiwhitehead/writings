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
      const titles = {};
      const walk = (
        data,
        index = 0,
        base = { index: [] } as any,
        inContent = false,
      ) => {
        if (inContent) {
          if (typeof data === 'string') {
            items[items.length - 1].content += data;
          } else {
            const { indices, values } = data;
            const span = {
              start: items[items.length - 1].content.length,
              ...values,
            };
            indices.forEach((d, i) => walk(d, i, values, true));
            span.end = items[items.length - 1].content.length;
            items[items.length - 1].spans = items[items.length - 1].spans || [];
            items[items.length - 1].spans.push(span);
          }
        } else {
          if (typeof data === 'string') {
            items.push({
              content: data,
              ...base,
              index: [...base.index, index + 1],
            });
          } else {
            const { indices, values } = data;
            const newBase = {
              ...base,
              ...values,
              index: [...base.index, index + 1],
              list: (base.list || 0) + (values.list || 0),
            };
            delete newBase.title;
            if (!newBase.list) delete newBase.list;
            if (values.title) titles[newBase.index.join('.')] = values.title;
            const newContent =
              Object.keys(values).length === 0 &&
              indices.every(
                (d) =>
                  typeof d === 'string' ||
                  Object.keys(d.values).filter(
                    (k) => !['i', 'b', 'q'].includes(k),
                  ).length === 0,
              ) &&
              indices.some(
                (d) =>
                  typeof d !== 'string' &&
                  ['i', 'b', 'q'].some((k) => d.values[k]),
              );
            if (newContent) items.push({ content: '', ...newBase });
            indices.forEach((d, i) => walk(d, i, newBase, newContent));
          }
        }
      };
      data.indices.forEach((d, i) => walk(d, i));

      await fs.writeFile(
        `./data/flattened/${f}.json`,
        JSON.stringify({ ...data.values, titles, items }, null, 2),
      );
    }),
  );
})();
