import { romanToArab } from 'roman-numbers';

export const config = {
  url:
    'https://www.bahai.org/library/other-literature/official-statements-commentaries/turning-point-all-nations/turning-point-all-nations.xhtml',
  start:
    'A Statement of the Bahá’í International Community on the Occasion of the 50th Anniversary of the United Nations',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
};

export default (data) => {
  const result = data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (d.info[1][1].content && !isNaN(d.info[1][1].content.slice(0, 1))) {
        prev.content.push(
          { header: 3, content: d.info[1][1].content },
          ...d.content,
        );
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ info, content }) => {
      if (info[1][0] === 1) {
        content.pop();
        return {
          type: 'Preface',
          author: 'Shoghi Effendi',
          name: { content: 'Turning Point for All Nations' },
          content,
        };
      }
      const title = info[1][1].content;
      const index = title.indexOf(' ');
      return {
        type: 'Writings',
        author: 'The Universal House of Justice',
        name: { content: 'Turning Point for All Nations' },
        section: title.slice(index + 1),
        part: title.slice(0, index - 1),
        content,
      };
    });
  let part = [] as any[];
  for (const d of result) {
    if (d.part) {
      if (['A', 'B', 'C', 'D'].includes(d.part)) {
        part[1] = ['A', 'B', 'C', 'D'].indexOf(d.part) + 1;
      } else {
        part = [romanToArab(d.part)];
      }
      d.part = [...part];
    }
  }
  return result;
};
