import * as fs from 'fs-extra';
import maraca from 'maraca';

const toJson = (data, simple = false) => {
  if (data.type === 'value') return data.value;
  const values = {};
  Object.keys(data.value.values).forEach((k) => {
    const { key, value } = data.value.values[k];
    if (!k) {
      const v = toJson(value);
      if (typeof v === 'string') {
        for (const t of v.split(' ')) values[t] = 1;
      }
    } else {
      values[key.value] = toJson(value, true);
    }
  });
  const result = { indices: data.value.indices.map((d) => toJson(d)), values };
  if (simple) {
    if (result.indices.length === 0) return result.values;
    if (Object.keys(result.values).length === 0) return result.indices;
  }
  return result;
};

const flattenDocument = (data) => {
  const items = [] as any[];
  const titles = { 1: { content: data.values.title } };
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
        if (values.title) {
          titles[newBase.index.join('.')] = { content: values.title };
        }
        const newContent =
          indices.every(
            (d) =>
              typeof d === 'string' ||
              Object.keys(d.values).filter((k) => !['i', 'b', 'q'].includes(k))
                .length === 0,
          ) &&
          indices.some(
            (d) =>
              typeof d !== 'string' && ['i', 'b', 'q'].some((k) => d.values[k]),
          );
        if (newContent) items.push({ content: '', ...newBase });
        indices.forEach((d, i) => walk(d, i, newBase, newContent));
      }
    }
  };
  data.indices.forEach((d, i) => walk(d, i));
  return { ...data.values, titles, items };
};

(async () => {
  const files = (await fs.readdir('./writings')).map((f) => f.slice(0, -3));
  await fs.ensureDir('./data/flattened');
  await Promise.all(
    files.map(async (f) => {
      const data = toJson(
        maraca(await fs.readFile(`./writings/${f}.ma`, 'utf8')),
      );
      await fs.writeFile(
        `./data/flattened/${f}.json`,
        JSON.stringify(
          data.values.documents
            ? data.indices.map(flattenDocument)
            : flattenDocument(data),
          null,
          2,
        ),
      );
    }),
  );
})();
