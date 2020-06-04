export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/summons-lord-hosts/summons-lord-hosts.xhtml',
  start: 'Introduction',
  end: 'Notes',
};

export default (data) =>
  data.map(({ info, content }) => {
    if (info[0][1].content === 'Introduction') {
      return {
        type: 'Preface',
        name: { content: 'The Summons of the Lord of Hosts' },
        author: content.pop(),
        content,
      };
    }
    const result = { type: 'Tablet', author: 'Bahá’u’lláh', content } as any;
    result.name = {
      content:
        {
          'Súriy‑i‑Haykal': 'Tablet of the Temple',
          'Súriy‑i‑Ra’ís': 'Tablet of the Premier',
          'Lawḥ‑i‑Ra’ís': 'Tablet of the Chief',
          'Lawḥ‑i‑Fu’ád': "Tablet to Fu'ad Pasha",
          'Súriy‑i‑Mulúk': 'Tablet of the Kings',
        }[info[0][1].content] || info[0][1].content,
    };
    if (result.name.content === 'Tablet of the Temple') {
      result.part = info[1][0];
      if (info[1][1].content) result.address = info[1][1];
    }
    return result;
  });
