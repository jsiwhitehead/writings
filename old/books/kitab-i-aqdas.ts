export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas/kitab-i-aqdas.xhtml',
  start: 'Preface',
  end: 'Some Texts Revealed by Bahá’u’lláh Supplementary to the Kitáb‑i‑Aqdas',
};

export default (data) =>
  data.map(({ info, content }) => {
    const result = {
      type: 'Preface',
      name: { content: 'The Most Holy Book' },
      content,
    };
    if (info[0][1].content === 'The Kitáb‑i‑Aqdas') {
      return { ...result, type: 'Writings', author: 'Bahá’u’lláh' };
    }
    if (info[0][1].content === 'Preface') return result;
    if (info[0][1].content === 'Introduction') {
      return { ...result, author: result.content.pop() };
    }
    return { ...result, author: 'Shoghi Effendi', content: content.slice(1) };
  });
