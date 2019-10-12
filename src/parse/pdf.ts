const getLast = x => x[x.length - 1];

const punctuation = ['.', ',', ';', '?', '!'];

export default (data, start, end) => {
  const result = [{ header: false, spans: [] as any[], content: '' }];
  data.formImage.Pages.forEach(p => {
    let currentY = 0;
    p.Texts.forEach(t => {
      if (t.y - currentY > 1 || (t.y > currentY && t.x > 5.375)) {
        result.push({ header: false, spans: [], content: '' });
      }
      currentY = t.y;
      t.R.forEach(r => {
        const header = r.TS[1] > 20;
        if (header !== getLast(result).header) {
          result.push({ header, spans: [], content: '' });
        }
        let text = decodeURIComponent(r.T);
        const lastChar = getLast(getLast(result).content);
        if (!lastChar || lastChar === ' ') text = text.trimLeft();
        else if (punctuation.includes(lastChar)) text = ` ${text}`;
        text = text.replace(/\s+/g, ' ');
        const start = getLast(result).content.length;
        const span = { start, end: start + text.length, types: [] as any[] };
        if (r.TS[2]) span.types.push('b');
        if (r.TS[3]) span.types.push('i');
        const lastSpan = getLast(getLast(result).spans);
        if (
          lastSpan &&
          span.start === lastSpan.end &&
          JSON.stringify(span.types) === JSON.stringify(lastSpan.types)
        ) {
          lastSpan.end = span.end;
        } else if (span.types.length) {
          getLast(result).spans.push(span);
        }
        getLast(result).content += text;
      });
    });
  });
  const filtered = result
    .filter(x => x.content)
    .map(x => {
      x.content = x.content.trim();
      x.spans.forEach(s => {
        s.end = Math.min(s.end, x.content.length);
      });
      x.spans.forEach(s => {
        if (s.start === 0 && s.end === x.content.length) {
          s.types.forEach(t => {
            x[t] = true;
          });
        }
      });
      x.spans = x.spans.filter(s => s.types.some(t => !x[t]));
      if (!x.header) delete x.header;
      if (!x.spans.length) delete x.spans;
      return x;
    });
  const startIndex = filtered.findIndex(p => p.content === start);
  const endIndex = filtered.findIndex(p => p.content === end);
  return filtered.slice(
    startIndex === -1 ? 0 : startIndex,
    endIndex === -1 ? undefined : endIndex,
  );
};
