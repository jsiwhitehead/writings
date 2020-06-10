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
    'brl-margin-2': 'block',
    'brl-head': 'header',
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

const flatten = (spans, result) => {
  spans.forEach((s) => {
    const start = result.content.length;
    if (s.type === 'note') {
      result.spans.push({ type: 'note', start, id: s.text });
    } else {
      if (s.type === 'q') {
        flatten(s.content, result);
      } else {
        result.content += correctSpelling(s.text).replace(/\-/g, '‑');
        result.content = result.content.replace(/\s+/g, ' ').trimLeft();
      }
      if (s.type) {
        const end = result.content.length;
        result.spans.push({ start, end, type: s.type });
      }
    }
  });
};

const parse = (data) => {
  const notes = {};
  const walk = (items, children, paragraph?) =>
    children.forEach((node) => {
      if (node.type === 'text') {
        if (paragraph) last(last(items).spans).text += node.value;
      } else if (node.type === 'element') {
        const note = getNoteId(node);
        if (note) {
          notes[note] = walkFull(node.children, {
            gap: 0,
            spans: [{ text: '' }],
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
              if (!paragraph || paragraph === 'p' || type !== 'p') {
                const item = { gap: 0, spans: [{ text: '' }] } as any;
                if (type !== 'p') item.type = type;
                items.push(item);
              }
              walk(
                items,
                node.children,
                type !== 'p' ? type : paragraph || type,
              );
              items.push({ gap: 0, spans: [{ text: '' }] });
            } else if (type === 'note') {
              last(items).spans.push(
                { type, text: node.children[0].properties.href.slice(1) },
                { text: '' },
              );
            } else if (type) {
              last(items).spans.push({ type, text: '' });
              walk(items, node.children, paragraph);
              last(items).spans.push({ text: '' });
            } else {
              walk(items, node.children, paragraph);
            }
            if (gaps.below) last(items).gap += gaps.below;
          }
        }
      }
    });
  const walkFull = (children, first?) => {
    const items = first ? [first] : [];
    walk(items, children);
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].gap > 1) {
        items.splice(i + 1, 0, { type: 'header' });
      }
      delete items[i].gap;
    }
    return items
      .map((x) => {
        if (!x.spans) return x;
        const spans = [] as any[];
        let quoteLevel = 0;
        x.spans
          .filter((c) => c.text)
          .forEach((s) => {
            let start = 0;
            let match;
            const regex = /“|”/g;
            while ((match = regex.exec(s.text)) !== null) {
              if (match[0] === '“') {
                if (++quoteLevel === 1) {
                  spans.push(
                    { ...s, text: s.text.slice(start, match.index) },
                    { type: 'q', content: [] },
                  );
                  start = match.index + 1;
                }
              } else {
                if (quoteLevel-- === 1) {
                  last(spans).content.push({
                    ...s,
                    text: s.text.slice(start, match.index),
                  });
                  start = match.index + 1;
                }
              }
            }
            if (quoteLevel === 1) {
              last(spans).content.push({
                ...s,
                text: s.text.slice(start),
              });
            } else {
              spans.push({ ...s, text: s.text.slice(start) });
            }
          });
        return { ...x, spans: spans.filter((s) => s.type === 'q' || s.text) };
      })
      .map((x) => {
        if (!x.spans) return x;
        const result = { type: x.type, content: '', spans: [] as any[] };
        flatten(x.spans, result);
        result.content = result.content.trimRight();
        result.spans = result.spans.map(({ start, end, ...other }) => ({
          start: Math.min(start, result.content.length),
          end: end && Math.min(end, result.content.length),
          ...other,
        }));
        if (!result.spans.length) delete result.spans;
        return result;
      })
      .filter((x) => x.content !== '');
  };
  return walkFull(data).map((x) => {
    if (!x.spans) return x;
    return {
      ...x,
      spans: x.spans.map((s) => {
        if (s.type !== 'note') return s;
        return { type: 'note', start: s.start, content: notes[s.id] };
      }),
    };
  });
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
      await fs.writeFile(`./data/parsed/${f}.json`, stringify(data, 'content'));
    }),
  );
})();
