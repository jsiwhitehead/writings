{
  hovered:~ ,
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
          @mouse.left = down | @layer.text.@split -> @url,
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
                  [style: ['font-size': (16 * '0.85' ^ (@i - 1))px], @v.@para],
              ],
              => \- (@i) \-,
            ),
          ],
          @layer.content.@render,
        ],
    ],
  [
    mouse:~ ,
    @mouse | '' -> @hovered,
    [
      style: [padding: 50px, 'max-width': 800px, margin: 0 auto],
      @render.[@outline],
    ],
  ],
}