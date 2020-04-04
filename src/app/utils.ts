export const isNumber = (x) => !isNaN(x) && !isNaN(parseFloat(x));

export const toNumber = (s) => (isNumber(s) ? parseFloat(s) : 0);

export const split = (s) => (s || '').split(/\s+/).filter((v) => v);

export const isInteger = (x) => {
  if (!isNumber(x)) return false;
  const n = parseFloat(x);
  return Math.floor(n) === n;
};
