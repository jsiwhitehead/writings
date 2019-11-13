import * as moment from 'moment';

export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/promulgation-universal-peace/promulgation-universal-peace.xhtml',
  start: 'Talks ‘Abdu’l‑Bahá Delivered in New York and Brooklyn',
  end: 'Notes',
  classes: {
    'brl-bold': { i: true },
    'brl-head': {},
    'brl-global-title': { header: 2 },
    'brl-subtitle': { header: 2 },
    'brl-global-selection-number': { header: 2 },
  },
};

export default data =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (prev && prev.content.length === 1 && prev.content[0].c) {
        prev.content.push(...d.content);
        prev.info = d.info;
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ info, content }) => {
      const intro = content.splice(
        0,
        content.findIndex(c => !c.c),
      );
      const [date, scribe] = intro;
      return {
        type: 'Talk',
        author: '‘Abdu’l‑Bahá',
        name: info[1][1].content && info[1][1],
        date: moment(date.content, 'D MMMM YYYY').format('D/M/YYYY'),
        scribe: scribe && scribe.content,
        part: info[0][0],
        section: info[1][0] / 2,
        categories: { 'The Promulgation of Universal Peace': true },
        content,
      };
    });
