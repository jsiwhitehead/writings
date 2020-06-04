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
  @url
  .1
  .[
    group=>
      {
        (
          @group = d,
          [
            [
              style: ['padding-bottom': 10px],
              \« Back,
              mouse:~ ,
              @mouse.left = down | [] -> @url,
            ],
            @data
            .[v=>> (@v.title.@simple = @url.2, @v)]
            .1
            .items
            .[x=>> @x.@paragraph],
          ],
        ),
        (@group, @page.[@group, @url.2]),
        @stack
        .40
        .[
          [
            [style: ['font-size': 30px, 'font-weight': bold], Author],
            @data
            .[v=>> @v.author: true]
            .[
              v=> k=>
                :
                  [
                    [
                      @k,
                      mouse:~ ,
                      @mouse.left = down | [author, @simple.@k] -> @url,
                    ],
                  ],
            ],
          ],
          [
            [style: ['font-size': 30px, 'font-weight': bold], Category],
            @data
            .[v=>> @v.type: true]
            .[
              v=> k=>
                :
                  [
                    [
                      @k,
                      mouse:~ ,
                      @mouse.left = down | [category, @simple.@k] -> @url,
                    ],
                  ],
            ],
          ],
        ],
      },
  ],
]