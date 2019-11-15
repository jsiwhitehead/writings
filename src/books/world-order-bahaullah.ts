export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/shoghi-effendi/world-order-bahaullah/world-order-bahaullah.xhtml',
  start:
    'To the members of the National Spiritual Assembly of the Bahá’ís of the United States and Canada.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  classes: {
    'brl-head': {},
    'brl-global-title': { header: 2 },
    'brl-se-subheading': { header: 3 },
  },
};

export default data =>
  data
    .reduce((res, n) => {
      const prev = res[res.length - 1];
      if (
        prev &&
        prev.info[0][0] === n.info[0][0] &&
        prev.info[1][0] === n.info[1][0]
      ) {
        prev.content.push({ header: 3, ...n.info[2][1] }, ...n.content);
        return res;
      }
      return [...res, n];
    }, [])
    .map(({ content, info }) => {
      const i = content.findIndex(n => n.c || n.r || n.content === 'Shoghi.');
      const result = {
        type: 'Message',
        author: 'Shoghi Effendi',
        name: { content: 'The World Order of Bahá’u’lláh' },
        title:
          info[0][0] === 1
            ? { content: 'The World Order of Bahá’u’lláh' }
            : info[0][1],
        content: i === -1 ? content : content.slice(0, i),
      } as any;
      if (
        result.title.content === 'The Dispensation of Bahá’u’lláh Bahá’u’lláh'
      ) {
        result.title.content = 'Bahá’u’lláh';
      }
      if (
        [
          'Bahá’u’lláh',
          'The Báb',
          '‘Abdu’l‑Bahá',
          'The Administrative Order',
        ].includes(result.title.content)
      ) {
        result.part = result.title;
        result.title = { content: 'The Dispensation of Bahá’u’lláh' };
      }
      return result;
    });
