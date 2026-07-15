import { renderShell, toast } from './components/layout.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderClientsPage } from './pages/clients.js';
import { renderLeadsPage } from './pages/leads.js';
import { renderProjectsPage } from './pages/projects.js';
import { preferences } from './storage.js';
import { bulkPut, getAll } from './database.js';

const page = document.body.dataset.page || 'dashboard';
document.documentElement.dataset.theme = preferences.get('theme', 'dark');
renderShell(`${page}.html`);
const content = document.querySelector('#pageContent');

async function seedDemo(force = false) {
  const existing = await getAll('clients');
  if (existing.length && !force) return;
  const response = await fetch('database/demo-data.json');
  const demo = await response.json();
  await Promise.all(Object.entries(demo).map(([store, values]) => bulkPut(store, values)));
  toast('Dados de demonstração carregados.', 'success');
}

function renderPlaceholder() {
  const labels = {clientes:'Clientes e CRM',leads:'Leads e Funil Comercial',projetos:'Projetos',tarefas:'Tarefas',marketing:'Marketing',calendario:'Calendário Editorial',financeiro:'Financeiro',objetivos:'Objetivos e KPIs',documentos:'Documentos',imagens:'Banco de Imagens',templates:'Templates',dominios:'Domínios',contas:'Contas e Plataformas',conhecimento:'Base de Conhecimento',relatorios:'Relatórios',configuracoes:'Configurações'};
  content.innerHTML = `<section class="page-head"><div><span class="badge">Planeado para fases seguintes</span><h1>${labels[page] || 'Módulo'}</h1><p>Estrutura reservada para implementação incremental sem comprometer a arquitetura modular da aplicação.</p></div></section><div class="card empty">Este módulo será desenvolvido nas próximas fases, reutilizando IndexedDB, componentes acessíveis, validação e padrões visuais já definidos na Fase 1.</div>`;
}

async function boot() {
  const settings = await getAll('settings');
  if (!settings.find((s) => s.key === 'firstRunChoice')) await seedDemo(false);
  if (page === 'dashboard' || page === 'index') await renderDashboard(content);
  else if (page === 'clientes') await renderClientsPage(content);
  else if (page === 'leads') await renderLeadsPage(content);
  else if (page === 'projetos') await renderProjectsPage(content);
  else renderPlaceholder();
}

window.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'toggle-menu') document.querySelector('#sidebar').classList.toggle('open');
  if (action === 'theme') { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; preferences.set('theme', next); }
  if (action === 'seed-demo') { await seedDemo(true); await renderDashboard(content); }
  if (action === 'quick-new') {
    const menu = document.createElement('div');
    menu.className = 'modal-backdrop';
    menu.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><div class="drawer-head"><div><span class="badge">Criação rápida</span><h2>Novo registo</h2></div><button class="icon-btn" data-action="close-quick">✕</button></div><div class="quick-grid"><a class="btn primary" href="leads.html?action=new">Lead</a><a class="btn primary" href="projetos.html?action=new">Projeto</a><a class="btn" href="clientes.html?action=new">Cliente</a></div></div>';
    document.body.append(menu);
  }
  if (action === 'close-quick' || event.target.classList.contains('modal-backdrop')) event.target.closest('.modal-backdrop')?.remove();
});
document.querySelector('#globalSearch')?.addEventListener('change', async (event) => {
  const q = event.target.value.toLowerCase().trim();
  if (!q) return;
  const [leads, projects] = await Promise.all([getAll('leads'), getAll('projects')]);
  const lead = leads.find((item) => [item.name, item.company, item.interest].join(' ').toLowerCase().includes(q));
  const project = projects.find((item) => [item.name, item.type].join(' ').toLowerCase().includes(q));
  if (lead) location.href = 'leads.html';
  else if (project) location.href = 'projetos.html';
  else toast('Sem resultados em leads ou projetos.', 'info');
});

window.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.querySelector('#globalSearch')?.focus(); } });

if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
boot().catch((error) => {
  console.error('Erro ao iniciar módulo', { page, name: error?.name, message: error?.message, stack: error?.stack });
  const label = page === 'leads' ? 'Leads' : page === 'projetos' ? 'Projetos' : 'aplicação';
  content.innerHTML = `<div class="card empty"><strong>Não foi possível iniciar o módulo ${label}.</strong><p>Atualize a página ou limpe o cache do navegador se o problema persistir.</p><button class="btn primary" type="button" onclick="location.reload()">Tentar novamente</button></div>`;
});
