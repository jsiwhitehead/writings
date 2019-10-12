export const config = {
  url:
    'https://www.bahai.org/library/other-literature/official-statements-commentaries/one-common-faith/one-common-faith.xhtml',
  start: '',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  classes: {
    'brl-bold': { i: true },
  },
};

export default data =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (prev && prev.info[0][0] === 2) {
        prev.content.push({ divide: true }, ...d.content);
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ info, content }) => ({
      type: info[0][0] === 1 ? 'Preface' : 'Writings',
      author: 'The Universal House of Justice',
      name: { content: 'One Common Faith' },
      content: info[0][0] === 1 ? content.slice(0, -2) : content,
    }));
