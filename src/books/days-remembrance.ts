import quotes from '../quotes';
import structure from '../structure';

export const url =
  'https://www.bahai.org/library/authoritative-texts/bahaullah/days-remembrance/days-remembrance.xhtml';

const levels = {
  'Days of Remembrance': 0,
  'Selections from the Writings of Bahá’u’lláh for Bahá’í Holy Days': 0,
  Preface: 1,
  'Naw‑Rúz': 1,
  Riḍván: 1,
  'Declaration of the Báb': 1,
  'Ascension of Bahá’u’lláh': 1,
  'Martyrdom of the Báb': 1,
  'Birth of the Báb': 1,
  'Birth of Bahá’u’lláh': 1,
};

export default (data) => {
  const { content, outline } = structure(
    'days-remembrance',
    data.slice(
      0,
      data.findIndex((d) => d.content === 'Notes'),
    ),
    (header) => levels[header] ?? 2,
  );
  return {
    content: quotes(content, {}),
    outline,
  };
};
