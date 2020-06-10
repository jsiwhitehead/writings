import { capitalise, last } from './utils';

const sliceContent = ({ content, spans }, start, end?) => ({
  content: content.slice(start, end),
  spans: spans
    ?.filter((s) => s.start >= start && (!end || s.end <= end))
    .map((s) => ({ ...s, start: s.start - start, end: s.end - start })),
});
const trimContent = (c) =>
  sliceContent(c, c.content.search(/\S/), c.content.search(/\s*$/));
const joinContent = (...contents) => {
  const result = { content: '', spans: [] as any[] };
  contents.forEach((c) => {
    if (typeof c === 'string') {
      result.content += c;
    } else {
      result.spans.push(
        ...(c.spans || []).map((s) => ({
          ...s,
          start: s.start + result.content.length,
          end: s.end + result.content.length,
        })),
      );
      result.content += c.content;
    }
  });
  if (result.spans.length === 0) delete result.spans;
  return result;
};

export default (data, infos) =>
  data.map((d) => {
    if (!d.notes) return d;
    const spans = [...(d.spans || [])];
    const quoteSpans = [] as any[];
    let start;
    while (
      (start = d.content.slice(last(quoteSpans)?.end).indexOf('“')) !== -1
    ) {
      start += last(quoteSpans)?.end || 0;
      const end = d.content.slice(start).indexOf('”') + 1;
      if (end) quoteSpans.push({ start, end: start + end });
      else quoteSpans.push({ start, end: d.content.length });
    }
    if (spans.some((s) => s.type === 'l')) {
      quoteSpans.push({ start: 0, end: d.content.length });
    }
    const notes = d.notes.filter((n) => {
      const i = quoteSpans.findIndex((x) => Math.abs(n.position - x.end) <= 1);
      if (i === -1) return true;
      const info = infos[d.index]?.[i];
      if (info === null) return true;
      const split = info?.split && n.content[0].content.indexOf(info.split);
      spans.push(
        ...quoteSpans.slice(i - (info?.extra || 0), i + 1).map((q) => ({
          ...q,
          type: 'q',
          content: split
            ? [
                joinContent(
                  sliceContent(n.content[0], 0, split),
                  info.split.slice(0, -1),
                  '.',
                ),
              ]
            : n.content,
        })),
      );
      if (split) {
        n.content = [
          trimContent(sliceContent(n.content[0], split + info.split.length)),
          ...n.content.slice(1),
        ];
        n.content[0].content = capitalise(n.content[0].content);
        return true;
      }
    });
    const res = { ...d, spans, notes };
    if (res.spans.length === 0) delete res.spans;
    if (res.notes.length === 0) delete res.notes;
    return res;
  });
