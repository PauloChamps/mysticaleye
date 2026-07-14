import { getAll } from '../database.js';
import { money, dateShort, percent } from '../formatters.js';
import { drawBars } from '../charts.js';

const month = new Date().toISOString().slice(0, 7);
const isThisMonth = (date) => String(date || '').startsWith(month);
const active = (v) => !['Concluído','Arquivado','Perdido','Cliente inativo','Cancelado'].includes(v);

export async function renderDashboard(container) {
  const [clients, leads, projects, tasks, posts, finance, goals, domains, events] = await Promise.all([
    getAll('clients'), getAll('leads'), getAll('projects'), getAll('tasks'), getAll('marketingPosts'), getAll('financialMovements'), getAll('goals'), getAll('domains'), getAll('events')
  ]);
  const income = finance.filter((m) => m.type === 'receita' && isThisMonth(m.date)).reduce((s,m)=>s+Number(m.value||0),0);
  const expense = finance.filter((m) => m.type === 'despesa' && isThisMonth(m.date)).reduce((s,m)=>s+Number(m.value||0),0);
  const overdueTasks = tasks.filter((t) => t.status !== 'Concluída' && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const yearlyGoal = goals.find((g) => /anual/i.test(g.category || g.name || ''));
  const kpis = [
    ['Clientes ativos', clients.filter(c=>c.status==='Cliente ativo').length, 'Relações em acompanhamento'],
    ['Novos leads', leads.filter(l=>isThisMonth(l.createdAt)).length, 'Entradas deste mês'],
    ['Projetos ativos', projects.filter(p=>active(p.status)).length, 'Em fluxo de produção'],
    ['Tarefas atrasadas', overdueTasks, 'Exigem atenção'],
    ['Publicações agendadas', posts.filter(p=>p.status==='Agendado').length, 'Conteúdo planeado'],
    ['Receitas do mês', money(income), 'Movimentos pagos e previstos'],
    ['Despesas do mês', money(expense), 'Custos registados'],
    ['Lucro do mês', money(income-expense), 'Resultado operacional'],
    ['Valores a receber', money(finance.filter(m=>m.type==='receita'&&m.status==='Pendente').reduce((s,m)=>s+Number(m.value||0),0)), 'Receitas pendentes'],
    ['Domínios a renovar', domains.filter(d=>d.renewalDate && (new Date(d.renewalDate)-new Date())/86400000<=90).length, 'Janela de 90 dias'],
    ['Objetivos em andamento', goals.filter(g=>g.status!=='Concluído').length, 'Metas ativas'],
    ['Meta anual', yearlyGoal ? percent((yearlyGoal.currentValue/yearlyGoal.target)*100) : '—', 'Progresso calculado']
  ];
  container.innerHTML = `
    <section class="page-head"><div><span class="badge">Fase 1 · Arquitetura e Dashboard</span><h1>LOOREBEE <span class="brand-gradient">Business Hub</span></h1><p>Centro operacional interno com dados persistentes em IndexedDB, métricas calculadas e uma base preparada para os módulos empresariais.</p></div><button class="btn primary" data-action="seed-demo">Carregar dados demo</button></section>
    <section class="grid kpis">${kpis.map(k=>`<article class="card kpi"><small>${k[0]}</small><strong>${k[1]}</strong><span>${k[2]}</span></article>`).join('')}</section>
    <section class="grid two" style="margin-top:18px"><article class="card"><h2>Receitas e despesas</h2><canvas class="chart" id="financeChart" aria-label="Gráfico financeiro" role="img"></canvas></article><article class="card"><h2>Prioridades</h2><div class="list">${tasks.slice(0,5).map(t=>`<div class="list-row"><div><strong>${t.title}</strong><br><span class="text-secondary">${t.priority||'Normal'} · ${dateShort(t.dueDate)}</span></div><span class="badge">${t.status}</span></div>`).join('') || '<div class="empty">Sem tarefas registadas.</div>'}</div></article></section>
    <section class="grid two" style="margin-top:18px"><article class="card"><h2>Projetos recentes</h2><div class="list">${projects.slice(0,5).map(p=>`<div class="list-row"><div><strong>${p.name}</strong><br><span class="text-secondary">${p.type||'Projeto'} · ${percent(p.progress)}</span></div><span class="badge">${p.status}</span></div>`).join('') || '<div class="empty">Sem projetos registados.</div>'}</div></article><article class="card"><h2>Calendário resumido</h2><div class="list">${events.concat(posts.map(p=>({...p,type:'publicação'}))).slice(0,5).map(e=>`<div class="list-row"><strong>${e.title}</strong><span class="text-secondary">${dateShort(e.date)}</span></div>`).join('') || '<div class="empty">Sem eventos próximos.</div>'}</div></article></section>`;
  drawBars(container.querySelector('#financeChart'), [{label:'Jul',income,expense}]);
}
