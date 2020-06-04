export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/twelve-table-talks-abdul-baha/twelve-table-talks-abdul-baha.xhtml',
  start: '',
  end: 'Notes',
};

export default (data) =>
  data.map(({ info, content }) => ({
    type: 'Talk',
    author: '‘Abdu’l‑Bahá',
    name: info[1][1],
    part: info[1][0],
    categories: { 'Table Talks': true },
    content,
  }));
