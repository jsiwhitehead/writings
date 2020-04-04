export const config = {
  url:
    'https://www.bahai.org/library/authoritative-texts/abdul-baha/travelers-narrative/travelers-narrative.xhtml',
  start:
    'Touching the individual known as the Báb and the true nature of this sect diverse tales are on the tongues and in the mouths of men, and various accounts are contained in the pages of Persian history and the leaves of European chronicles. But because of the variety of their assertions and the diversity of their narratives not one is as worthy of confidence as it should be. Some have loosed their tongues in extreme censure and condemnation; some foreign chronicles have spoken in a commendatory strain; while a certain section have recorded what they themselves have heard without addressing themselves either to censure or approbation.',
  end: 'Notes',
};

export default (data) => [
  {
    type: 'History',
    author: '‘Abdu’l‑Bahá',
    name: { content: 'A Traveler’s Narrative' },
    content: data[0].content,
  },
];
