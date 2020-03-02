{
  isValue: [v=> !v?.[=>> ""]],
  [
    [data, context]=>
      {
        (isValue?.data?, data?),,

        [
          style:=,
          color: c,
          fill:=,
          x:=,
          y:=,
          cols:=,
          gap:=,
          round:=,
          pad:=,
          image:=,
          input:=,
          value:=,
          hover:=,
          click:=,
          enter:=,
          focus:=,
          => indices,
        ]:
          data?,
        size:
          {
            [align: xAlign, size: width]: x?.#parseSize,
            [align: yAlign, size: height]: y?.#parseSize,
            xAlign: {xAlign?, middle},
            yAlign: {yAlign?, (height?, middle, => top)},
            [
              maxWidth: {width?, auto},
              width: ({xAlign? = left, xAlign? = right}, auto, => 100\%),
              height:=?,
              float: ({xAlign? = left, xAlign? = right}, xAlign?, => none),
              marginLeft: (xAlign? ! left, auto),
              marginRight: (xAlign? ! right, auto),
            ],
          },
        borderRadius: round?.#parseDirs.#px,
        actions: [hover:=?, click:=?, enter:=?],,

        (
          image?,
          [: img, : actions?, style: [borderRadius:=?, : size?], src: image?],
        ),,

        [bullet:=, hidden:=, => style]: #parseStyle.style?,
        context: [: context?, : style?, color: c?],
        children: indices?.[v=>> dom?.[v?, context?]],,

        [size:=, height:=, color:=, flow:=, => style]: context?,
        height: (input?, 1.5, => height?),
        textStyle:
          [
            fontSize: {size?}px,
            lineHeight: {#floor.(size? * height?)}px,
            minHeight: {size?}px,
            color: #parseColor.color?,
            : style?,
          ],,

        (flow?, [: span, style: textStyle?, : actions?, : children?]),,

        pad: #parseDirs.pad?,
        boxStyle:
          [
            background: #parseColor.fill?,
            borderRadius:=?,
            padding: #px.[pad?.1 + 1, pad?.2, pad?.3 + 1, pad?.4],
            overflow: hidden,
            : size?,
          ],
        diff: #floor.(size? * (height? - 1)) * (-0.5),,

        (
          input?,
          [
            style: boxStyle?,
            : actions?,
            [
              : input,
              type: (hidden?, password, => text),
              style:
                [
                  : textStyle?,
                  margin: #px.[#floor.diff? - 1, 0, #ceil.diff? - 1],
                ],
              focus:=?,
              value:=?,
            ],
          ],
        ),,

        inline: children?.[c=>> {isValue?.c?, c?."" = span}],
        cols:
          {
            [cols:=, equal:=]: cols?.#parseCols,
            gap: gap?.#parseDirs,
            cols: {(cols? = all, #(children?)), cols?, (gap?.1 ! 0, 1)},
            [cols:=?, equal:=?, gap:=?],
          },
        (
          cols?.cols,
          [
            : table,
            : actions?,
            style:
              [: boxStyle?, tableLayout: fixed, width: 100\%, padding: #px.pad?]
            ,
            :
              #(#ceil.(#(children?) / cols?.cols))
              .[
                i=>>
                  :
                    [
                      (i? ! 1, [: tr, style: [height: {cols?.gap.1}px]]),
                      [
                        : tr,
                        :
                          #(cols?.cols)
                          .[
                            j=>>
                              :
                                [
                                  (
                                    j? ! 1,
                                    [: td, style: [width: {cols?.gap.2}px]],
                                  ),
                                  {
                                    index: (i? - 1) * cols?.cols + j?,
                                    (
                                      inline?.index?,
                                      [
                                        : td,
                                        style: [padding: 1px 0],
                                        [
                                          style:
                                            [
                                              margin:
                                                #px
                                                .[
                                                  #floor.diff? - 1,
                                                  0,
                                                  #ceil.diff? - 1,
                                                ],
                                            ],
                                          children?.index?,
                                        ],
                                      ],
                                    ),
                                    (
                                      !children?.index?."",
                                      [: children?.index?, : td],
                                    ),
                                    [: td, children?.index?],
                                  },
                                ],
                          ],
                      ],
                    ],
              ],
          ],
        ),,

        getMargin:
          [
            [i, j]=>
              #px
              .[
                (inline?.i?, #floor.diff?, => 0) - 1,
                0,
                (inline?.j?, #ceil.diff?, => 0) - 1,
              ],
          ],
        [
          : actions?,
          style: boxStyle?,
          [
            style: [: textStyle?, margin: getMargin?.[1, #(children?)]],
            :
              children?
              .[
                c=> i=>
                  (
                    inline?.i?,
                    c?,
                    =>
                      [
                        style: [padding: 1px 0],
                        [style: [margin: getMargin?.[i? - 1, i? + 1]], c?],
                      ],
                  ),
              ],
          ],
        ],
      },
  ],
}