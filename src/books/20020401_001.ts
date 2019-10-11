export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/20020401_001/20020401_001.xhtml',
  start: 'To The World’s Religious Leaders',
  end: '[signed: The Universal House of Justice]',
};

export default data => [
  data.reduce(
    (res, { content }, i) => ({
      ...res,
      content:
        i === 0 ? content : [...res.content, { divide: true }, ...content],
    }),
    {
      type: 'Message',
      author: 'The Universal House of Justice',
      name: { content: 'Letter to the World’s Religious Leaders' },
      content: [],
    },
  ),
];
