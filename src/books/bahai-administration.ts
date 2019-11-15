export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/shoghi-effendi/bahai-administration/bahai-administration.xhtml',
  start: 'Excerpts from the Will and Testament of ‘Abdu’l‑Bahá',
  end: 'Part Two: Letters from Shoghi Effendi',
  classes: {
    'brl-head': {},
    'brl-global-title': { header: 2 },
    'brl-se-subheading': { header: 3 },
  },
};

export default data =>
  data
    .slice(1)
    .reduce((res, n) => {
      const prev = res[res.length - 1];
      if (prev && prev.info[1][0] === n.info[1][0]) {
        prev.content.push({ header: 3, ...n.info[2][1] }, ...n.content);
        return res;
      }
      return [...res, n];
    }, [])
    .map(({ content, info }, j) => {
      let i = content.findIndex(n => n.r && n.content === 'Shoghi.');
      if (i !== -1 && content[i - 1].c) i--;
      return {
        type: 'Message',
        author: 'Shoghi Effendi',
        name: { content: 'Bahá’í Administration' },
        title: info[1][1],
        part: j + 1,
        content:
          i === -1
            ? content
            : [
                ...content.slice(0, i),
                ...content
                  .slice(i)
                  .filter(n => n.header || n.content.startsWith('P.S.')),
              ],
      };
    });
