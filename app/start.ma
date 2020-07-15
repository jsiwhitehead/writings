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
    hovered:~ ,
    render:
      [
        layer=> i=>
          [
            mouse:~ ,
            @mouse | @layer.text -> @hovered,
            style:
              [
                padding: 10px 20px,
                'padding-bottom': (@layer.content, 10px, 0px),
                background: (@startswith.[@layer.text, @hovered], lightgrey),
                cursor: pointer,
              ],
            [
              style: ['padding-bottom': (@layer.content, 0px, 10px)],
              (@layer.title, @layer.title.[v=>> @v.@para], => Part (@i)),
            ],
            @layer.content.@render,
          ],
      ],
    @render.[@data.outline],
  },
]