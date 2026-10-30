/*
  ET'S BURGER · CENTRAL DE DADOS
  Links, endereço, horários, destaques e avaliações. O cardápio com
  preços e fotos vem de js/menu.js (rode tools/sync-menu.mjs para atualizar).
*/
window.ETS = {
  links: {
    cardapio: "https://app.cardapioweb.com/ets_burger",
    ifood: "https://www.ifood.com.br/delivery/jarinu-sp/ets-burger-centro/d705625f-702d-4148-835b-1493fa6e403b",
    whatsappNumero: "5511968603872",
    whatsappExibicao: "(11) 96860-3872",
    instagram: "https://www.instagram.com/etsburger/",
    instagramUser: "@etsburger",
    mapa: "https://www.google.com/maps/search/?api=1&query=Av.+%C3%82ngelo+Bernucci%2C+157%2C+Centro%2C+Jarinu+SP"
  },

  endereco: {
    rua: "Av. Ângelo Bernucci, 157",
    bairro: "Centro, Jarinu, SP",
    coordenadas: "23°06'S · 46°43'W"
  },

  horarios: [
    { dias: "Segunda a sábado", hora: "11h às 23h" },
    { dias: "Domingo", hora: "17h às 23h" }
  ],

  // Abertura e fechamento em horas cheias. 0 = domingo.
  expediente: { 0: [17, 23], 1: [11, 23], 2: [11, 23], 3: [11, 23], 4: [11, 23], 5: [11, 23], 6: [11, 23] },

  premio: {
    titulo: "2º Melhor Burger do Brasil",
    fonte: "Burger Crew 24",
    produto: "Salamaleico"
  },

  // O cardápio completo (preços, fotos, categorias) vem de js/menu.js,
  // gerado por tools/sync-menu.mjs a partir do Cardápio Web oficial.
  // Aqui ficam só os ajustes de marca, ligados pelo id do item no Cardápio Web.

  // Ordem da aba "Destaques". O primeiro vira o card grande.
  destaques: ["4780548", "4780552", "4780720", "4780568", "4780740", "4780638", "4780712"],

  // Categorias do Cardápio Web que não viram aba (os itens já aparecem em outra)
  ocultarCategorias: ["2° Melhor Burger do Brasil", "Combo Kids"],

  // Nome curto para as abas
  nomesCategorias: { "Smash's": "Smash", "Burgers Artesanais 180g": "Artesanais 180g", "Porções de outro Mundo": "Porções de outro mundo", "Milk Shakes Espaciais": "Milk shakes" },

  // Categorias exibidas em lista compacta (sem card grande)
  categoriasCompactas: ["Bebidas", "Bebidas Cósmicas", "Molhos da Casa", "Sobremesas", "Milk Shakes Espaciais"],

  // Ajustes por item. Campos: nome, subtitulo, etiqueta, frase (texto criativo)
  extras: {
    "4780548": { nome: "Salamaleico", subtitulo: "Eleito o 2º melhor burger do Brasil", etiqueta: "PREMIADO", frase: "Rota árabe com escala em outra galáxia. Doce, ácido, crocante e fresco na mesma mordida." },
    "4780552": { nome: "Nº1", subtitulo: "A receita que deu origem a tudo", etiqueta: "MAIS PEDIDO", frase: "O primeiro sinal que mandamos para a Terra. Ainda é o mais captado." },
    "4780706": { nome: "Nº1", subtitulo: "A receita que deu origem a tudo", etiqueta: "MAIS PEDIDO" },
    "4780720": { subtitulo: "Crocância de outro planeta", etiqueta: "NÍVEL EXTRATERRESTRE", frase: "Queijo escorrendo, Doritos por cima e zero vontade de dividir." },
    "4780568": { nome: "X Twist Duplo Smash", subtitulo: "Duas carnes, cebola roxa e picles", etiqueta: "MAIS PEDIDO", frase: "Borda crocante, picles azedinho e o molho que a gente trouxe na bagagem." },
    "4780593": { nome: "X Twist Duplo Smash", subtitulo: "Duas carnes, cebola roxa e picles" },
    "4780740": { subtitulo: "Mussarela empanada e geleia de pimenta", etiqueta: "NÍVEL EXTRATERRESTRE", frase: "Um bloco de mussarela empanada em órbita sobre a carne. Pimenta só para acordar." },
    "4780638": { nome: "Smash Monster", subtitulo: "Quatro carnes. Sem negociação.", etiqueta: "NÍVEL EXTRATERRESTRE", frase: "Para quem chegou com fome de viagem interestelar." },
    "4780712": { nome: "Astro BBQ", subtitulo: "Costela desfiada e molho perfeito", frase: "Costela desfiada, alho frito e o Molho Perfeito, criado pelo Fabrício do @hamburguerperfeito." },
    "4780555": { nome: "X Salada 180g", subtitulo: "O clássico, versão abduzida", etiqueta: "MAIS PEDIDO", frase: "Pão dourado, carne alta e salada fresca. Simples como deveria ser." },
    "4780751": { nome: "Spicy Jalapeño", subtitulo: "Geleia de bacon e jalapeño", frase: "Creme de cheddar, geleia de bacon e um calor que não vem do sol." },
    "4780748": { nome: "Bicho Grilo", subtitulo: "Vegetariano de verdade", etiqueta: "VEGETARIANO", frase: "Nenhuma vaca foi abduzida na produção deste burger." },
    "4780559": { nome: "Combo Kids", subtitulo: "X Burger, fritas e bebida", etiqueta: "MAIS PEDIDO" },
    "4780756": { nome: "Combo Kids", subtitulo: "X Burger, fritas e bebida" },
    "4780577": { nome: "Batata Suprema", subtitulo: "Costela desfiada e Catupiry", etiqueta: "MAIS PEDIDO" },
    "4826460": { descricao: "Maionese verde, maionese da casa, molho espacial, ranch e barbecue." },
  },
  avaliacoes: {
    // Nota real da casa no iFood
    notaGeral: { valor: 4.9, fonte: "iFood" },
    demo: false,
    // Depoimentos só com autorização do cliente. Enquanto a lista estiver vazia,
    // a seção mostra links para os relatos reais no iFood, Google e Instagram.
    // Formato: { nome: "Ana", cidade: "Jarinu, SP", nota: 5, texto: "..." }
    itens: []
  }
};
