export const config = {
  url:
    'https://www.bahai.org/library/other-literature/official-statements-commentaries/bahaullah/bahaullah.xhtml',
  replace: [
    ['<a href="#305621817">19</a>', '<a href="#305621818">19</a>'],
    [
      '<a class="brl-pnum brl-persistent">19</a>',
      '<a class="brl-pnum brl-persistent">19</a><a id="305621818" class="brl-location"></a>',
    ],
  ],
  start:
    'May 29, 1992, marks the centenary of the passing of Bahá’u’lláh. His vision of humanity as one people and of the earth as a common homeland, dismissed out of hand by the world leaders to whom it was first enunciated over a hundred years ago, has today become the focus of human hope. Equally inescapable is the collapse of moral and social order, which this same declaration foresaw with awesome clarity.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  classes: {
    'brl-bold': { i: true },
    'brl-head': {},
    'brl-pagebreakspacer': { below: 2 },
  },
};

export default data =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (prev && !d.content[0].i) {
        prev.content.push(...d.content);
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ content }, i) => {
      const header = content[0].i && content.shift().content;
      return {
        type: 'Writings',
        author: 'The Universal House of Justice',
        name: { content: 'Bahá’u’lláh' },
        section: header,
        part: i + 1,
        content,
      };
    });
