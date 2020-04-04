const isNumber = (s) =>
  /^(([0-9]+)|(– [0-9]+ –)|(– [MDCLXVI]+ –)|(‑ Chapter [MDCLXVI]+ ‑))$/.test(s);

const convertGaps = (content) =>
  content.reduce((res, { gap, ...c }) => {
    if (
      c.content &&
      (c.header || !isNumber(c.content)) &&
      c.content !== '* * *'
    ) {
      if (isNumber(c.content)) c.content = '';
      res.push(c);
    }
    const g = gap || (c.content === '* * *' ? 2 : 0);
    if (g) {
      if (typeof res[res.length - 1] !== 'number') res.push(0);
      res[res.length - 1] += g;
    }
    return res;
  }, []);

const buildNotes = (content) => {
  const notes = {};
  const withoutNotes = content.filter((c) => {
    if (typeof c !== 'number') {
      const { note, gap, ...rest } = c;
      if (note) {
        notes[note] = notes[note] || [];
        notes[note].push(rest);
        return false;
      }
    }
    return true;
  });
  return withoutNotes.map((c) => {
    if (!c.notes) return c;
    return {
      ...c,
      notes: c.notes.map(({ id, position }) => ({
        position,
        content: notes[id] || [],
      })),
    };
  });
};

const sliceContent = (content, start, end) => {
  const startIndex = content.findIndex((p) => p.content === start);
  const endIndex = content.findIndex((p) => p.content === end);
  return content.slice(
    startIndex === -1 ? 0 : startIndex,
    endIndex === -1 ? undefined : endIndex,
  );
};

const createLevels = (content, smallBreak, titleJoin) =>
  content
    .filter((c, i) => {
      if (typeof c !== 'number') return true;
      return (
        c >= (smallBreak ? 1 : 2) &&
        ![i - 1, i + 1].some(
          (j) => !content[j] || content[j].header || content[j].note,
        )
      );
    }, [])
    .map((c) => {
      if (typeof c === 'number') return c >= 5 ? { level: 2 } : { level: 3 };
      const { header, note, ...r } = c;
      if (note) return { level: 1, note, ...r };
      if (header) return { level: header, ...r };
      return r;
    })
    .reduce((res, c) => {
      const prev = res[res.length - 1];
      if (
        prev &&
        prev.level &&
        prev.level === c.level &&
        !prev.note &&
        !c.note
      ) {
        prev.content = `${prev.content}${
          prev.content && c.content ? titleJoin : ''
        }${c.content}`.trim();
        return res;
      }
      return [...res, c];
    }, []);

const groupItems = (content) => {
  const result = [] as any[];
  let countLevel = 1;
  const info = { 1: [1], 2: [1], 3: [1] } as any;
  while (content.length > 0) {
    const i = content.findIndex((r) => r.level) + 1;
    const c = content.splice(0, i || content.length);
    const item = i ? c.pop() : null;
    if (c.length) {
      result.push({
        info: [1, 2, 3].map((x) => [info[x][0], info[x][1] || {}]),
        content: c,
      });
    }
    if (item) {
      const { level, spans, notes, content } = item;
      countLevel = level;
      info[level][1] = content ? { spans, notes, content } : {};
      for (let j = level + 1; j <= 3; j++) info[j] = [1];
    }
    info[countLevel][0]++;
  }
  const indices = result.map(
    (r, i) =>
      i !== 0 &&
      [0, 1, 2].find((j) => r.info[j][0] !== result[i - 1].info[j][0]),
  ) as any[];
  result.forEach((r, i) => {
    [0, 1, 2].forEach((j) => {
      if (i === 0) {
        r.info[j][0] = 1;
      } else {
        const prev = result[i - 1].info[j][0];
        if (j < indices[i]) r.info[j][0] = prev;
        else if (j === indices[i]) r.info[j][0] = prev + 1;
        else if (j > indices[i]) r.info[j][0] = 1;
      }
    });
  });
  return result;
};

export default (content, start, end, smallBreak, titleJoin = ' ') => {
  return groupItems(
    createLevels(
      sliceContent(buildNotes(convertGaps(content)), start, end),
      smallBreak,
      titleJoin,
    ),
  );
};
