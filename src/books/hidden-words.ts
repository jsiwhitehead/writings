export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/hidden-words/hidden-words.xhtml',
  start: 'Part One',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  smallBreak: true,
  classes: {
    'brl-margin-number': { ignore: true },
  },
};

export default data =>
  data
    .reduce((res, n) => {
      const prev = res[res.length - 1];
      if (
        prev &&
        prev.info[1][0] === 1 &&
        prev.info[2][0] > 1 &&
        prev.content[0].i &&
        prev.content.length === 1
      ) {
        prev.content.push(...n.content);
        return res;
      }
      if (n.info[0][1].content === 'Part Two' && n.info[2][0] !== 1) {
        n.info[2][0] = prev.info[2][0] + 1;
      }
      return [...res, n];
    }, [])
    .map(({ info, content }) => {
      const result = {
        type: 'Writings',
        author: 'Bahá’u’lláh',
        name: { content: `The Hidden Words: ${info[0][1].content}` },
        content,
      } as any;
      if ([1, 1, 1].every((x, i) => info[i][0] === x)) {
        result.part = 0;
      } else if ([2, 2, 1].every((x, i) => info[i][0] === x)) {
        result.part = 83;
      } else {
        if (info[0][1].content === 'Part One') {
          result.part = info[2][0];
        } else if (info[0][1].content === 'Part Two') {
          result.part = info[2][0] - 1;
        }
        if (result.part) {
          const first = result.content[0].i ? result.content.shift() : null;
          const s = result.content[0].content;
          const i = s.indexOf('!');
          result.content = [s.slice(0, i + 1), s.slice(i + 2)].map(content => ({
            content,
          }));
          if (first) result.content.unshift(first);
        }
      }
      return result;
    });
