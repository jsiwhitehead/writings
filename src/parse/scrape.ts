import * as unified from 'unified';
import * as rehype from 'rehype-parse';

const findChild = (node, test) => {
  if (node.type !== 'element') return null;
  for (const c of node.children) {
    if (c.type === 'element' && test(c)) return c;
    const sub = findChild(c, test);
    if (sub) return sub;
  }
  return null;
};

const config = {
  tags: {
    p: { paragraph: true },
    blockquote: { paragraph: true },
    h2: { header: 1 },
    h3: { header: 2 },
    h4: { header: 3 },
    hr: { above: 5 },
    u: { u: true },
    em: { i: true },
    i: { i: true },
    strong: { b: true },
    b: { b: true },
    a: { ignore: true },
  },
  classes: {
    'brl-global-instructions': { block: true, i: true },
    'brl-linegroup': { block: true },
    'brl-global-gloss-definition': { block: true },
    'brl-global-verse': { block: true },
    'brl-margin-1': { block: true },
    'brl-margin-2': { block: true },
    'brl-margin-3': { block: true },
    'brl-margin-4': { block: true },
    'brl-margin-5': { block: true },
    'brl-margin-6': { block: true },
    'brl-title': { header: 1 },
    'brl-global-title': { header: 2 },
    'brl-subtitle': { header: 2 },
    'brl-global-subtitle': { header: 2 },
    'brl-selection-number': { header: 2 },
    'brl-global-selection-number': { header: 2 },
    'brl-head': { header: 2 },
    'brl-bold': { header: 3 },
    'brl-text-larger1': { header: 3 },
    'brl-spacer': { below: 2 },
    'brl-pagebreakspacer': { below: 2 },
    'brl-fullpage': { above: 2, below: 2 },
    'brl-topmargin': { above: 1 },
    'brl-btmmargin': { below: 1 },
    'brl-italic': { i: true },
    'brl-text-smaller2': { i: true },
    'brl-align-center': { c: true },
    'brl-align-right': { r: true },
    'brl-linegroupline': { l: true },
    'brl-margin-number': { ignore: true },
  },
};

export default (text, classes) => {
  const content = [] as any[];
  const infos = {};
  const spans = [] as any[];
  const notes = [] as any[];

  const scrape = (children, output, base = {}) =>
    children.forEach(node => {
      if (node.type === 'text') {
        if (output) {
          const first = !content[content.length - 1];
          content[content.length - 1] += node.value.replace(/\-/g, '‑');
          content[content.length - 1] = content[content.length - 1].replace(
            /\s+/g,
            ' ',
          );
          if (first) {
            content[content.length - 1] = content[
              content.length - 1
            ].trimLeft();
          }
        }
      } else if (node.type === 'element') {
        if (node.tagName === 'sup' && node.children[0].properties) {
          notes.push({
            id: node.children[0].properties.href.slice(1),
            paragraph: content.length - 1,
            position: content[content.length - 1].length,
          });
        } else if (node.tagName === 'br') {
          if (output) {
            content[content.length - 1] += ' ';
            content[content.length - 1] = content[content.length - 1].replace(
              /\s+/g,
              ' ',
            );
          }
        } else {
          const flags = {} as any;
          Object.assign(flags, config.tags[node.tagName] || {});
          (node.properties.className || []).forEach(x => {
            Object.assign(flags, { ...config.classes, ...classes }[x] || {});
          });
          if (!flags.ignore) {
            if (
              node.tagName === 'li' &&
              !findChild(node, x => x.tagName === 'ul') &&
              findChild(node, x =>
                (x.properties.className || []).includes('brl-returntotext'),
              )
            ) {
              flags.note = findChild(
                node,
                x =>
                  x.tagName === 'a' &&
                  (x.properties.className || []).includes('brl-location') &&
                  x.properties.id,
              ).properties.id;
            }
            const { paragraph, above, below, ...info } = flags;
            const root =
              paragraph ||
              info.header ||
              info.note ||
              info.block ||
              above ||
              below;
            if (above) infos[content.length - 1].gap += above;
            if (root) {
              if (content.length > 0) {
                content[content.length - 1] = content[
                  content.length - 1
                ].trimRight();
              }
              content.push('');
              infos[content.length - 1] = { gap: 0 };
            }
            let span;
            let newBase = { ...base };
            if (Object.keys(info).length > 0) {
              if (root) {
                Object.assign(newBase, info);
              } else {
                span = {
                  types: Object.keys(info).sort(),
                  paragraph: content.length - 1,
                  start: content[content.length - 1].length,
                };
              }
            }
            if (root) Object.assign(infos[content.length - 1], newBase);
            scrape(node.children, output || root, newBase);
            if (span) {
              span.end = content[content.length - 1].length;
              spans.push(span);
            }
            if (below) infos[content.length - 1].gap += below;
            if (root) {
              if (content.length > 0) {
                content[content.length - 1] = content[
                  content.length - 1
                ].trimRight();
              }
              content.push('');
              infos[content.length - 1] = { gap: 0 };
            }
          }
        }
      }
    });

  scrape(
    unified()
      .use(rehype, { footnotes: true })
      .parse(text).children,
    false,
  );

  return content.map((p, i) => {
    const s = spans
      .filter(s => s.paragraph === i)
      .map(({ types, start, end }) => ({
        types,
        start,
        end: Math.min(end, p.length),
      }));
    const n = notes
      .filter(n => n.paragraph === i)
      .map(({ id, position }) => ({ id, position }));
    const { gap, ...info } = infos[i];
    return {
      content: p,
      gap,
      ...info,
      ...(s.length > 0 ? { spans: s } : {}),
      ...(n.length > 0 ? { notes: n } : {}),
    };
  });
};
