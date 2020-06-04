export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/gleanings-writings-bahaullah/gleanings-writings-bahaullah.xhtml',
  start:
    'Lauded and glorified art Thou, O Lord, my God! How can I make mention of Thee, assured as I am that no tongue, however deep its wisdom, can befittingly magnify Thy name, nor can the bird of the human heart, however great its longing, ever hope to ascend into the heaven of Thy majesty and knowledge.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
};

export default (data) =>
  data.map(({ content }) => ({
    type: 'Writings',
    excerpt: true,
    author: 'Bahá’u’lláh',
    content,
  }));
