export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/memorials-faithful/memorials-faithful.xhtml',
  start: 'Nabíl‑i‑Akbar',
  end: 'Notes',
};

export default data =>
  data.map(({ info, content }) => ({
    type: 'Memorial',
    author: '‘Abdu’l‑Bahá',
    name: info[1][1],
    part: info[1][0],
    content,
  }));
