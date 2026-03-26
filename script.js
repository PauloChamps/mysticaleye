const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("open");
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const partesIniciais = [
  "Deus",
  "Jesus",
  "O Senhor",
  "A graça de Deus",
  "A palavra de Deus",
  "A fé",
  "A esperança",
  "A oração",
  "Quem confia no Senhor",
  "Quem busca a presença de Deus",
  "Quem descansa em Cristo",
  "O amor de Deus",
  "A misericórdia do Pai",
  "O Espírito Santo",
  "A fidelidade de Deus",
  "A luz de Cristo"
];

const verbos = [
  "fortalece",
  "renova",
  "transforma",
  "restaura",
  "sustenta",
  "guia",
  "protege",
  "cura",
  "liberta",
  "encoraja",
  "ensina",
  "acolhe",
  "levantará",
  "abençoa",
  "abre caminhos",
  "traz paz"
];

const complementos = [
  "o coração cansado",
  "a mente aflita",
  "a família que ora",
  "quem espera no tempo certo",
  "quem permanece fiel",
  "a vida de quem crê",
  "o lar que busca santidade",
  "os sonhos entregues a Ele",
  "os passos de quem confia",
  "a alma que adora",
  "as mãos que servem",
  "os dias de luta",
  "a caminhada cristã",
  "as escolhas do dia",
  "a missão de amar",
  "quem vive pela fé"
];

const finais = [
  "com propósito eterno.",
  "e nunca abandona os Seus.",
  "mesmo em tempos difíceis.",
  "para a glória de Deus.",
  "em todo tempo.",
  "com amor e verdade.",
  "e concede novo começo.",
  "quando a esperança parece pequena.",
  "e derrama paz verdadeira.",
  "na força do Espírito.",
  "de forma surpreendente.",
  "segundo a Sua vontade.",
  "com cuidado de Pai.",
  "com misericórdia sem fim.",
  "e escreve uma nova história.",
  "para viver o melhor de Deus."
];

const frasesBase = [
  "Com Cristo, toda manhã é recomeço.",
  "A oração de hoje é a vitória de amanhã.",
  "Quando Deus dirige, o medo perde força.",
  "A palavra de Deus ilumina o caminho escuro.",
  "Onde há fé, há esperança viva.",
  "Deus cuida de cada detalhe da sua história.",
  "Seu milagre pode nascer no silêncio da oração.",
  "A graça de Deus é maior que qualquer queda.",
  "Quem confia no Senhor não caminha sozinho.",
  "Em Jesus, sua dor encontra consolo verdadeiro.",
  "Deus não se atrasa, Ele age no tempo perfeito.",
  "A paz de Cristo guarda o coração que crê."
];

const frasesEvang = [...frasesBase];

for (const inicio of partesIniciais) {
  for (const verbo of verbos) {
    for (const complemento of complementos) {
      for (const final of finais) {
        frasesEvang.push(`${inicio} ${verbo} ${complemento} ${final}`);
      }
    }
  }
}

const frasesUnicas = [...new Set(frasesEvang)];

const fraseDiaEl = document.getElementById("fraseDia");
const fraseAleatoriaEl = document.getElementById("fraseAleatoria");
const btnFraseDia = document.getElementById("btnFraseDia");
const btnNovaFrase = document.getElementById("btnNovaFrase");
const btnCompartilharDia = document.getElementById("btnCompartilharDia");
const btnCompartilharFrase = document.getElementById("btnCompartilharFrase");

function fraseAleatoria() {
  const indice = Math.floor(Math.random() * frasesUnicas.length);
  return frasesUnicas[indice];
}

function compartilharTexto(texto) {
  if (!texto) return;
  if (navigator.share) {
    navigator.share({
      title: "Caminho da Fé",
      text: texto,
      url: window.location.href
    }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(`${texto} | ${window.location.href}`).then(() => {
    alert("Frase copiada para compartilhar.");
  });
}

if (btnFraseDia && fraseDiaEl) {
  btnFraseDia.addEventListener("click", () => {
    const frase = fraseAleatoria();
    fraseDiaEl.textContent = frase;
    btnCompartilharDia.classList.remove("hidden");
  });
}

if (btnNovaFrase && fraseAleatoriaEl) {
  btnNovaFrase.addEventListener("click", () => {
    fraseAleatoriaEl.textContent = fraseAleatoria();
  });
}

if (btnCompartilharDia && fraseDiaEl) {
  btnCompartilharDia.addEventListener("click", () => {
    compartilharTexto(fraseDiaEl.textContent);
  });
}

if (btnCompartilharFrase && fraseAleatoriaEl) {
  btnCompartilharFrase.addEventListener("click", () => {
    compartilharTexto(fraseAleatoriaEl.textContent);
  });
}

if (fraseAleatoriaEl) {
  fraseAleatoriaEl.textContent = fraseAleatoria();
}
