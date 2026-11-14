export const games = [
  {
    "id": 0,
    "title": "Peças em aproximação",
    "icon": "↔",
    "subtitle": "Distância, ritmo e posições seguras",
    "rules": "Mova uma das duas peças 1 ou 2 casas em direção à outra, sem saltar nem ocupar a mesma casa. Quem não puder mover perde.",
    "analysis": "Conte as casas vazias entre as peças. As posições com quantidade múltipla de 3 são perdedoras para quem vai jogar. Deixe esse múltiplo ao adversário.",
    "variants": [
      20,
      12,
      17,
      24
    ]
  },
  {
    "id": 1,
    "title": "Duas pilhas",
    "icon": "◉",
    "subtitle": "Um movimento. Duas possibilidades.",
    "rules": "Retire qualquer quantidade positiva de uma única pilha ou a mesma quantidade positiva das duas. Quem não puder jogar perde.",
    "analysis": "Explore os pares perdedores (0,0), (1,2), (3,5), (4,7), (6,10)… A ordem das pilhas não importa. Busque uma jogada que deixe um desses pares.",
    "variants": [
      [
        7,
        5
      ],
      [
        3,
        5
      ],
      [
        8,
        13
      ],
      [
        10,
        16
      ]
    ]
  },
  {
    "id": 2,
    "title": "Potências primas",
    "icon": "ⁿ",
    "subtitle": "Primos que mudam o jogo",
    "rules": "Retire pⁿ objetos, em que p é primo e n é inteiro não negativo. Assim, retirar 1 também é permitido. Quem retirar o último vence.",
    "analysis": "As posições múltiplas de 6 são perdedoras. Nenhuma potência prima é múltipla de 6; de qualquer outro resto é possível chegar a um múltiplo de 6 retirando 1, 2, 3, 4 ou 5.",
    "variants": [
      1001,
      25,
      42,
      79
    ]
  },
  {
    "id": 3,
    "title": "Até a metade",
    "icon": "½",
    "subtitle": "Quanto você deve deixar?",
    "rules": "Retire de 1 até a parte inteira da metade do total atual. Quando sobra 1 objeto, não há jogada: quem está na vez perde.",
    "analysis": "As posições perdedoras são 1, 3, 7, 15, 31… ou 2ᵏ−1. Entre duas dessas posições, procure retirar a diferença para a menor delas.",
    "variants": [
      300,
      15,
      31,
      50
    ]
  },
  {
    "id": 4,
    "title": "Maioria no tabuleiro",
    "icon": "×",
    "subtitle": "Cada linha é uma disputa",
    "rules": "Dois jogadores locais colocam X e O alternadamente em casas vazias. Com o tabuleiro cheio, cada linha e cada coluna dá 1 ponto a quem tiver a maioria nela. Vence a maior pontuação.",
    "analysis": "Em dimensões ímpares, investigue jogar no centro e responder por simetria central. As linhas e colunas fora do centro se agrupam em pares com maiorias opostas; a linha e a coluna centrais ficam com maioria de X.",
    "variants": [
      9,
      3,
      5,
      7
    ]
  },
  {
    "id": 5,
    "title": "Dividir para jogar",
    "icon": "⑂",
    "subtitle": "Uma pilha vira muitas",
    "rules": "Em cada turno, escolha uma ou mais pilhas com pelo menos 2 moedas. Divida cada pilha escolhida exatamente uma vez em duas partes positivas. Confirme o turno quando terminar. Quem não puder dividir perde.",
    "analysis": "Uma posição só com pilhas ímpares é perdedora: toda divisão de uma pilha ímpar cria uma par e uma ímpar. Se houver pilhas pares, divida todas elas em duas partes ímpares. Isso devolve ao adversário uma posição só com pilhas ímpares.",
    "variants": [
      2026,
      8,
      15,
      24
    ]
  },
  {
    "id": 6,
    "title": "Territórios retangulares",
    "icon": "▦",
    "subtitle": "Conquiste espaço com cuidado",
    "rules": "Selecione dois cantos de um retângulo e confirme. Ele deve estar vazio e nenhuma de suas casas pode compartilhar lado ou vértice com casas pintadas antes. Quem não encontrar retângulo legal perde.",
    "analysis": "Num tabuleiro de lado par, o primeiro pode pintar o quadrado central 2×2. Depois, responda por simetria central: as regiões opostas ficam separadas pelas faixas bloqueadas. No tabuleiro de lado 2026, os índices centrais são 1013 e 1014 (contagem a partir de 1).",
    "variants": [
      8,
      6,
      10,
      12
    ]
  },
  {
    "id": 7,
    "title": "Paridade secreta",
    "icon": "≡",
    "subtitle": "O resultado começa no resto",
    "rules": "A cada rodada, cada jogador escolhe em segredo um inteiro positivo. No modo paridade, o Jogador 1 vence se o produto for par e o Jogador 2 vence se for ímpar. No modo módulo 3, números divisíveis por 3 são proibidos: resto 1 dá ponto ao Jogador 1 e resto 2 ao Jogador 2. Vence a melhor de cinco rodadas. Ambos confirmam quando estão prontos para a próxima rodada.",
    "analysis": "Na paridade, escolher um número par garante produto par. No módulo 3, não há escolha fixa que garanta vitória. O computador sorteia com probabilidades iguais as classes 1 e 2; sob essa hipótese cada jogador tem probabilidade 1/2. Não existe distribuição uniforme sobre todos os inteiros positivos.",
    "variants": [
      2,
      3
    ]
  },
  {
    "id": 9,
    "title": "O último ponto",
    "icon": "●",
    "subtitle": "Às vezes, terminar é perder",
    "rules": "Apague 1, 2 ou 3 pontos em cada turno. Quem apagar o último ponto perde imediatamente.",
    "analysis": "Deixe quantidades congruentes a 1 módulo 4: 1, 5, 9, 13… Se o adversário retirar r, responda com 4−r, quando possível, evitando retirar o último.",
    "variants": [
      20,
      13,
      25,
      32
    ]
  }
];
