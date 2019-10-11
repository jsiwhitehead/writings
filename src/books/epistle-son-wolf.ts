export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/epistle-son-wolf/epistle-son-wolf.xhtml',
  start:
    'In the name of God, the One, the Incomparable, the All‑Powerful, the All‑Knowing, the All‑Wise.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
};

export default data => [
  {
    type: 'Writings',
    author: 'Bahá’u’lláh',
    name: { content: 'Epistle to the Son of the Wolf' },
    content: data[0].content,
  },
];
