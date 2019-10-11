export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/tabernacle-unity/tabernacle-unity.xhtml',
  start: 'Introduction',
  end: 'Notes',
};

export default data =>
  data.map(({ info, content }) => {
    if (info[0][1].content === 'Introduction') {
      return {
        type: 'Preface',
        name: { content: 'The Tabernacle of Unity' },
        content,
      };
    }
    const result = { type: 'Tablet', author: 'Bahá’u’lláh', content } as any;
    if (info[0][1].content === 'Two Other Tablets') {
      result.name = {
        content: `The Tabernacle of Unity: Tablet ${info[1][0]}`,
      };
    } else {
      result.name = info[0][1];
    }
    return result;
  });
