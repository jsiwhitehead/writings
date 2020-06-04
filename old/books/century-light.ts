export const config = {
  url:
    'https://www.bahai.org/library/other-literature/official-statements-commentaries/century-light/century-light.xhtml',
  start: '',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
};

export default (data) =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (prev && prev.info[0][0] === 2 && !d.info[1][1].content) {
        prev.content.push({ divide: true }, ...d.content);
        return res;
      }
      return [...res, d];
    }, [])
    .filter((d) => ![1, 1, 2].every((x, i) => d.info[i][0] === x))
    .map(({ info, content }, i) => ({
      type: info[0][0] === 1 ? 'Preface' : 'Writings',
      author: 'The Universal House of Justice',
      name: { content: 'Century of Light' },
      ...(i === 0 ? {} : { part: i - 1 }),
      content: info[0][0] === 1 ? content.slice(0, -1) : content,
    }));
