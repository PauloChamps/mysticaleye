import { createId, getAll, put, remove } from '../database.js';
import { money, dateShort, escapeHTML, initials } from '../formatters.js';
import { requireFields, sanitizeText } from '../validators.js';
import { toast } from '../components/layout.js';

const state = { clients: [], projects: [], tasks: [], posts: [], finance: [], domains: [], query: '', status: 'Todos', view: 'table' };
const statuses = ['Lead', 'Contactado', 'Reunião agendada', 'Proposta enviada', 'Negociação', 'Cliente ativo', 'Cliente inativo', 'Perdido', 'Arquivado'];

function statusClass(status = '') {
  if (/ativo/i.test(status)) return 'success';
  if (/inativo|perdido|arquivado/i.test(status)) return 'danger';
  if (/proposta|negociação|reunião|contactado/i.test(status)) return 'warning';
  return '';
}

function filteredClients() {
  return state.clients.filter((client) => {
    const haystack = [client.name, client.company, client.email, client.phone, client.plan, client.sector].join(' ').toLowerCase();
    const matchesQuery = haystack.includes(state.query.toLowerCase());
    const matchesStatus = state.status === 'Todos' || client.status === state.status;
    return matchesQuery && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function field(name, label, value = '', type = 'text', extra = '') {
  return `<div class="field ${extra}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHTML(value)}"></div>`;
}

function clientPayload(form, existing = {}) {
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    ...existing,
    id: existing.id || createId('cli'),
    name: sanitizeText(data.name),
    company: sanitizeText(data.company),
    nif: sanitizeText(data.nif),
    email: sanitizeText(data.email),
    phone: sanitizeText(data.phone),
    whatsapp: sanitizeText(data.whatsapp),
    website: sanitizeText(data.website),
    sector: sanitizeText(data.sector),
    city: sanitizeText(data.city),
    country: sanitizeText(data.country || 'Portugal'),
    plan: sanitizeText(data.plan),
    monthlyValue: Number(data.monthlyValue || 0),
    contractStartDate: data.contractStartDate,
    contractEndDate: data.contractEndDate,
    status: data.status,
    notes: sanitizeText(data.notes),
    source: existing.source || 'Manual',
    demo: Boolean(existing.demo)
  };
}

function clientForm(client = {}) {
  return `<form id="clientForm" class="client-form" novalidate>
    <div class="form-grid">
      ${field('name', 'Nome *', client.name || '')}
      ${field('company', 'Empresa *', client.company || '')}
      ${field('nif', 'NIF', client.nif || '')}
      ${field('email', 'Email', client.email || 'email@empresa.pt', 'email')}
      ${field('phone', 'Telefone', client.phone || '')}
      ${field('whatsapp', 'WhatsApp', client.whatsapp || '')}
      ${field('website', 'Website', client.website || '', 'url')}
      ${field('sector', 'Setor', client.sector || '')}
      ${field('city', 'Cidade', client.city || '')}
      ${field('country', 'País', client.country || 'Portugal')}
      ${field('plan', 'Plano contratado', client.plan || '')}
      ${field('monthlyValue', 'Valor mensal (€)', client.monthlyValue || 0, 'number')}
      ${field('contractStartDate', 'Data de início', client.contractStartDate || '', 'date')}
      ${field('contractEndDate', 'Data de fim', client.contractEndDate || '', 'date')}
      <div class="field"><label for="status">Estado</label><select id="status" name="status">${statuses.map((status) => `<option ${status === (client.status || 'Cliente ativo') ? 'selected' : ''}>${status}</option>`).join('')}</select></div>
      <div class="field full"><label for="notes">Observações</label><textarea id="notes" name="notes" rows="4">${escapeHTML(client.notes || '')}</textarea></div>
    </div>
    <div class="actions"><button class="btn" type="button" data-action="close-drawer">Cancelar</button><button class="btn primary" type="submit">Guardar cliente</button></div>
  </form>`;
}

function openDrawer(title, body) {
  document.querySelector('.drawer-backdrop')?.remove();
  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  backdrop.innerHTML = `<aside class="drawer" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><div class="drawer-head"><div><span class="badge">CRM</span><h2>${escapeHTML(title)}</h2></div><button class="icon-btn" data-action="close-drawer" aria-label="Fechar">✕</button></div>${body}</aside>`;
  document.body.append(backdrop);
  backdrop.querySelector('input,button,select,textarea')?.focus();
}

async function logActivity(message, entityId) {
  await put('activities', { id: createId('act'), module: 'clientes', entityId, message, createdAt: new Date().toISOString() });
}

function openClientEditor(client = null) {
  openDrawer(client ? 'Editar cliente' : 'Novo cliente', clientForm(client || {}));
  document.querySelector('#clientForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = clientPayload(event.currentTarget, client || {});
    const errors = requireFields(payload, ['name', 'company']);
    if (Object.keys(errors).length) { toast('Preencha nome e empresa antes de guardar.', 'error'); return; }
    await put('clients', payload);
    await logActivity(client ? `Cliente atualizado: ${payload.company}` : `Cliente criado: ${payload.company}`, payload.id);
    toast(client ? 'Cliente atualizado.' : 'Cliente criado.', 'success');
    closeDrawer();
    await loadAndRender();
  });
}

function closeDrawer() { document.querySelector('.drawer-backdrop')?.remove(); }

function clientStats() {
  return [
    ['Total de clientes', state.clients.length, 'Registos no CRM'],
    ['Clientes ativos', state.clients.filter((c) => c.status === 'Cliente ativo').length, 'Com relação ativa'],
    ['Clientes inativos', state.clients.filter((c) => /inativo|arquivado/i.test(c.status)).length, 'Sem produção atual'],
    ['Leads convertidos', state.clients.filter((c) => /lead|convertido|demo/i.test(`${c.source} ${c.notes}`)).length, 'Origem comercial']
  ];
}

function tableRows(clients) {
  return clients.map((client) => `<tr>
    <td><div class="identity"><span class="avatar">${escapeHTML(initials(client.company || client.name))}</span><div><strong>${escapeHTML(client.name)}</strong><br><span class="text-secondary">${escapeHTML(client.sector || '—')}</span></div></div></td>
    <td>${escapeHTML(client.company || '—')}</td><td>${escapeHTML(client.email || '—')}</td><td>${escapeHTML(client.phone || '—')}</td>
    <td>${escapeHTML(client.plan || '—')}</td><td>${money(client.monthlyValue)}</td><td><span class="status ${statusClass(client.status)}">${escapeHTML(client.status || '—')}</span></td><td>${dateShort(client.createdAt)}</td>
    <td><div class="actions"><button class="icon-btn" data-action="view-client" data-id="${client.id}" title="Ver">Ver</button><button class="icon-btn" data-action="edit-client" data-id="${client.id}" title="Editar">Editar</button><button class="icon-btn" data-action="duplicate-client" data-id="${client.id}" title="Duplicar">Duplicar</button><button class="icon-btn" data-action="archive-client" data-id="${client.id}" title="Arquivar">Arquivar</button><button class="icon-btn" data-action="delete-client" data-id="${client.id}" title="Eliminar">Eliminar</button></div></td>
  </tr>`).join('');
}

function cardRows(clients) {
  return `<div class="card-grid">${clients.map((client) => `<article class="card client-card"><div class="client-card-head"><div class="identity"><span class="avatar">${escapeHTML(initials(client.company || client.name))}</span><div><strong>${escapeHTML(client.company || client.name)}</strong><br><span class="text-secondary">${escapeHTML(client.name)}</span></div></div><span class="status ${statusClass(client.status)}">${escapeHTML(client.status)}</span></div><div class="mini-grid"><div class="metric"><small>Plano</small><strong>${escapeHTML(client.plan || '—')}</strong></div><div class="metric"><small>Mensal</small><strong>${money(client.monthlyValue)}</strong></div><div class="metric"><small>Fim contrato</small><strong>${dateShort(client.contractEndDate)}</strong></div></div><p class="text-secondary">${escapeHTML(client.notes || 'Sem observações registadas.')}</p><div class="actions"><button class="btn" data-action="view-client" data-id="${client.id}">Ver detalhes</button><button class="btn primary" data-action="edit-client" data-id="${client.id}">Editar</button></div></article>`).join('')}</div>`;
}

function renderClients(container) {
  const clients = filteredClients();
  container.innerHTML = `<section class="page-head"><div><span class="badge">CRM funcional</span><h1>Clientes</h1><p>Gestão completa de clientes, contratos, planos, contactos e relacionamento comercial com persistência local em IndexedDB.</p></div><div class="actions"><button class="btn" data-action="toggle-client-view">${state.view === 'table' ? 'Ver cartões' : 'Ver tabela'}</button><button class="btn primary" data-action="new-client">Novo cliente</button></div></section>
    <section class="grid kpis">${clientStats().map(([label, value, text]) => `<article class="card stat-card"><div><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong><span>${escapeHTML(text)}</span></div><div class="stat-icon">◎</div></article>`).join('')}</section>
    <section class="card dashboard-spaced"><div class="toolbar"><input id="clientSearch" value="${escapeHTML(state.query)}" placeholder="Pesquisar por nome, empresa, email, telefone, plano…"><select id="clientStatus"><option>Todos</option>${statuses.map((status) => `<option ${state.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select><span class="badge">${clients.length} resultado(s)</span></div>
    ${clients.length ? (state.view === 'table' ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Cliente</th><th>Empresa</th><th>Email</th><th>Telefone</th><th>Plano</th><th>Valor mensal</th><th>Estado</th><th>Entrada</th><th>Ações</th></tr></thead><tbody>${tableRows(clients)}</tbody></table></div>` : cardRows(clients)) : `<div class="empty"><strong>Nenhum cliente encontrado</strong><p>Ajuste os filtros ou crie um novo cliente para começar a gerir o relacionamento.</p><button class="btn primary" data-action="new-client">Novo cliente</button></div>`}</section>`;
}

function clientDetail(client) {
  const relatedProjects = state.projects.filter((item) => item.clientId === client.id);
  const relatedTasks = state.tasks.filter((item) => item.clientId === client.id);
  const relatedPosts = state.posts.filter((item) => item.clientId === client.id);
  const relatedFinance = state.finance.filter((item) => item.clientId === client.id);
  const relatedDomains = state.domains.filter((item) => item.clientId === client.id);
  const revenue = relatedFinance.filter((item) => item.type === 'receita').reduce((sum, item) => sum + Number(item.value || 0), 0);
  openDrawer(client.company || client.name, `<div class="identity"><span class="avatar">${escapeHTML(initials(client.company || client.name))}</span><div><h2>${escapeHTML(client.name)}</h2><p class="text-secondary">${escapeHTML(client.email || 'Sem email')} · ${escapeHTML(client.phone || 'Sem telefone')}</p></div></div><div class="tabs">${['Visão geral','Projetos','Tarefas','Marketing','Financeiro','Documentos','Domínios','Notas','Histórico'].map((tab, index) => `<button class="tab ${index === 0 ? 'active' : ''}" type="button">${tab}</button>`).join('')}</div><div class="mini-grid"><div class="metric"><small>Plano</small><strong>${escapeHTML(client.plan || '—')}</strong></div><div class="metric"><small>Mensalidade</small><strong>${money(client.monthlyValue)}</strong></div><div class="metric"><small>Receita registada</small><strong>${money(revenue)}</strong></div><div class="metric"><small>Projetos</small><strong>${relatedProjects.length}</strong></div><div class="metric"><small>Tarefas</small><strong>${relatedTasks.length}</strong></div><div class="metric"><small>Publicações</small><strong>${relatedPosts.length}</strong></div></div><div class="card dashboard-spaced"><h3>Visão geral</h3><p>${escapeHTML(client.notes || 'Sem notas registadas para este cliente.')}</p><div class="list"><div class="list-row"><strong>Website</strong><span>${escapeHTML(client.website || '—')}</span></div><div class="list-row"><strong>Setor</strong><span>${escapeHTML(client.sector || '—')}</span></div><div class="list-row"><strong>Contrato</strong><span>${dateShort(client.contractStartDate)} — ${dateShort(client.contractEndDate)}</span></div></div></div><div class="card dashboard-spaced"><h3>Projetos associados</h3><div class="list">${relatedProjects.map((project) => `<div class="list-row"><strong>${escapeHTML(project.name)}</strong><span class="status ${statusClass(project.status)}">${escapeHTML(project.status)}</span></div>`).join('') || '<div class="empty">Sem projetos associados.</div>'}</div></div><div class="card dashboard-spaced"><h3>Domínios</h3><div class="list">${relatedDomains.map((domain) => `<div class="list-row"><strong>${escapeHTML(domain.domain)}</strong><span>${dateShort(domain.renewalDate)}</span></div>`).join('') || '<div class="empty">Sem domínios associados.</div>'}</div></div><div class="actions"><button class="btn" data-action="edit-client" data-id="${client.id}">Editar cliente</button><button class="btn primary" data-action="close-drawer">Fechar</button></div>`);
}

async function loadAndRender() {
  [state.clients, state.projects, state.tasks, state.posts, state.finance, state.domains] = await Promise.all([getAll('clients'), getAll('projects'), getAll('tasks'), getAll('marketingPosts'), getAll('financialMovements'), getAll('domains')]);
  renderClients(document.querySelector('#pageContent'));
}

export async function renderClientsPage(container) {
  container.innerHTML = '<div class="skeleton"></div>';
  await loadAndRender();
  container.addEventListener('input', (event) => {
    if (event.target.id === 'clientSearch') { state.query = event.target.value; renderClients(container); }
  });
  container.addEventListener('change', (event) => {
    if (event.target.id === 'clientStatus') { state.status = event.target.value; renderClients(container); }
  });
  container.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    const client = state.clients.find((item) => item.id === id);
    if (button.dataset.action === 'new-client') openClientEditor();
    if (button.dataset.action === 'toggle-client-view') { state.view = state.view === 'table' ? 'cards' : 'table'; renderClients(container); }
    if (button.dataset.action === 'view-client' && client) clientDetail(client);
    if (button.dataset.action === 'edit-client' && client) openClientEditor(client);
    if (button.dataset.action === 'duplicate-client' && client) { const copy = { ...client, id: createId('cli'), name: `${client.name} (cópia)`, company: `${client.company} (cópia)`, createdAt: new Date().toISOString(), demo: false }; await put('clients', copy); await logActivity(`Cliente duplicado: ${copy.company}`, copy.id); toast('Cliente duplicado.', 'success'); await loadAndRender(); }
    if (button.dataset.action === 'archive-client' && client) { await put('clients', { ...client, status: 'Arquivado' }); await logActivity(`Cliente arquivado: ${client.company}`, client.id); toast('Cliente arquivado.', 'success'); await loadAndRender(); }
    if (button.dataset.action === 'delete-client' && client && confirm(`Eliminar ${client.company || client.name}? Esta ação não pode ser anulada.`)) { await remove('clients', client.id); await logActivity(`Cliente eliminado: ${client.company}`, client.id); toast('Cliente eliminado.', 'success'); await loadAndRender(); }
  });
}

window.addEventListener('click', (event) => { if (event.target.closest('[data-action="close-drawer"]') || event.target.classList.contains('drawer-backdrop')) closeDrawer(); });
