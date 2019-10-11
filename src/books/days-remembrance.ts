export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/days-remembrance/days-remembrance.xhtml',
  start: 'Preface',
  end: 'Notes',
};

export default data =>
  data.map(({ info, content }) => {
    const result = { type: 'Tablet', author: 'Bahá’u’lláh', content } as any;
    if (info[0][1].content === 'Preface') {
      delete result.author;
      return {
        ...result,
        type: 'Preface',
        name: { content: 'Days of Remembrance' },
      };
    }
    const [[, theme], [, name]] = info;
    return {
      categories: { [theme.content]: true },
      ...(name.content
        ? {
            name: {
              content:
                name.content === 'The Tablet of Visitation'
                  ? 'Tablet of Visitation of Bahá’u’lláh'
                  : /\((.+)\)/
                      .exec(name.content)![1]
                      .replace('Súrih', 'Tablet'),
            },
          }
        : {}),
      excerpt: name.content && name.content.includes('Excerpt'),
      ...result,
    };
  });
