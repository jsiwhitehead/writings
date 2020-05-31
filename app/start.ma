{
  para:
    [
      item=>
        {
          inner:
            [
              : (@item.list, li),
              style:
                [
                  'font-size':
                    (@item.title, {16 * 1.4 ^ (2 - #(@item.index))}px),
                  'text-align': (@item.title, #(@item.index) = 1, center),
                  'text-indent':
                    (! {@item.title, @item.quote, @item.list}, 40px),
                  'font-weight': ({@item.title, @item.quote}, bold),
                  'margin-left':
                    {(@item.quote, 40px), (@item.list, (@item.list * 40 - 5)px)}
                  ,
                  'margin-top': (i ! 1, 20px),
                  'list-style-type': (@item.list, disc),
                  'padding-left': (@item.list, 5px),
                ],
              (@item.quote, \“){@item.content}(@item.quote, \”),
            ],
          (@item.list, [: ul, @inner], => @inner),
        },
    ],
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
    @data.items.[x=>> @x.@para],
  ],
}