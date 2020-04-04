export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/additional-prayers-revealed-bahaullah/additional-prayers-revealed-bahaullah.pdf',
  start:
    'Pure and sanctified art Thou, O my God! How can the pen move and the ink flow after the breezes of loving-kindness have ceased, and the signs of bounty have vanished, when the sun of abasement hath risen, and the swords of calamity are drawn, when the heavens of sorrow have been upraised, and the darts of affliction and the lances of vengeance have rained from the clouds of power —in such wise that the signs of joy have departed from all hearts, and the tokens of gladness have been erased from every horizon, the gates of hope have been shut, the mercy of the supernal breeze hath ceased to waft over the rose-garden of faithfulness, and the whirlwind of extinction hath struck the tree of existence. The pen is groaning, and the ink bewaileth its plight, and the tablet is awestruck at this cry. The mind is in turmoil from the taste of this pain and sorrow, and the divine Nightingale calleth: “Alas! Alas! for all that hath been made to appear”. And this, O my God, is from naught but Thy hidden bounties.',
  end:
    'This document has been downloaded from the Bahá’í Reference Library. You are free to use its content subject to the terms of use found at www.bahai.org/legal',
};

export default (data) =>
  data
    .reduce(
      (res, d) => {
        if (d.i) d.c = true;
        if (d.content !== '—Bahá’u’lláh') res[res.length - 1].push(d);
        else res.push([]);
        return res;
      },
      [[]],
    )
    .filter((x) => x.length > 0)
    .map((content) => ({
      type: 'Prayer',
      author: 'Bahá’u’lláh',
      content,
    }));
