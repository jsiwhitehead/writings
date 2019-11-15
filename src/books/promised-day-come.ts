export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/shoghi-effendi/promised-day-come/promised-day-come.xhtml',
  start: 'Friends and fellow‑heirs of the Kingdom of Bahá’u’lláh:',
  end: 'Shoghi',
};

export default data =>
  data.map(({ content, info }) => ({
    type: 'Message',
    author: 'Shoghi Effendi',
    name: { content: 'The Promised Day is Come' },
    title: info[1][1],
    part: info[1][0],
    content,
  }));
