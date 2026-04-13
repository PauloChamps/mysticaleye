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

function formatarEuro(valor) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(valor);
}

function mostrarResultado(elemento, html) {
  if (!elemento) return;
  elemento.innerHTML = html;
  elemento.classList.add("show");
}

const custosCidades = {
  lisboa: { alimentacaoBase: 230, transporte: 40, quarto: 550, t1: 980, t2: 1300 },
  porto: { alimentacaoBase: 210, transporte: 35, quarto: 450, t1: 820, t2: 1100 },
  braga: { alimentacaoBase: 190, transporte: 30, quarto: 380, t1: 700, t2: 920 },
  coimbra: { alimentacaoBase: 185, transporte: 28, quarto: 360, t1: 670, t2: 890 },
  faro: { alimentacaoBase: 200, transporte: 32, quarto: 420, t1: 760, t2: 990 }
};

const cidadeEl = document.getElementById("cidade");
const alojamentoEl = document.getElementById("alojamento");
const pessoasEl = document.getElementById("pessoas");
const btnCustoVida = document.getElementById("btnCustoVida");
const btnCustoVidaReset = document.getElementById("btnCustoVidaReset");
const resultadoCustoVida = document.getElementById("resultadoCustoVida");

if (btnCustoVida && cidadeEl && alojamentoEl && pessoasEl && resultadoCustoVida) {
  const calcularCustoVida = () => {
    const cidade = custosCidades[cidadeEl.value];
    const tipo = alojamentoEl.value;
    const pessoas = Math.max(1, Number(pessoasEl.value) || 1);

    const renda = cidade[tipo];
    const alimentacao = cidade.alimentacaoBase * pessoas;
    const transporte = cidade.transporte * pessoas;
    const total = renda + alimentacao + transporte;

    mostrarResultado(
      resultadoCustoVida,
      `
      Renda: <strong>${formatarEuro(renda)}</strong> | Alimentação: <strong>${formatarEuro(alimentacao)}</strong> |
      Transporte: <strong>${formatarEuro(transporte)}</strong><br>
      <span class="resultado-sub">Total estimado mensal: <strong>${formatarEuro(total)}</strong></span>
    `
    );
  };

  btnCustoVida.addEventListener("click", calcularCustoVida);
  [cidadeEl, alojamentoEl, pessoasEl].forEach((campo) => campo.addEventListener("input", calcularCustoVida));
  btnCustoVidaReset.addEventListener("click", () => {
    cidadeEl.value = "lisboa";
    alojamentoEl.value = "quarto";
    pessoasEl.value = "1";
    calcularCustoVida();
  });
}

const aluguelEl = document.getElementById("aluguel");
const caucaoEl = document.getElementById("caucao");
const mesesIniciaisEl = document.getElementById("mesesIniciais");
const btnArrendamento = document.getElementById("btnArrendamento");
const btnArrendamentoReset = document.getElementById("btnArrendamentoReset");
const resultadoArrendamento = document.getElementById("resultadoArrendamento");

if (btnArrendamento && aluguelEl && caucaoEl && mesesIniciaisEl && resultadoArrendamento) {
  const calcularArrendamento = () => {
    const aluguel = Math.max(0, Number(aluguelEl.value) || 0);
    const caucao = Math.max(0, Number(caucaoEl.value) || 0);
    const mesesIniciais = Math.max(1, Number(mesesIniciaisEl.value) || 1);
    const totalEntrada = aluguel * (caucao + mesesIniciais);

    mostrarResultado(
      resultadoArrendamento,
      `Total necessário para entrada: <strong>${formatarEuro(totalEntrada)}</strong>
      <span class="resultado-sub">(${caucao} mês(es) de caução + ${mesesIniciais} mês(es) iniciais)</span>`
    );
  };

  btnArrendamento.addEventListener("click", calcularArrendamento);
  btnArrendamentoReset.addEventListener("click", () => {
    aluguelEl.value = "";
    caucaoEl.value = "2";
    mesesIniciaisEl.value = "1";
    mostrarResultado(resultadoArrendamento, "Preencha os campos para calcular a entrada.");
  });
}

const salarioBrutoEl = document.getElementById("salarioBruto");
const btnSalarioLiquido = document.getElementById("btnSalarioLiquido");
const btnSalarioReset = document.getElementById("btnSalarioReset");
const resultadoSalario = document.getElementById("resultadoSalario");

if (btnSalarioLiquido && salarioBrutoEl && resultadoSalario) {
  const calcularSalarioLiquido = () => {
    const bruto = Math.max(0, Number(salarioBrutoEl.value) || 0);
    const taxaEstimada = bruto <= 1000 ? 0.14 : bruto <= 2000 ? 0.2 : 0.25;
    const liquido = bruto * (1 - taxaEstimada);

    mostrarResultado(
      resultadoSalario,
      `Salário líquido estimado: <strong>${formatarEuro(liquido)}</strong>
      <span class="resultado-sub">Estimativa aproximada com desconto médio de ${(taxaEstimada * 100).toFixed(0)}%.</span>`
    );
  };

  btnSalarioLiquido.addEventListener("click", calcularSalarioLiquido);
  salarioBrutoEl.addEventListener("input", calcularSalarioLiquido);
  btnSalarioReset.addEventListener("click", () => {
    salarioBrutoEl.value = "";
    mostrarResultado(resultadoSalario, "Informe o salário bruto para gerar a estimativa.");
  });
}

const btnDocumentacao = document.getElementById("btnDocumentacao");
const btnDocumentacaoReset = document.getElementById("btnDocumentacaoReset");
const resultadoDocumentacao = document.getElementById("resultadoDocumentacao");

if (btnDocumentacao && resultadoDocumentacao) {
  const calcularDocumentacao = () => {
    const custos = {
      nif: 20,
      segurancaSocial: 0,
      aima: 170,
      outros: 120
    };
    const total = custos.nif + custos.segurancaSocial + custos.aima + custos.outros;

    mostrarResultado(
      resultadoDocumentacao,
      `NIF: <strong>${formatarEuro(custos.nif)}</strong> | Segurança Social: <strong>${formatarEuro(custos.segurancaSocial)}</strong> |
      AIMA: <strong>${formatarEuro(custos.aima)}</strong> | Outros custos básicos: <strong>${formatarEuro(custos.outros)}</strong>
      <span class="resultado-sub">Total inicial estimado: <strong>${formatarEuro(total)}</strong></span>`
    );
  };

  btnDocumentacao.addEventListener("click", calcularDocumentacao);
  btnDocumentacaoReset.addEventListener("click", () => {
    mostrarResultado(resultadoDocumentacao, "Clique em “Ver custos estimados” para exibir a simulação.");
  });
}
