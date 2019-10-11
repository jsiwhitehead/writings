export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-iqan/kitab-i-iqan.xhtml',
  start:
    'This is the Day in which the testimony of the Lord hath been fulfilled, the Day in which the Word of God hath been made manifest, and His evidence firmly established. His voice is calling you unto that which shall profit you, and enjoineth you to observe that which shall draw you nigh unto God, the Lord of Revelation.',
  end: 'Notes',
};

export default data =>
  data.map(({ info, content }) => {
    const section = info.map(x => x[1].content).join('');
    const result = {
      type: 'Writings',
      author: 'Bahá’u’lláh',
      name: { content: 'The Book of Certitude' },
      content,
    } as any;
    if (section === 'Foreword') {
      result.author = 'Shoghi Effendi';
      result.type = 'Preface';
      result.content.pop();
    } else {
      result.part = info[0][0] - 1;
      result.content.pop();
    }
    return result;
  });
