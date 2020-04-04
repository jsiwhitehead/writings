export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/additional-prayers-revealed-abdul-baha/additional-prayers-revealed-abdul-baha.pdf',
  start: 'O Lord!',
  end:
    'This document has been downloaded from the Bahá’í Reference Library. You are free to use its content subject to the terms of use found at www.bahai.org/legal',
};

const categories = [
  ['Youth'],
  null,
  ['Children'],
  ['Youth'],
  ['Youth', 'Women'],
  null,
  ['Children'],
  ['Youth'],
  ['Children'],
  ['Children'],
  null,
  null,
  null,
  ['Children'],
  null,
  null,
  null,
  ['Holy Land'],
  ['Parents', 'Women'],
];

export default (data) =>
  data
    .reduce(
      (res, d) => {
        if (d.i) d.c = true;
        if (d.content !== '—‘Abdu’l-Bahá') res[res.length - 1].push(d);
        else res.push([]);
        return res;
      },
      [[]],
    )
    .filter((x) => x.length > 0)
    .map((content, i) => ({
      type: 'Prayer',
      author: '‘Abdu’l-Bahá',
      ...(categories[i]
        ? {
            categories: categories[i]!.reduce(
              (res, c) => ({ ...res, [c]: true }),
              {},
            ),
          }
        : {}),
      content,
    }));
