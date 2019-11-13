import * as moment from 'moment';

export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/paris-talks/paris-talks.xhtml',
  start: 'Part One',
  end: 'Notes',
  classes: {
    'brl-margin-4': { block: true },
  },
};

export default data =>
  data.map(({ info, content }) => {
    const intro = content.splice(
      0,
      content.findIndex(c => !c.c),
    );
    const [location, date] =
      intro.length === 1 && intro[0].content !== '4 Avenue de Camoëns, Paris'
        ? [undefined, ...intro]
        : intro;
    const result = {
      type: 'Talk',
      author: '‘Abdu’l‑Bahá',
      name: info[1][1].content && info[1][1],
      location: location && location.content.slice(0, -1),
      part: info[0][0],
      section: info[0][0] === 1 ? info[1][0] : info[1][0] - 1,
      categories: { 'Paris Talks': true },
      content,
    } as any;
    if (date) {
      let d = moment.utc(date.content, ['MMMM Do, YYYY', 'MMMM Do']);
      if (!d.isValid()) {
        const s = date.content.slice(date.content.indexOf(', '));
        d = moment.utc(s, ['MMMM Do, YYYY', 'MMMM Do']);
      }
      if (d.year() === 2019) d.year(1911);
      result.date = d.format('D/M/YYYY');
    }
    if (info[0][0] === 2) {
      if (result.section === 0) {
        delete result.author;
        delete result.section;
        result.type = 'Preface';
      }
      if (result.name) {
        const split = result.name.content.split('—');
        result.name.content = split[split.length - 1];
      }
      if (result.section === 2) {
        result.name.content = 'Search after Truth';
        result.location = '4 Avenue de Camoëns, Paris';
      }
    }
    return result;
  });
