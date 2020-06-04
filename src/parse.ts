import * as fs from 'fs-extra';
import * as unified from 'unified';
import * as rehype from 'rehype-parse';

const elements = {
  tags: {
    p: 'p',
    blockquote: 'p',
    hr: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    u: 'u',
    em: 'i',
    i: 'i',
    strong: 'b',
    b: 'b',
    a: 'ignore',
    sup: 'n',
  },
  classes: {
    'brl-margin-2': 'q',
    'brl-title': 'h2',
    'brl-head': 'h3',
    'brl-italic': 'i',
    'brl-align-center': 'c',
    'brl-align-right': 'r',
    'brl-linegroup': 'p',
    'brl-linegroupline': 'l',
  },
};

const findChild = (node, test) => {
  if (node.type !== 'element') return null;
  for (const c of node.children) {
    if (c.type === 'element' && test(c)) return c;
    const sub = findChild(c, test);
    if (sub) return sub;
  }
  return null;
};
const getNoteId = (node) => {
  if (
    node.tagName === 'li' &&
    !findChild(node, (x) => x.tagName === 'ul') &&
    findChild(node, (x) =>
      (x.properties.className || []).includes('brl-returntotext'),
    )
  ) {
    return findChild(
      node,
      (x) =>
        x.tagName === 'a' &&
        (x.properties.className || []).includes('brl-location') &&
        x.properties.id,
    ).properties.id;
  }
};

const getGaps = (node) => {
  const result = { above: node.tagName === 'hr' ? 5 : 0, below: 0 };
  if ((node.properties.className || []).includes('brl-topmargin')) {
    result.above += 1;
  }
  if ((node.properties.className || []).includes('brl-btmmargin')) {
    result.below += 1;
  }
  return result;
};

const parse = (data) => {
  const notes = {};
  const walk = (items, children, output) =>
    children.forEach((node) => {
      if (node.type === 'text') {
        if (output) {
          const last = items[items.length - 1].content;
          last[last.length - 1].content += node.value.replace(/\s+/g, ' ');
        }
      } else if (node.type === 'element') {
        const note = getNoteId(node);
        if (note) {
          notes[note] = walkFull(node.children, {
            type: 'p',
            gap: 0,
            content: [{ content: '' }],
          });
        } else {
          const type =
            elements.tags[node.tagName] ||
            (node.properties.className || [])
              .map((c) => elements.classes[c])
              .filter((x) => x)[0];
          if (type !== 'ignore') {
            const gaps = getGaps(node);
            if (gaps.above) items[items.length - 1].gap += gaps.above;
            if (['p', 'q', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(type)) {
              items.push({ type, gap: 0, content: [{ content: '' }] });
              walk(items, node.children, true);
            } else if (type === 'n') {
              items[items.length - 1].content.push(
                {
                  type,
                  content: node.children[0].properties.href.slice(1),
                },
                { content: '' },
              );
            } else if (type) {
              items[items.length - 1].content.push({ type, content: '' });
              walk(items, node.children, output);
              items[items.length - 1].content.push({ content: '' });
            } else {
              walk(items, node.children, output);
            }
            if (gaps.below) items[items.length - 1].gap += gaps.below;
          }
        }
      }
    });
  const walkFull = (children, first?) => {
    const items = first ? [first] : [];
    walk(items, children, false);
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].gap > 1) {
        items.splice(i + 1, 0, { type: 'divide' });
      }
      delete items[i].gap;
    }
    return items
      .map((x) => {
        if (x.type === 'divide') return x;
        const content = x.content.filter((y) => y.content.trim());
        if (content.length) {
          content[0].content = content[0].content.trimLeft();
          content[content.length - 1].content = content[
            content.length - 1
          ].content.trimRight();
        }
        return { ...x, content };
      })
      .filter((x) => x.type === 'divide' || x.content.length);
  };
  return { items: walkFull(data), notes };
};

(async () => {
  const files = (await fs.readdir('./src/books')).map((f) => f.slice(0, -3));
  await fs.ensureDir('./data/parsed');
  await Promise.all(
    files.map(async (f) => {
      const html = await fs.readFile(`./data/downloaded/${f}.html`, 'utf8');
      const data = parse(
        unified().use(rehype, { footnotes: true }).parse(html).children,
      );
      await fs.writeFile(
        `./data/parsed/${f}.json`,
        JSON.stringify(data, null, 2),
      );
    }),
  );
})();
