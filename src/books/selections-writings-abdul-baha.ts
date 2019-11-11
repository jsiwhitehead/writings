export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/selections-writings-abdul-baha/selections-writings-abdul-baha.xhtml',
  start: 'Preface',
  end: 'Notes on Translations',
  classes: {
    'brl-margin-4': { block: true },
  },
};

export default data =>
  data.map(({ info, content }) =>
    info[0][1].content === 'Preface'
      ? {
          type: 'Preface',
          name: { content: 'Selections from the Writings of ‘Abdu’l‑Bahá' },
          author: '‘Abdu’l‑Bahá',
          content,
        }
      : {
          type: 'Writings',
          author: '‘Abdu’l‑Bahá',
          excerpt: true,
          content,
        },
  );
