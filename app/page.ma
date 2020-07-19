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
                  'font-weight': ({@span.type = b, @span.type = quote}, bold),
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
            v=> i=> [style: ['font-size': (16 * '0.85' ^ (@i - 1))px], @v.@para]
            ,
          ],
          =>
            @data
            .[
              d=>>
                (
                  @startswith.[@d.index, @part.text],
                  [
                    style:
                      [
                        'padding-top': 20px,
                        'text-indent': (@d.type ! lines, 25px),
                        'padding-left':
                          ({@d.type = block, @d.type = lines}, 25px),
                        'font-weight': (@d.type = block, bold),
                      ],
                    @d.content.@para,
                  ],
                ),
            ],
        ),
    ],
  ],
}