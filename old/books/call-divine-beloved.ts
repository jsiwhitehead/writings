export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/call-divine-beloved/call-divine-beloved.xhtml',
  start: 'Preface',
  end: 'Notes',
  classes: {
    'brl-linegroup': { block: true },
    'brl-global-gloss-definition': { block: true },
  },
};

export default (data) =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (
        d.info[0][1].content === 'The Seven Valleys' &&
        prev.info[0][1].content === 'The Seven Valleys'
      ) {
        prev.content = [...prev.content, { divide: true }, ...d.content];
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ info, content }) => {
      const result = {
        type: 'Writings',
        author: 'Bahá’u’lláh',
        content,
      } as any;
      if (info[0][1].content === 'Preface') {
        result.type = 'Preface';
        result.name = { content: 'The Call of the Divine Beloved' };
        delete result.author;
      } else if (info[1][1].content === '(The Clouds of the Realms Above)') {
        result.type = 'Poem';
        result.name = { content: 'The Clouds of the Realms Above' };
        result.content = result.content.map(({ block, ...c }) => c);
      } else if (info[0][1].content === 'Three Other Tablets') {
        result.type = 'Tablet';
        result.name = {
          content: `The Call of the Divine Beloved: Tablet ${info[1][0]}`,
        };
      } else {
        result.name = info[0][1];
        if (result.name.content === 'From the Letter Bá’ to the Letter Há’') {
          result.type = 'Tablet';
        }
      }
      return result;
    });
