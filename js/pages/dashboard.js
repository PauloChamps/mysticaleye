import { getAll } from '../database.js';
import { money, dateShort, dateLong, percent, escapeHTML, initials } from '../formatters.js';
import { drawBars } from '../charts.js';

const today = new Date();
const monthKey = today.toISOString().slice(0, 7);
const isThisMonth = (date) => String(date || '').startsWith(monthKey);
const daysUntil = (date) => Math.ceil((new Date(date) - today) / 86400000);
const sortByDate = (items, key) => [...items].sort((a, b) => new Date(a[key] || a.createdAt || 0) - new Date(b[key] || b.createdAt || 0));
const activeProject = (status) => ['Planeamento', 'Backlog', 'Em andamento', 'Em revisão', 'A aguardar cliente'].includes(status);

function emptyState(title, text, action = 'Criar novo') {
  return `<div class="empty"><strong>${title}</strong><p>${text}</p><button class="btn primary" data-action="quick-new">${action}</button></div>`;
}

function statusClass(status = '') {
  if (/ativo|pago|concluído|ganho|publicado/i.test(status)) return 'success';
  if (/atraso|risco|bloqueada|perdido/i.test(status)) return 'danger';
  if (/pendente|revisão|aguardar|negociação/i.test(status)) return 'warning';
  return '';
}

function projectDistribution(projects) {
  const statuses = ['Planeamento', 'Backlog', 'Em andamento', 'Em revisão', 'A aguardar cliente', 'Concluído'];
  return statuses.map((status) => [status, projects.filter((project) => project.status === status).length]);
}

function monthSeries(finance) {
  const labels = ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];
  return labels.map((label, index) => {
    const key = `2026-${String(index + 3).padStart(2, '0')}`;
    return {
      label,
      income: finance.filter((item) => item.type === 'receita' && String(item.date).startsWith(key)).reduce((sum, item) => sum + Number(item.value || 0), 0),
      expense: finance.filter((item) => item.type === 'despesa' && String(item.date).startsWith(key)).reduce((sum, item) => sum + Number(item.value || 0), 0)
    };
  });
}

