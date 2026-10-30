# ET's Burger

Landing page da ET's Burger, hamburgueria temática de Jarinu, SP.
Site estático (HTML, CSS e JS) com GSAP via CDN. Não precisa de build.

## Rodar localmente

```bash
npx http-server -p 5173 -c-1
```

## Onde editar

- `js/data.js`: links de pedido, endereço, horários, destaques do cardápio, textos criativos e avaliações.
- `js/menu.js`: cardápio completo com preços e fotos. **Gerado automaticamente**, não edite à mão.

## Atualizar cardápio e preços

O cardápio é sincronizado com o Cardápio Web oficial:

```bash
cd tools
npm install
npm run sync
```

Isso regenera `js/menu.js` e baixa fotos novas para `assets/menu/`. Depois é só fazer commit e push.

## Antes de divulgar

- As avaliações em `js/data.js` são exemplos de demonstração. Troque por relatos reais e mude `demo` para `false`.
- Confirme a fonte da nota 4,9 (`notaGeral.fonte`).
