[
  x: 800,
  pad: 50,
  gap: 50,
  style: PT Serif 20,
  :
    #data
    .[
      d=>>
        d?.part:
          (d?.part ! 0, d?.name.content = "The Hidden Words: Part One", d?),
    ]
    .[d=>> : [d?]]
    .[
      d=> n=>
        [
          gap: 20,
          [style: center bold, n?],
          :
            d?
            .content
            .[
              c=> i=>
                [
                  style:
                    ({c?.c, i? = 1}, center) ({c?.b, i? = 1}, bold)
                    (c?.i, italic),
                  c?.content,
                ],
            ],
        ],
    ],
]