export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/gems-divine-mysteries/gems-divine-mysteries.xhtml',
  start: 'Introduction',
  end: 'Notes',
};

export default data =>
  data.map(({ info, content }) => {
    const result = { name: { content: 'Gems of Divine Mysteries' }, content };
    if (info[0][1].content === 'Introduction') {
      return { ...result, type: 'Preface' };
    }
    return { ...result, type: 'Writings', author: 'Bahá’u’lláh' };
  });
