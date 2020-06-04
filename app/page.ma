[
  [group, value]=>
    {
      items:
        @data
        .[
          v=>>
            (@v.(@group.[author: author, category: type]).@simple = @value, @v),
        ],
      [
        [
          style: ['padding-bottom': 10px],
          \« Back,
          mouse:~ ,
          @mouse.left = down | [] -> @url,
        ],
        @stack
        .40
        .[
          [
            style: ['font-size': 30px, 'font-style': bold],
            (@group.[author: Author, category: Category])\:
            (@items.1.(@group.[author: author, category: type])),
          ],
          @stack
          .20
          .(
            @items
            .[
              v=>>
                [
                  @v.title,
                  mouse:~ ,
                  @mouse.left = down | [d, @v.title.@simple] -> @url,
                ],
            ],
          ),
        ],
      ],
    },
]