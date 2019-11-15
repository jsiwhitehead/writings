export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/shoghi-effendi/god-passes-by/god-passes-by.xhtml',
  start: 'Foreword',
  end: '[END]',
  titleJoin: ': ',
  classes: {
    'brl-head': {},
    'brl-title': { header: 2 },
    'brl-subtitle': { header: 2 },
    'brl-global-title': { header: 3 },
  },
};

export default data =>
  data.map(({ content, info }) => {
    if (info[1][0] === 1) {
      return {
        type: 'Preface',
        author: 'Shoghi Effendi',
        name: { content: 'God Passes By' },
        content,
      };
    }
    return {
      type: 'History',
      author: 'Shoghi Effendi',
      name: { content: 'God Passes By' },
      section: info[1][1],
      title: info[2][1],
      part: [info[1][0] - 1, info[2][0]],
      content,
    };
  });
