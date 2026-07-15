const nav = [
  ['Operação', [['Dashboard','dashboard.html','⌘'],['Clientes','clientes.html','◎'],['Leads','leads.html','◇'],['Projetos','projetos.html','▣'],['Tarefas','tarefas.html','☑']]],
  ['Marketing', [['Marketing','marketing.html','✦'],['Calendário Editorial','calendario.html','◷'],['Conteúdos','templates.html','✎']]],
  ['Gestão', [['Financeiro','financeiro.html','€'],['Objetivos','objetivos.html','◉'],['Documentos','documentos.html','□'],['Banco de Imagens','imagens.html','▧'],['Templates','templates.html','◫']]],
  ['Administração', [['Domínios','dominios.html','🌐'],['Contas','contas.html','🔐'],['Base de Conhecimento','conhecimento.html','?'],['Relatórios','relatorios.html','↗'],['Configurações','configuracoes.html','⚙']]]
];
export function renderShell(activePage) {
  const app = document.querySelector('#app');
  app.innerHTML = `<aside class="sidebar" id="sidebar"><a class="brand" href="dashboard.html"><img src="assets/branding/logo-loorebee.png" alt="LOOREBEE" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'brand-fallback',textContent:'LB'}))"><div><strong>LOOREBEE</strong><span>Business Hub</span></div></a><nav aria-label="Navegação principal">${nav.map(([g,items])=>`<details class="nav-group" open><summary>${g}</summary>${items.map(([label,href,icon])=>`<a class="nav-item ${href.startsWith(activePage)?'active':''}" href="${href}"><span>${icon}</span>${label}</a>`).join('')}</details>`).join('')}</nav></aside><main class="main"><header class="topbar"><button class="btn mobile-menu" data-action="toggle-menu" aria-label="Abrir menu">☰</button><div class="search"><label class="sr-only" for="globalSearch">Pesquisa global</label><input id="globalSearch" placeholder="Pesquisar clientes, projetos, tarefas… Ctrl+K" autocomplete="off"></div><button class="btn" data-action="theme">Tema</button><button class="btn primary" data-action="quick-new">Novo</button></header><div class="content" id="pageContent"></div></main><div class="toast-region" id="toasts" aria-live="polite"></div>`;
}
export function toast(message, type='info') {
  const node = document.createElement('div'); node.className = `toast ${type}`; node.textContent = message;
  document.querySelector('#toasts')?.append(node); setTimeout(()=>node.remove(), 3600);
}
