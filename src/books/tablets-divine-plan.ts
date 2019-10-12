export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/tablets-divine-plan/tablets-divine-plan.xhtml',
  start: 'Tablet to the Bahá’ís of the Northeastern States',
  end: 'Notes',
  classes: {
    'brl-linegroup': { block: true },
    'brl-fullpage': { above: 2, below: 2 },
  },
};

export default data =>
  data.map(({ info, content }) => ({
    type: info[1][0] === 1 ? 'Preface' : 'Tablet',
    categories: { 'Tablets of the Divine Plan': true },
    author: '‘Abdu’l‑Bahá',
    name: info[0][1],
    part: info[0][0],
    content,
  }));
