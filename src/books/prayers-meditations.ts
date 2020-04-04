export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/bahaullah/prayers-meditations/prayers-meditations.xhtml',
  start:
    'Glorified art Thou, O Lord my God! Every man of insight confesseth Thy sovereignty and Thy dominion, and every discerning eye perceiveth the greatness of Thy majesty and the compelling power of Thy might. The winds of tests are powerless to hold back them that enjoy near access to Thee from setting their faces towards the horizon of Thy glory, and the tempests of trials must fail to draw away and hinder such as are wholly devoted to Thy will from approaching Thy court.',
  end:
    'This document has been downloaded from the . You are free to use its content subject to the terms of use found at',
  classes: {
    'brl-global-instructions': { block: true, i: true },
    'brl-margin-4': { block: true },
  },
};

export default (data) =>
  data.map(({ content }) => {
    const categories = {} as any;
    if (
      [
        'Magnified art Thou, O Lord my God! I ask Thee by Thy Name',
        'O God! The trials Thou sendest are a salve to the sores of all',
        'Praised be Thou, O Lord my God! Thou art He Who hath created',
        'Magnified be Thy name, O Thou in Whose grasp are the reins of the',
      ].some((s) => content[0].content.startsWith(s))
    ) {
      categories.Women = true;
    }
    const result = {
      type: 'Prayer',
      author: 'Bahá’u’lláh',
      content: content.filter(
        (x) =>
          ![
            'Short obligatory',
            'Medium obligatory',
            'Long obligatory',
            'Tablet of Visitation',
            'Prayer for the Dead',
          ].some((s) => x.content.includes(s)),
      ),
    } as any;
    if (Object.keys(categories).length > 0) {
      result.categories = categories;
    }
    return result;
  });
