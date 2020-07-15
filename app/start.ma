[
  style:
    [
      'font-size': 16px,
      'line-height': 1.5,
      'font-family': PT Serif,
      padding: 50px,
      'max-width': 800px,
      margin: 0 auto,
      color: \#333,
    ],
  {
    para:
      [
        span=>>
          [
            : span,
            style:
              [
                'font-weight': (@span.type = b, bold),
                'font-style': (@span.type = i, italic),
                'text-decoration': (@span.type = u, underline),
              ],
            @span.content,
          ],
      ],
    titlesX: @data.outline.[v=>> : (@v.2.[=>> ], [@v])],
    titles: @data.outline,
    @stack
    .20
    .(
      @titles
      .[
        v=>>
          [
            style:
              [
                'font-weight': bold,
                'font-size':
                  (@v.2.[=>> ], (16 * '1.12' ^ (3 - @v.1))px, => 16px),
                'padding-left': (30 * (@v.1 - 1))px,
              ],
            (
              @v.2.[=>> ],
              @v.2.[x=>> @x.@para],
              =>
                [
                  mouse:~ ,
                  @mouse.left = down | [@v.2] -> @url,
                  style: [color: '#3498db'],
                  Read,
                ],
            ),
          ],
      ],
    ),
  },
]