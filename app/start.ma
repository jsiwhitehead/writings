{
  hovered:~ ,
  [
    mouse:~ ,
    @mouse | '' -> @hovered,
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
      smoothed: @smooth.@hovered,
      render:
        [
          layer=> i=>
            [
              mouse:~ ,
              @mouse | @layer.text -> @hovered,
              style:
                [
                  padding: 6px 20px,
                  'padding-bottom': (@layer.content, 6px, 0px),
                  'font-weight': (@layer.text = @smoothed, bold, => normal),
                  background: (@startswith.[@layer.text, @smoothed], '#B3E5FC'),
                  cursor: pointer,
                ],
              [
                style: ['padding-bottom': (@layer.content, 0px, 6px)],
                (
                  @layer.title,
                  @layer
                  .title
                  .[
                    v=> i=>
                      [
                        style: ['font-size': (16 * '0.85' ^ (@i - 1))px],
                        @v.@para,
                      ],
                  ],
                  => Part (@i),
                ),
              ],
              @layer.content.@render,
            ],
        ],
      @render.[@data.outline],
    },
  ],
}