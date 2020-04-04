export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/some-answered-questions/some-answered-questions.xhtml',
  start: 'Foreword',
  end: 'Notes',
};

export default (data) =>
  data.map(({ info, content }) => {
    if (
      ['Foreword', 'Author’s Preface to the First Edition'].includes(
        info[0][1].content,
      )
    ) {
      const result = {
        type: 'Preface',
        name: { content: 'Some Answered Questions' },
        content,
      } as any;
      if (info[0][1].content !== 'Foreword') result.author = '‘Abdu’l‑Bahá';
      return result;
    }
    return {
      type: 'Writings',
      author: '‘Abdu’l‑Bahá',
      content,
      name: info[1][1],
      part: info[0][0] - 2,
      section: info[1][0],
      categories: { 'Some Answered Questions': true },
    };
  });
