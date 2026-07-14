import { renderShell, toast } from './components/layout.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderClientsPage } from './pages/clients.js';
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
  else renderPlaceholder();
}

window.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'toggle-menu') document.querySelector('#sidebar').classList.toggle('open');
  if (action === 'theme') { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; preferences.set('theme', next); }
  if (action === 'seed-demo') { await seedDemo(true); await renderDashboard(content); }
  if (action === 'quick-new') toast('Criação rápida será ligada aos formulários reutilizáveis na próxima fase.', 'info');
});
window.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.querySelector('#globalSearch')?.focus(); } });

if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
boot().catch((error) => { console.error(error); content.innerHTML = '<div class="card">Erro ao iniciar a aplicação.</div>'; });
