export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/prayers/bahai-prayers/bahai-prayers.xhtml',
  start:
    'Blessed is the spot, and the house, and the place, and the city, and the heart, and the mountain, and the refuge, and the cave, and the valley, and the land, and the sea, and the island, and the meadow where mention of God hath been made, and His praise glorified.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  smallBreak: true,
  classes: {
    'brl-global-instructions': { block: true, i: true },
    'brl-linegroup': { block: true },
    'brl-bold': { header: 3 },
    'brl-fullpage': { above: 2, below: 2 },
  },
};

export default (data) =>
  data
    .reduce((res, n) => {
      const prev = res[res.length - 1];
      if (
        prev &&
        prev.info[2][1].content &&
        !n.info[2][1].content &&
        n.info[1][1].content &&
        prev.info[1][1].content &&
        n.info[1][1].content === prev.info[1][1].content
      ) {
        n.info[2][1] = prev.info[2][1];
      }
      if (
        prev &&
        !prev.content[prev.content.length - 1].r &&
        !['The Fund', 'The Fast', 'Intercalary Days', 'Naw‑Rúz'].includes(
          n.info[1][1].content,
        ) &&
        !(
          n.info[0][1].content === 'Obligatory Prayers' && n.info[2][0] === 2
        ) &&
        !(n.info[1][1].content === 'The Departed' && n.info[2][0] === 2) &&
        !(n.info[1][1].content === 'Marriage' && n.info[2][0] === 4) &&
        !(
          n.info[1][1].content === 'Tablets of Visitation' &&
          (n.info[2][0] === 2 || n.info[2][0] === 4)
        )
      ) {
        prev.content.push(...n.content);
        return res;
      }
      return [...res, n];
    }, [])
    .map(({ info, content }) => {
      const author = content[content.length - 1].r
        ? content.pop().content.slice(1)
        : null;
      const result = {
        type: 'Prayer',
        ...(author ? { author } : {}),
        content,
      } as any;
      if (
        !['Bahá’u’lláh', 'The Báb', '‘Abdu’l‑Bahá'].includes(author) ||
        ([
          'Marriage',
          'Ḥuqúqu’lláh: The Right of God',
          'Tablet of the Holy Mariner',
        ].includes(info[1][1].content) &&
          info[2][0] === 1)
      ) {
        result.type = 'Guidance';
        if (info[1][1].content === 'The Departed') {
          result.content[0].content = result.content[0].content.slice(1, -1);
        }
      }

      const labels = info
        .map((x) => x[1].content)
        .filter((x) => x)
        .filter((x) => !['General', 'Occasional'].some((s) => x.includes(s)))
        .map((x) => {
          if (x.includes('Women')) return 'Women';
          if (x.includes('Infants')) return 'Infants';
          return x;
        });
      if (
        info[1][1].content === 'Ḥuqúqu’lláh: The Right of God' &&
        info[2][0] === 2
      ) {
        labels.push('The Fund');
      }
      if (
        [
          'Children',
          'Evening',
          'Families',
          'Gatherings',
          'Women',
          'Ḥuqúqu’lláh: The Right of God',
        ].includes(labels[0]) &&
        labels[1]
      ) {
        labels.shift();
      }

      if (labels[0] === 'Obligatory Prayers') {
        result.name = { content: labels.pop() };
      }
      if (labels[0] === 'Special Tablets') {
        if (result.type !== 'Guidance') result.type = 'Tablet';
        result.name = { content: labels.pop() };
        labels.pop();
      }
      if ([1, 1, 2].every((x, i) => info[i][0] === x)) {
        result.type = 'Writings';
        result.excerpt = true;
      }
      if (info[1][1].content === 'Healing' && info[2][0] === 2) {
        result.name = { content: 'Short Healing Prayer' };
      }
      if (info[1][1].content === 'Tablets of Visitation') {
        result.name = {
          content: `Tablet of Visitation of ${
            info[2][0] <= 2 ? 'Bahá’u’lláh' : '‘Abdu’l‑Bahá'
          }`,
        };
      }
      if (
        labels[1] === 'Prayers for Teaching from the Tablets of the Divine Plan'
      ) {
        result.content.shift();
      }
      if (
        ['Prayer for the Dead', 'The Long Healing Prayer'].includes(
          labels[labels.length - 1],
        )
      ) {
        result.name = { content: labels.pop() };
      }
      if (labels.length > 0) {
        result.categories = labels.reduce(
          (res, l) => ({ ...res, [l]: true }),
          {},
        );
      }
      return result;
    });
