{
  para:
    [
      span=>>
        (
          @span.type = break,
          [: br],
          =>
            [
              : span,
              style:
                [
                  'font-weight': ({@span.type = b}, bold),
                  'font-style': (@span.type = i, italic),
                  'text-decoration': (@span.type = u, underline),
                ],
              (@span.type = quote, \“)(@span.content)(@span.type = quote, \”),
            ],
        ),
    ],
  [
    style: [padding: 50px, 'max-width': 800px, margin: 0 auto],
    @getContent
    .@url
    .[
      part=>>
        (
          @part.title,
          @part
          .title
          .[
            style: ['padding-top': 50px],
            v=> i=>
              [
                style:
                  [
                    'font-size': (24 * '0.85' ^ (@i - 1))px,
                    'text-align': center,
                    'font-weight': bold,
                  ],
                @v.@para,
              ],
          ],
          =>
            [
              [
                style:
                  [
                    'font-size': 24px,
                    'padding-top': 30px,
                    'text-align': center,
                    'font-weight': bold,
                  ],
                \⭑,
              ],
              @data
              .[
                d=>>
                  (
                    @startswith.[@d.index, @part.text],
                    [
                      style:
                        [
                          'padding-top': 20px,
                          'text-indent': (@d.type ! lines, 30px),
                          'padding-left':
                            ({@d.type = block, @d.type = lines}, 30px),
                        ],
                      @d.content.@para,
                    ],
                  ),
              ],
            ],
        ),
    ],
  ],
}