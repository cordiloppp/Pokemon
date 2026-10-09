const API = "https://pokeapi.co/api/v2";
const SPRITE = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const form = document.getElementById("search-form");
const input = document.getElementById("search");
const results = document.getElementById("results");
const detail = document.getElementById("detail");
const status = document.getElementById("status");

let allPokemon = [];
let detailRequest = 0;

const idFromUrl = (url) => Number(url.split("/").filter(Boolean).pop());

async function loadList() {
  status.textContent = "Cargando Pokémon...";
  const res = await fetch(`${API}/pokemon?limit=1025`);
  const data = await res.json();
  allPokemon = data.results.map((p) => ({ name: p.name, id: idFromUrl(p.url) }));
  status.textContent = "";
  renderList(filter(input.value));
}

function renderList(list) {
  results.innerHTML = "";
  if (list.length === 0) {
    status.textContent = "No se encontró ningún Pokémon.";
    return;
  }
  status.textContent = "";
  for (const p of list.slice(0, 200)) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${SPRITE(p.id)}" alt="${p.name}" loading="lazy" />
      <div class="num">#${String(p.id).padStart(3, "0")}</div>
      <div class="name">${p.name}</div>`;
    card.addEventListener("click", () => showDetail(p.id));
    results.appendChild(card);
  }
}

function filter(query) {
  const q = query.trim().toLowerCase();
  if (!q) return allPokemon.slice(0, 151);
  if (/^\d+$/.test(q)) return allPokemon.filter((p) => String(p.id).startsWith(q));
  return allPokemon.filter((p) => p.name.includes(q));
}

async function showDetail(idOrName) {
  const request = ++detailRequest;
  status.textContent = "Cargando...";
  try {
    const res = await fetch(`${API}/pokemon/${idOrName}`);
    if (!res.ok) throw new Error();
    const p = await res.json();
    if (request !== detailRequest) return;
    const img =
      p.sprites.other["official-artwork"].front_default || p.sprites.front_default;
    detail.innerHTML = `
      <img src="${img}" alt="${p.name}" />
      <div class="info">
        <h2>#${String(p.id).padStart(3, "0")} ${p.name}</h2>
        <p>${p.types.map((t) => `<span class="type">${t.type.name}</span>`).join("")}</p>
        <p>Altura: ${p.height / 10} m · Peso: ${p.weight / 10} kg</p>
        ${p.stats
          .map(
            (s) => `
          <div class="stat">
            <span>${s.stat.name}</span>
            <span>${s.base_stat}</span>
            <div class="bar"><div style="width:${Math.min(s.base_stat / 2, 100)}%"></div></div>
          </div>`
          )
          .join("")}
      </div>`;
    detail.hidden = false;
    status.textContent = "";
    detail.scrollIntoView({ behavior: "smooth" });
  } catch {
    if (request !== detailRequest) return;
    status.textContent = "No se encontró ese Pokémon.";
  }
}

input.addEventListener("input", () => renderList(filter(input.value)));

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const matches = filter(input.value);
  if (matches.length > 0) showDetail(matches[0].id);
  else if (input.value.trim()) showDetail(input.value.trim().toLowerCase());
});

loadList().catch(() => {
  status.textContent = "Error al cargar la lista de Pokémon.";
});
