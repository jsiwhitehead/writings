export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/tablets-bahaullah/tablets-bahaullah.xhtml',
  start: 'Lawḥ‑i‑Karmil',
  end: 'Passages Translated by Shoghi Effendi',
  smallBreak: true,
  classes: {
    'brl-text-larger1': { header: 3 },
  },
};

export default data =>
  data
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (
        prev &&
        d.info[0][1].content !== 'Excerpts from Other Tablets' &&
        !d.info[1][1].content
      ) {
        d.info[1][1] = prev.info[1][1];
      }
      return [...res, d];
    }, [])
    .map(({ info, content }) => {
      const result = { type: 'Tablet', author: 'Bahá’u’lláh', content } as any;
      if (info[0][1].content === 'Excerpts from Other Tablets') {
        return { ...result, excerpt: true, type: 'Writings' };
      }
      result.name = { content: info[1][1].content.slice(1, -1) };
      if (
        [
          'Tablet of Wisdom',
          'Tablet of Maqṣúd',
          'Tablet of the Proof',
        ].includes(result.name.content) &&
        info[1][0] === 1
      ) {
        result.type = 'Info';
        delete result.author;
      }
      if (
        [
          'Glad‑Tidings',
          'Ornaments',
          'Effulgences',
          'Words of Paradise',
          'Splendors',
        ].includes(result.name.content)
      ) {
        result.part = info[2][0];
        if (info[2][1].content) {
          result.content.unshift({
            header: 3,
            content: info[2][1].content
              .replace('Ṭaráz', 'Ornament')
              .replace('Tajallí', 'Effulgence')
              .replace('Ishráq', 'Splendor'),
          });
        }
      }
      return result;
    })
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (
        prev &&
        prev.name &&
        d.name &&
        prev.name.content === d.name.content &&
        !(prev.content[0].header === 3) &&
        !(d.content[0].header === 3)
      ) {
        prev.content.push(...d.content);
        return res;
      }
      return [...res, d];
    }, [])
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (
        d.name &&
        d.name.content === 'Words of Paradise' &&
        d.content[0].header === 3
      ) {
        d.content.unshift(prev.content.pop());
      }
      return [...res, d];
    }, [])
    .filter(d => d.content.length > 0)
    .reduce((res, d) => {
      const prev = res[res.length - 1];
      if (prev && prev.part && d.part && d.part !== 1) d.part = prev.part + 1;
      return [...res, d];
    }, []);
