export const isNumber = (v: string) =>
  !isNaN(v as any) && !isNaN(parseFloat(v));

export const last = (x) => x[x.length - 1];

export const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const stringify = (x = null as any, ...content) => {
  if (Array.isArray(x)) {
    return `[${x.map((y) => stringify(y, ...content)).join(', ')}]`;
  }
  if (x === null || typeof x !== 'object') {
    return JSON.stringify(x);
  }
  const keys = [
    ...Object.keys(x)
      .filter((k) => !content.includes(k))
      .sort(),
    ...content,
  ];
  return `{ ${keys
    .filter((k) => x[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}: ${stringify(x[k], ...content)}`)
    .join(', ')} }`;
};

export const sortMultiple = <T = any>(
  items1: T[],
  items2: T[],
  sortItems: (a: T, b: T) => number,
  reverseUndef = false,
) =>
  Array.from({ length: Math.max(items1.length, items2.length) }).reduce(
    (res, _, i) => {
      if (res !== 0) return res;
      if (items1[i] === undefined) return reverseUndef ? 1 : -1;
      if (items2[i] === undefined) return reverseUndef ? -1 : 1;
      return sortItems(items1[i], items2[i]);
    },
    0,
  ) as -1 | 0 | 1;
