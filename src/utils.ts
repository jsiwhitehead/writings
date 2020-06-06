export const last = (x) => x[x.length - 1];

export const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const stringify = (x = null as any) => {
  if (Array.isArray(x)) return `[${x.map(stringify).join(', ')}]`;
  if (x === null || typeof x !== 'object') return JSON.stringify(x);
  const keys = [
    ...Object.keys(x)
      .filter((k) => k !== 'content')
      .sort(),
    'content',
  ];
  return `{ ${keys
    .filter((k) => x[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}: ${stringify(x[k])}`)
    .join(', ')} }`;
};
