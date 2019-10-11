import * as moment from 'moment';

export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/tablets-hague-abdul-baha/tablets-hague-abdul-baha.xhtml',
  start: 'First Tablet to The Hague',
  end: 'Notes',
};

export default data =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (!d.info[1][1].content) {
        prev.content.push({ divide: true }, ...d.content);
        return res;
      }
      return [...res, d];
    }, [])
    .map(({ info, content }) => ({
      type: 'Tablet',
      author: '‘Abdu’l‑Bahá',
      name: info[0][1],
      date: moment(info[1][1].content, 'D MMMM YYYY').format('D/M/YYYY'),
      content,
    }));
