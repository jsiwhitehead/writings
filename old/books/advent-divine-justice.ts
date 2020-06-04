export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/shoghi-effendi/advent-divine-justice/advent-divine-justice.xhtml',
  start:
    'To the beloved of God and the handmaids of the Merciful throughout the United States and Canada.',
  end: 'Shoghi',
};

export default (data) =>
  data.map(({ content }) => ({
    type: 'Message',
    author: 'Shoghi Effendi',
    name: { content: 'The Advent of Divine Justice' },
    content,
  }));
