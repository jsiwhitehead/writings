export const flatten = x => x.reduce((res, y) => [...res, ...y], []);

export const stringify = (x = null as any) => {
  if (Array.isArray(x)) return `[${x.map(stringify).join(', ')}]`;
  if (x === null || typeof x !== 'object') return JSON.stringify(x);
  const keys = [
    ...Object.keys(x)
      .filter(k => k !== 'content')
      .sort(),
    'content',
  ];
  return `{ ${keys
    .filter(k => x[k] !== undefined)
    .map(k => `${JSON.stringify(k)}: ${stringify(x[k])}`)
    .join(', ')} }`;
};

export const sliceContent = (data, start, end) => {
  const result = { ...data };
  result.content = result.content.slice(start, end);
  if (result.spans) {
    result.spans = result.spans.map(({ start: s, end: e, ...rest }) => ({
      start: s - start,
      end: e - start,
      ...rest,
    }));
    result.spans = result.spans.filter(
      s => s.start >= 0 && s.end <= result.content.length,
    );
    if (result.spans.length === 0) delete result.spans;
  }
  if (result.notes) {
    result.notes = result.notes.map(({ position: p, ...rest }) => ({
      position: p - start,
      ...rest,
    }));
    result.notes = result.notes.filter(
      n => n.position > 0 && n.position <= result.content.length,
    );
    if (result.notes.length === 0) delete result.notes;
  }
  return result;
};
