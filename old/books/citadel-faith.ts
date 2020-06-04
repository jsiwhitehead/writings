export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/shoghi-effendi/citadel-faith/citadel-faith.xhtml',
  start: 'January 20, 1947',
  end: 'Notes',
  classes: {
    'brl-head': {},
    'brl-global-title': { header: 2 },
    'brl-se-subheading': { header: 3 },
  },
};

export default (data) =>
  data
    .reduce((res, n) => {
      const prev = res[res.length - 1];
      if (prev && prev.info[1][0] === n.info[1][0]) {
        prev.content.push({ header: 3, ...n.info[2][1] }, ...n.content);
        return res;
      }
      return [...res, n];
    }, [])
    .reduce((res, n) => {
      const prev = res[res.length - 1];
      if (prev && n.info[0][0] === 1) {
        n.content.unshift(prev.content.pop());
      }
      return [...res, n];
    }, [])
    .filter((n) => n.content.length !== 0)
    .map(({ content, info }) => {
      if (info[0][0] === 1) {
        const date = content.shift();
        return {
          type: 'Message',
          author: 'Shoghi Effendi',
          name: { content: 'Citadel of Faith' },
          title: info[1][1],
          date: date.content,
          part: info[1][0] - 1,
          content,
        };
      }
      const date = content.pop();
      return {
        type: 'Memorial',
        author: 'Shoghi Effendi',
        name: { content: 'Citadel of Faith' },
        title: info[1][1],
        date: date.content.slice(1, -1),
        part: info[1][0],
        content,
      };
    });
