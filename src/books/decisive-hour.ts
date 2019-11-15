export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/shoghi-effendi/decisive-hour/decisive-hour.xhtml',
  start: 'The Passing of Abu’l‑Qásim Khurásání',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  classes: {
    'brl-head': {},
    'brl-global-title': { header: 2 },
  },
};

export default data =>
  data.map(({ content, info }) => ({
    type: 'Message',
    author: 'Shoghi Effendi',
    name: { content: 'The Advent of Divine Justice' },
    part: info[1][0],
    title: info[1][1],
    date: content
      .shift()
      .content.replace(/\[/g, '')
      .replace(/\]/g, ''),
    content,
  }));
