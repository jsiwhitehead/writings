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
};

export default data =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (prev && prev.info[1][1].content === d.info[1][1].content) {
        prev.content.push(...d.content);
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ info, content }, i) => {
      const result = {
        author: 'The Universal House of Justice',
        name: { content: 'Bahá’u’lláh' },
        content,
      } as any;
      if (i === 0) return { ...result, type: 'Preface' };
      return {
        ...result,
        type: 'Writings',
        section: info[1][1].content,
        part: i,
      };
    });
