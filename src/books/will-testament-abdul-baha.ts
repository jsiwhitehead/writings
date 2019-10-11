export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/will-testament-abdul-baha/will-testament-abdul-baha.xhtml',
  start: 'Part One',
  end: 'Notes',
};

export default data =>
  data
    .filter(d => d.info[1][0] !== 2)
    .map(({ content }, i) => ({
      type: 'Writings',
      author: '‘Abdu’l‑Bahá',
      name: { content: 'Will and Testament' },
      part: i + 1,
      content,
    }));
