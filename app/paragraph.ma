[
  item=>
    {
      inner:
        [
          : (@item.list, li),
          style:
            [
              'font-size': (@item.title, {16 * '1.12' ^ (3 - #(@item.index))}px)
              ,
              'text-align': (@item.center, center),
              'text-indent': (! {@item.title, @item.quote, @item.list}, 40px),
              'font-weight': ({@item.title, @item.quote}, bold),
              'font-style': (@item.italic, italic),
              'font-variant': (@item.caps, 'small-caps'),
              'margin-left':
                {(@item.quote, 40px), (@item.list, (@item.list * 40 - 5)px)},
              'margin-top': (i ! 1, 20px),
              'list-style-type': (@item.list, disc),
              'padding-left': (@item.list, 5px),
            ],
          (@item.quote, \“),
          :
            @item
            .content
            .[
              c=>>
                [
                  : span,
                  style:
                    [
                      'font-weight': ({@c.q, @c.b}, bold),
                      'font-style': (@c.i, italic),
                    ],
                  (@c.q, \“),
                  @c.content,
                  (@c.q, \”),
                ],
            ],
          (@item.quote, \”),
        ],
      (@item.list, [: ul, @inner], => @inner),
    },
]