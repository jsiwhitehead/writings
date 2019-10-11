export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/secret-divine-civilization/secret-divine-civilization.xhtml',
  start: 'In the Name of God the Clement, the Merciful',
  end: 'Notes',
};

export default data => [
  {
    type: 'Writings',
    author: '‘Abdu’l‑Bahá',
    name: { content: 'The Secret of Divine Civilization' },
    content: data[0].content,
  },
];
