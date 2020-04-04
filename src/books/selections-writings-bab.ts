import { romanToArab } from 'roman-numbers';

import { sliceContent } from '../util';

export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/the-bab/selections-writings-bab/selections-writings-bab.xhtml',
  start: 'Tablets and Addresses',
  end: 'Key to Passages Translated by Shoghi Effendi',
};

export default (data) =>
  data.map(({ info, content }) => {
    const result = { type: 'Writings', author: 'The Báb', content } as any;
    if (info[0][1].content === 'Tablets and Addresses') {
      result.type = 'Tablet';
      result.name = info[1][1];
    } else if (info[0][1].content === 'Excerpts from Various Writings') {
    } else if (info[0][1].content.startsWith('Excerpts')) {
      result.name = info[0][1];
      result.part = info[2][0];
      if (result.name.content !== 'Excerpts from the Dalá’il‑i‑Sab‘ih') {
        const last = result.content[result.content.length - 1];
        const span = last.spans
          .filter((s) => s.types.includes('i'))
          .sort((a, b) => b.start - a.start)[0];
        result.chapter = last.content
          .slice(span.start - 1, span.end)
          .replace('Chapter', '')
          .replace(/[ \.]/g, '')
          .split(',');
        result.chapter[0] = romanToArab(result.chapter[0]);
        if (result.chapter[1]) {
          result.chapter[1] = parseInt(result.chapter[1], 10);
        }
        result.content[result.content.length - 1] = sliceContent(
          last,
          0,
          span.start - 1,
        );
      }
    } else {
      result.type = 'Prayer';
    }
    return result;
  });
