export const config = {
  url:
    'https://www.bahai.org/library/other-literature/official-statements-commentaries/prosperity-humankind/prosperity-humankind.xhtml',
  start:
    'To an extent unimaginable a decade ago, the ideal of world peace is taking on form and substance. Obstacles that long seemed immovable have collapsed in humanity’s path; apparently irreconcilable conflicts have begun to surrender to processes of consultation and resolution; a willingness to counter military aggression through unified international action is emerging. The effect has been to awaken in both the masses of humanity and many world leaders a degree of hopefulness about the future of our planet that had been nearly extinguished.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
};

export default data =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (prev && prev.info[1][1].content === d.info[1][1].content) {
        prev.content.push(...d.content);
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ content }, i) => ({
      type: 'Writings',
      author: 'The Universal House of Justice',
      name: { content: 'The Prosperity of Humankind' },
      part: i,
      content,
    }));
