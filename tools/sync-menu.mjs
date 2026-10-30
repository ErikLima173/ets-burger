// Sincroniza o cardápio da landing page com o Cardápio Web oficial.
// Uso: cd tools && npm install && npm run sync
// Gera ../js/menu.js e baixa as fotos para ../assets/menu/
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://integracao.cardapioweb.com/api/menu/company/categories?only_available_for=delivery&origin=catalogo";
const IMG_DIR = path.join(ROOT, "assets", "menu");

// Limpa as hashtags de SEO que vêm coladas nas descrições
const clean = (s) => (s || "").split(/\s"?#/)[0].replace(/"$/, "").replace(/\s+/g, " ").trim();

// Itens com preço 0 têm o preço definido pelas variações obrigatórias
function minPrice(item) {
  if (item.price > 0) return { preco: item.price, aPartirDe: false };
  const required = (item.add_ons || []).filter((a) => a.minimum_quantity > 0 && a.status === "ACTIVE");
  let total = 0;
  for (const a of required) {
    const prices = (a.subitems || []).filter((s) => s.status !== "INACTIVE").map((s) => s.price).filter((p) => p > 0);
    if (prices.length) total += Math.min(...prices) * a.minimum_quantity;
  }
  return total > 0 ? { preco: Math.round(total * 100) / 100, aPartirDe: true } : null;
}

const exists = (f) => fs.access(f).then(() => true, () => false);

// Duas versões: 640px para os cards e 160px para miniaturas (listas e sacola)
async function saveImage(url, id) {
  const file = path.join(IMG_DIR, `${id}.webp`);
  const small = path.join(IMG_DIR, `${id}-sm.webp`);
  if (!(await exists(file))) {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
  }
  if (!(await exists(small))) await sharp(file).resize({ width: 160 }).webp({ quality: 74 }).toFile(small);
  return { foto: `assets/menu/${id}.webp`, fotoSm: `assets/menu/${id}-sm.webp` };
}

const res = await fetch(API, { headers: { company: "ets_burger" } });
if (!res.ok) throw new Error(`API respondeu ${res.status}`);
const cats = await res.json();
await fs.mkdir(IMG_DIR, { recursive: true });

const categorias = [];
for (const c of cats) {
  if (c.status !== "ACTIVE") continue;
  const itens = [];
  for (const i of c.items) {
    if (i.status !== "ACTIVE" || i.kind === "combo" || /\(c[óo]pia\)/i.test(i.name)) continue;
    const p = minPrice(i);
    if (!p) continue;
    const img = (i.image_url && (await saveImage(i.image_url, i.id))) || { foto: null, fotoSm: null };
    itens.push({
      id: String(i.id),
      nomeOriginal: i.name.trim(),
      descricao: clean(i.description),
      ...p,
      ...img,
      maiores18: i.adults_only || /maiores de 18/i.test(i.description || "")
    });
  }
  if (itens.length) categorias.push({ id: String(c.id), nome: c.name.trim(), itens });
}

const out = `/* GERADO AUTOMATICAMENTE por tools/sync-menu.mjs em ${new Date().toISOString().slice(0, 10)}.
   Não edite à mão: rode o script de novo para atualizar preços e fotos.
   Ajustes de texto, etiquetas e destaques ficam em js/data.js. */
window.ETS_MENU = ${JSON.stringify({ atualizado: new Date().toISOString().slice(0, 10), categorias }, null, 1)};
`;
await fs.writeFile(path.join(ROOT, "js", "menu.js"), out);
console.log(`${categorias.length} categorias, ${categorias.reduce((a, c) => a + c.itens.length, 0)} itens.`);