export async function renderDashboard(container) {
  container.innerHTML = '<div class="skeleton"></div>';
  const [clients, leads, projects, tasks, posts, finance, goals, domains, events, activities] = await Promise.all([
    getAll('clients'), getAll('leads'), getAll('projects'), getAll('tasks'), getAll('marketingPosts'), getAll('financialMovements'), getAll('goals'), getAll('domains'), getAll('events'), getAll('activities')
  ]);

  const income = finance.filter((m) => m.type === 'receita' && isThisMonth(m.date)).reduce((s, m) => s + Number(m.value || 0), 0);
  const expense = finance.filter((m) => m.type === 'despesa' && isThisMonth(m.date)).reduce((s, m) => s + Number(m.value || 0), 0);
  const pendingPayments = finance.filter((m) => m.type === 'receita' && m.status !== 'Pago').reduce((s, m) => s + Number(m.value || 0), 0);
  const overdueTasks = tasks.filter((task) => task.status !== 'Concluída' && task.dueDate && new Date(task.dueDate) < today);
  const activeClients = clients.filter((client) => client.status === 'Cliente ativo');
  const negotiatingLeads = leads.filter((lead) => ['Proposta enviada', 'Negociação', 'Reunião'].includes(lead.stage));
  const activeProjects = projects.filter((project) => activeProject(project.status));
  const scheduledPosts = posts.filter((post) => post.status === 'Agendado');
  const renewingDomains = domains.filter((domain) => domain.renewalDate && daysUntil(domain.renewalDate) <= 90 && daysUntil(domain.renewalDate) >= 0);
  const goalAverage = goals.length ? goals.reduce((sum, goal) => sum + Math.min(100, Number(goal.currentValue || 0) / Math.max(1, Number(goal.target || 1)) * 100), 0) / goals.length : 0;

  const kpis = [
    ['Clientes ativos', activeClients.length, 'Relações com contrato ou plano ativo', '◎'],
    ['Leads em negociação', negotiatingLeads.length, 'Oportunidades próximas de decisão', '◇'],
    ['Projetos em andamento', activeProjects.length, 'Trabalho em produção', '▣'],
    ['Tarefas pendentes', tasks.filter((task) => task.status !== 'Concluída').length, `${overdueTasks.length} atrasadas`, '☑'],
    ['Posts agendados', scheduledPosts.length, 'Conteúdos com data definida', '✦'],
    ['Receita do mês', money(income), 'Entradas registadas em julho', '€'],
    ['Despesas do mês', money(expense), 'Custos operacionais do mês', '−'],
    ['Lucro do mês', money(income - expense), 'Resultado antes de impostos', '+'],
    ['Pagamentos pendentes', money(pendingPayments), 'Receitas por liquidar', '◷'],
    ['Objetivos', percent(goalAverage), 'Progresso médio das metas', '◉'],
    ['Domínios a renovar', renewingDomains.length, 'Próximos 90 dias', '🌐'],
    ['Publicações pendentes', posts.filter((post) => ['Ideia', 'Rascunho', 'Em criação', 'Em revisão'].includes(post.status)).length, 'Aguardam produção/aprovação', '✎']
  ];

  const upcoming = sortByDate([
    ...events.map((event) => ({ ...event, kind: event.type || 'evento' })),
    ...tasks.filter((task) => task.status !== 'Concluída').map((task) => ({ title: task.title, date: task.dueDate, kind: 'tarefa' })),
    ...finance.filter((item) => item.status !== 'Pago').map((item) => ({ title: item.description, date: item.dueDate, kind: 'pagamento' })),
    ...domains.map((domain) => ({ title: domain.domain, date: domain.renewalDate, kind: 'renovação' }))
  ], 'date').filter((item) => item.date).slice(0, 8);

  const recentClients = [...clients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const distribution = projectDistribution(projects);

  container.innerHTML = `
    <section class="page-head hero">
      <div>
        <span class="badge">${escapeHTML(dateLong(today))}</span>
        <h1>Bom trabalho, LOOREBEE.</h1>
        <p>Hoje existem <strong>${overdueTasks.length}</strong> tarefas atrasadas, <strong>${scheduledPosts.length}</strong> publicações agendadas e <strong>${renewingDomains.length}</strong> domínios dentro da janela de renovação.</p>
      </div>
      <div class="actions"><button class="btn" data-action="seed-demo">Recarregar demo</button><button class="btn primary" data-action="quick-new">Criar novo</button></div>
    </section>
    <section class="grid kpis">${kpis.map(([label, value, text, icon]) => `<article class="card stat-card"><div><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong><span>${escapeHTML(text)}</span></div><div class="stat-icon">${escapeHTML(icon)}</div></article>`).join('')}</section>
    <section class="grid two dashboard-spaced">
      <article class="card"><div class="section-title"><h2>Receitas e despesas</h2><span class="badge">6 meses</span></div><canvas class="chart" id="financeChart" aria-label="Gráfico de receitas e despesas" role="img"></canvas></article>
      <article class="card"><div class="section-title"><h2>Distribuição de projetos</h2><span class="badge">${projects.length} projetos</span></div><div class="donut-list">${distribution.map(([label, count], index) => `<div class="legend"><span><i style="background:hsl(${38 + index * 28} 95% 56%)"></i>${escapeHTML(label)}</span><strong>${count}</strong></div><div class="progress"><span style="width:${projects.length ? (count / projects.length) * 100 : 0}%"></span></div>`).join('')}</div></article>
    </section>
    <section class="grid two dashboard-spaced">
      <article class="card"><div class="section-title"><h2>Tarefas prioritárias</h2><a class="badge" href="tarefas.html">Ver tarefas</a></div><div class="list">${tasks.filter((task) => task.status !== 'Concluída').sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0, 6).map((task) => `<div class="list-row"><div><strong>${escapeHTML(task.title)}</strong><br><span class="text-secondary">${escapeHTML(task.priority || 'Normal')} · ${dateShort(task.dueDate)}</span></div><span class="status ${statusClass(task.status)}">${escapeHTML(task.status)}</span></div>`).join('') || emptyState('Nenhuma tarefa pendente', 'Crie tarefas para acompanhar entregas e prioridades.', 'Nova tarefa')}</div></article>
      <article class="card"><div class="section-title"><h2>Calendário resumido</h2><a class="badge" href="calendario.html">Abrir calendário</a></div><div class="list">${upcoming.map((item) => `<div class="list-row"><div><strong>${escapeHTML(item.title)}</strong><br><span class="text-secondary">${escapeHTML(item.kind)} · ${dateShort(item.date)}</span></div><span class="badge">${daysUntil(item.date)} dias</span></div>`).join('') || emptyState('Sem próximos prazos', 'Eventos, pagamentos e renovações aparecerão aqui.', 'Criar evento')}</div></article>
    </section>
    <section class="grid two dashboard-spaced">
      <article class="card"><div class="section-title"><h2>Últimos clientes</h2><a class="badge" href="clientes.html">Gerir clientes</a></div><div class="list">${recentClients.map((client) => `<div class="list-row"><div class="identity"><span class="avatar">${escapeHTML(initials(client.company || client.name))}</span><div><strong>${escapeHTML(client.name)}</strong><br><span class="text-secondary">${escapeHTML(client.company || '—')} · ${money(client.monthlyValue)}</span></div></div><span class="status ${statusClass(client.status)}">${escapeHTML(client.status)}</span></div>`).join('') || emptyState('Nenhum cliente ativo', 'Crie o primeiro cliente para começar a acompanhar o relacionamento.', 'Novo cliente')}</div></article>
      <article class="card"><div class="section-title"><h2>Últimos projetos</h2><a class="badge" href="projetos.html">Ver projetos</a></div><div class="list">${recentProjects.map((project) => `<div class="list-row"><div><strong>${escapeHTML(project.name)}</strong><br><span class="text-secondary">${escapeHTML(project.type || 'Projeto')} · ${dateShort(project.deadline)}</span><div class="progress"><span style="width:${Number(project.progress || 0)}%"></span></div></div><span class="status ${statusClass(project.status)}">${escapeHTML(project.status)}</span></div>`).join('') || emptyState('Nenhum projeto ativo', 'Crie o primeiro projeto para começar a acompanhar o trabalho.', 'Novo projeto')}</div></article>
    </section>
    <section class="grid two dashboard-spaced">
      <article class="card"><div class="section-title"><h2>Publicações agendadas</h2><a class="badge" href="marketing.html">Centro de marketing</a></div><div class="list">${scheduledPosts.slice(0, 6).map((post) => `<div class="list-row"><div><strong>${escapeHTML(post.title)}</strong><br><span class="text-secondary">${escapeHTML(post.platform)} · ${dateShort(post.date)} ${escapeHTML(post.time || '')}</span></div><span class="status warning">${escapeHTML(post.status)}</span></div>`).join('') || emptyState('Sem publicações agendadas', 'Planeie conteúdo para alimentar o calendário editorial.', 'Nova publicação')}</div></article>
      <article class="card"><div class="section-title"><h2>Atividades recentes</h2><span class="badge">Histórico</span></div><div class="list">${activities.slice(0, 7).map((activity) => `<div class="list-row"><div><strong>${escapeHTML(activity.message)}</strong><br><span class="text-secondary">${escapeHTML(activity.module)} · ${dateShort(activity.createdAt)}</span></div></div>`).join('') || emptyState('Sem atividade recente', 'As ações importantes do sistema serão registadas aqui.', 'Começar')}</div></article>
    </section>`;

  drawBars(container.querySelector('#financeChart'), monthSeries(finance));
}
