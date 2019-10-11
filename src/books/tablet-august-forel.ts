export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/tablet-august-forel/tablet-august-forel.xhtml',
  start:
    'O revered personage, lover of truth! Thy letter dated 28 July 1921 hath been received. The contents thereof were most pleasing and indicated that, praised be the Lord, thou art as yet young, and searchest after truth, that thy power of thought is strong and the discoveries of thy mind manifest.',
  end: 'Notes',
};

export default data => {
  const content = data[0].content;
  content.pop();
  return [
    {
      type: 'Tablet',
      author: '‘Abdu’l‑Bahá',
      name: { content: 'Tablet to Dr. Forel' },
      content,
    },
  ];
};
