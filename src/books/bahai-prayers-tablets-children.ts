export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/prayers/bahai-prayers-tablets-children/bahai-prayers-tablets-children.xhtml',
  start:
    'Praised be Thou, O Lord my God! Graciously grant that this infant be fed from the breast of Thy tender mercy and loving providence and be nourished with the fruit of Thy celestial trees. Suffer him not to be committed to the care of anyone save Thee, inasmuch as Thou, Thyself, through the potency of Thy sovereign will and power, didst create and call him into being. There is none other God but Thee, the Almighty, the All‑Knowing.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  smallBreak: true,
};

export default (data) =>
  data.map(({ content }) => ({
    type: 'Prayer',
    author: content.pop().content.split(' ')[0].slice(1),
    categories: { Children: true },
    content,
  }));
