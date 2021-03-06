import * as unified from 'unified';
import * as rehype from 'rehype-parse';

import process from './process';
import { capitalise, last } from './utils';

const elements = {
  tags: {
    h1: 'header',
    h2: 'header',
    h3: 'header',
    h4: 'header',
    h5: 'header',
    h6: 'header',
    blockquote: 'block',
    a: 'ignore',
    sup: 'note',
    p: 'p',
    hr: 'p',
    u: 'u',
    em: 'i',
    i: 'i',
    strong: 'b',
    b: 'b',
  },
  classes: {
    'brl-global-gloss-definition': 'block',
    // 'brl-margin-2': 'block',
    'brl-head': 'header',
    'brl-subtitle': 'header',
    'brl-italic': 'i',
    'brl-align-center': 'c',
    'brl-align-right': 'r',
    'brl-linegroup': 'block',
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

const flattenQuotesWithNotes = (spans) => {
  const result = [] as any[];
  spans.forEach((s) => {
    if (s.type === 'quote' && s.spans.some((x) => x.type === 'note')) {
      result.push({ text: '“' }, ...s.spans, { text: '”' });
    } else {
      result.push(s);
    }
  });
  return result;
};

const parse = (data, extraGaps) => {
  const notes = {};
  let quoteCount = 0;
  let noteCount = 0;
  const walk = (items, children, paragraph?) =>
    children.forEach((node) => {
      if (node.type === 'text') {
        if (paragraph) last(last(items).spans).text += node.value;
      } else if (node.type === 'element') {
        const note = getNoteId(node);
        if (note) {
          notes[note] = walkFull(node.children, false, {
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
              noteCount++;
              last(items).spans.push(
                {
                  type,
                  text: node.children[0].properties.href.slice(1),
                  number: noteCount,
                },
                { text: '' },
              );
            } else if (type === 'l') {
              walk(items, node.children, paragraph);
              last(items).spans.push({ type: 'break' }, { text: '' });
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
  const walkFull = (children, withQuotes, first?) => {
    const items = first ? [first] : [];
    walk(items, children);
    for (let i = items.length - 1; i >= 0; i--) {
      if (
        items[i].gap > 1 ||
        extraGaps.includes(items[i].spans[0].text.trim())
      ) {
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
          .filter((c) => c.text !== '')
          .forEach((s) => {
            if (!s.text) {
              spans.push(s);
            } else {
              const text = correctSpelling(s.text)
                .replace(/\-/g, '‑')
                .replace(/\s+/g, ' ');
              let start = 0;
              if (withQuotes) {
                let match;
                const regex = /“|”/g;
                while ((match = regex.exec(text)) !== null) {
                  if (match[0] === '“') {
                    if (++quoteLevel === 1) {
                      quoteCount++;
                      spans.push(
                        { ...s, text: text.slice(start, match.index) },
                        { type: 'quote', spans: [], number: quoteCount },
                      );
                      start = match.index + 1;
                    }
                  } else {
                    if (quoteLevel-- === 1) {
                      last(spans).spans.push({
                        ...s,
                        text: text.slice(start, match.index),
                      });
                      start = match.index + 1;
                    }
                  }
                }
              }
              if (quoteLevel === 1) {
                last(spans).spans.push({
                  ...s,
                  text: text.slice(start),
                });
              } else {
                spans.push({ ...s, text: text.slice(start) });
              }
            }
          });
        const filtered = flattenQuotesWithNotes(spans).filter(
          (s) => s.type === 'quote' || s.text !== '',
        );
        const indices: any = filtered
          .map((s, i) => (s.type === 'break' || s.text === ' ' ? null : i))
          .filter((x) => x !== null);
        return {
          ...x,
          spans: filtered.slice(indices[0], last(indices) + 1),
        };
      })
      .filter((s) => s.spans?.length !== 0);
  };
  return walkFull(data, true).map((x) => {
    if (!x.spans) return x;
    return {
      ...x,
      spans: x.spans.map((s) => {
        if (s.type !== 'note') return s;
        return {
          type: 'note',
          start: s.start,
          content: notes[s.text].map((x) => x.spans),
          number: s.number,
        };
      }),
    };
  });
};

process('downloaded', 'parsed', (html, { gaps = [] }) => {
  const result = parse(unified().use(rehype).parse(html).children, gaps);
  let headerCount = 0;
  return result.map((x) => {
    if (x.type !== 'header') return x;
    headerCount++;
    return { ...x, number: headerCount };
  });
});
