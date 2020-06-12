export const url =
  'https://www.bahai.org/library/authoritative-texts/bahaullah/call-divine-beloved/call-divine-beloved.xhtml';

export const quotes = {
  1: 2,
  5: 2,
  7: 2,
  9: 3,
  21: 2,
  29: 2,
  33: 2,
  48: 2,
  57: 4,
  88: 2,
  90: 2,
  96: 2,
  101: 2,
  134: 2,
};

export const skipNotes = [11, 21, 46, 52, 71, 77, 79, 91, 94, 107, 127];

// const levels = [0, 0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1];

// "The Call of the Divine Beloved"
// "Selected Mystical Works of Bahá’u’lláh"
//   "Preface"
//   "1"
//   "Rashḥ‑i‑‘Amá"
//   "(The Clouds of the Realms Above)"
//   "2"
//   "The Seven Valleys"
//     "*"
//   "3"
//   "From the Letter Bá’ to the Letter Há’"
//   "Three Other Tablets"
//     "4"
//     "5"
//     "6"
//   "7"
//   "The Four Valleys"

// export default (data) => {
//   const { content, outline } = structure(
//     'call-divine-beloved',
//     data.slice(
//       0,
//       data.findIndex((d) => d.content === 'Notes'),
//     ),
//     (_, i) => levels[i],
//   );
//   return {
//     content: quotes(content, {
//       '1.1.1': { 1: { extra: 1 } },
//       '1.3.1.14': { 1: null },
//       '1.3.1.56': { 4: null },
//       '1.3.1.65': { 0: { split: ';' } },
//       '1.3.1.73': { 0: null },
//       '1.3.1.108': { 0: { split: '.' } },
//       '1.4.3': { 1: null },
//       '1.5.3.11': { 2: null },
//       '1.6.2': { 0: { split: '.' } },
//       '1.6.15': { 0: { split: 'í.' } },
//       '1.6.20': { 2: null },
//       '1.6.37': { 0: { split: '.' } },
//       '1.6.68': { 0: { split: '.' } },
//     }),
//     outline,
//   };
// };
