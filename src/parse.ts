import * as fs from 'fs-extra';
import * as unified from 'unified';
import * as rehype from 'rehype-parse';

import { capitalise, last, stringify } from './utils';

const elements = {
  tags: {
    h1: 'header',
    h2: 'header',
    h3: 'header',
    h4: 'header',
    h5: 'header',
    h6: 'header',
    a: 'ignore',
    sup: 'note',
    p: 'p',
    blockquote: 'p',
    hr: 'p',
    u: 'u',
    em: 'i',
    i: 'i',
    strong: 'b',
    b: 'b',
  },
  classes: {
    'brl-global-gloss-definition': 'block',
    'brl-subtitle': 'header',
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
  const classes = node.properties.className || [];
  if (classes.includes('brl-topmargin')) result.above += 1;
  if (classes.includes('brl-btmmargin')) result.below += 1;
  return result;
};

const spellings = require('./spellings.json');
const spellKeys = Object.keys(spellings);
const correctSpelling = (s) =>
  spellKeys.reduce(
    (res, k) =>
      res.replace(new RegExp(`\\b${k}\\b`, 'ig'), (m) =>
        m[0].toUpperCase() === m[0] ? capitalise(spellings[k]) : spellings[k],
      ),
    s,
  );

const parse = (data) => {
  const notes = {};
  const walk = (items, children, output) =>
    children.forEach((node) => {
      if (node.type === 'text') {
        if (output) last(last(items).content).content += node.value;
      } else if (node.type === 'element') {
        const note = getNoteId(node);
        if (note) {
          notes[note] = walkFull(node.children, {
            gap: 0,
            content: [{ content: '' }],
          });
        } else {
          const type = [
            elements.tags[node.tagName],
            ...(node.properties.className || []).map(
              (c) => elements.classes[c],
            ),
          ]
            .filter((x) => x)
            .sort((a, b) => b.length - a.length)[0];
          if (type !== 'ignore') {
            const gaps = getGaps(node);
            if (gaps.above) last(items).gap += gaps.above;
            if (['p', 'block', 'header'].includes(type)) {
              const item = { gap: 0, content: [{ content: '' }] } as any;
              if (type !== 'p') item.type = type;
              items.push(item);
              walk(items, node.children, true);
              items.push({ gap: 0, content: [{ content: '' }] });
            } else if (type === 'note') {
              last(items).content.push(
                { type, content: node.children[0].properties.href.slice(1) },
                { content: '' },
              );
            } else if (type) {
              last(items).content.push({ type, content: '' });
              walk(items, node.children, output);
              last(items).content.push({ content: '' });
            } else {
              walk(items, node.children, output);
            }
            if (gaps.below) last(items).gap += gaps.below;
          }
        }
      }
    });
  const walkFull = (children, first?) => {
    const items = first ? [first] : [];
    walk(items, children, false);
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].gap > 1) {
        items.splice(i + 1, 0, { type: 'header' });
      }
      delete items[i].gap;
    }
    return items
      .map((x) => {
        if (!x.content) return x;
        const result = { ...x, spans: [], notes: [], content: '' };
        x.content.forEach((c) => {
          const start = result.content.length;
          if (c.type === 'note') {
            result.notes.push({ position: start, id: c.content });
          } else {
            result.content += correctSpelling(c.content).replace(/\-/g, '‑');
            result.content = result.content.replace(/\s+/g, ' ').trimLeft();
            if (c.type) {
              const end = result.content.length;
              result.spans.push({ start, end, type: c.type });
            }
          }
        });
        result.content = result.content.trimRight();
        result.spans = result.spans.map(({ start, end, type }) => ({
          start: Math.min(start, result.content.length),
          end: Math.min(end, result.content.length),
          type,
        }));
        result.notes = result.notes.map(({ position, id }) => ({
          position: Math.min(position, result.content.length),
          id,
        }));
        if (!result.spans.length) delete result.spans;
        if (!result.notes.length) delete result.notes;
        return result;
      })
      .filter((x) => x.content !== '');
  };
  return walkFull(data).map((x) =>
    x.notes
      ? {
          ...x,
          notes: x.notes.map(({ position, id }) => ({
            position,
            content: notes[id],
          })),
        }
      : x,
  );
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
      await fs.writeFile(`./data/parsed/${f}.json`, stringify(data));
    }),
  );
})();
