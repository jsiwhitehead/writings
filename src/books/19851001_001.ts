export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/19851001_001/19851001_001.xhtml',
  start: 'To the Peoples of the World',
  end: '[signed: The Universal House of Justice]',
  // classes: {
  //   'brl-text-larger1': { header: 3 },
  // },
};

export default data =>
  data.map(({ content }, i) => ({
    type: 'Message',
    author: 'The Universal House of Justice',
    name: { content: 'The Promise of World Peace' },
    part: i,
    content,
  }));
