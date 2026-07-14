# LOOREBEE Business Hub

Sistema interno de gestão empresarial para a LOOREBEE Digital Marketing, concebido como produto local-first, responsivo, modular e preparado para evolução futura para Supabase, Firebase ou API própria.

## Arquitetura proposta

- **Frontend sem frameworks:** HTML5, CSS3 e JavaScript ES6+ em módulos nativos.
- **Persistência principal:** IndexedDB, com object stores versionadas e índices por módulo.
- **Preferências simples:** LocalStorage apenas para tema, filtros e preferências visuais.
- **PWA:** manifest e service worker para cache dos recursos principais e utilização offline após o primeiro carregamento.
- **Design system:** tokens LOOREBEE, dark mode principal, light mode, componentes reutilizáveis e CSS segmentado.
- **Dados demo:** `database/demo-data.json` usado apenas para arranque/importação, nunca como base de dados gravável.

## Estrutura de dados

As entidades principais serão: clientes, leads, projetos, tarefas, publicações, eventos, movimentos financeiros, objetivos, documentos, ativos, templates, domínios, contas, artigos, ficheiros, atividades e definições. Todas terão identificador único, timestamps, estado e campos de associação por `clientId`/`projectId` quando aplicável.

## Esquema IndexedDB

O ficheiro `database/schema.js` define a versão do esquema e as object stores iniciais. A versão atual é `1`, com índices preparados para pesquisa, filtros, dashboard, notificações e futuras migrações.

## Componentes reutilizáveis

A Fase 1 inicia os componentes de shell, sidebar, topbar, pesquisa global, toasts, cartões, listas, KPI cards, gráfico canvas, empty states e estrutura para modais/drawers/formulários nas próximas fases.

## Fluxo de navegação

A navegação usa páginas HTML independentes com bootstrap comum em `js/app.js`. A sidebar organiza os módulos por grupos recolhíveis: Operação, Marketing, Gestão e Administração. O dashboard é a entrada principal.

## Plano da Fase 1

1. Criar estrutura de pastas e páginas base.
2. Implementar sistema visual LOOREBEE com dark/light mode.
3. Criar layout responsivo com sidebar, topbar, pesquisa e criação rápida.
4. Implementar IndexedDB versionado.
5. Criar dados de demonstração profissionais e isolados.
6. Construir dashboard com métricas calculadas a partir dos dados.
7. Preparar PWA e documentação inicial.

## Riscos técnicos

- IndexedDB tem limites variáveis por navegador, especialmente para ficheiros grandes.
- Dados locais não são sincronizados automaticamente entre computadores.
- Backups JSON dependem de ação manual do utilizador até existir backend.
- Service workers exigem execução em origem segura ou servidor local.

## Decisões de segurança

- Não armazenar palavras-passe reais, tokens privados ou chaves secretas.
- Credenciais futuras terão apenas referência à localização da palavra-passe.
- Dados importados serão validados antes de escrita em IndexedDB.
- Dados exibidos pelo utilizador devem ser sanitizados e inseridos sem HTML não confiável.
- Ações destrutivas terão confirmação explícita nas fases seguintes.

## Funcionalidades da Fase 1

- Layout premium responsivo.
- Sidebar agrupada e topbar com pesquisa global visual.
- Dark mode e light mode persistidos em LocalStorage.
- IndexedDB com stores empresariais.
- Dashboard com KPIs calculados.
- Gráfico financeiro em Canvas API.
- Dados demo relacionados com LOOREBEE, PraiaDaAmorosa.pt, World of Celestian e ImigraEuropa.
- PWA inicial com cache dos recursos principais.

## Instalação e execução local

Por usar módulos ES6 e service worker, execute com um servidor local:

```bash
python3 -m http.server 8080
```

Depois abra `http://localhost:8080/dashboard.html`.

## Armazenamento

Este sistema utiliza armazenamento local no navegador. Os dados ficam no dispositivo e não são sincronizados automaticamente entre computadores.

- IndexedDB: dados principais da aplicação.
- LocalStorage: preferências simples.
- JSON: demonstração, importação, exportação e backup.

## Backup, importação e exportação

A área completa de backup será implementada na Fase 6 com envelope versionado:

```json
{
  "app": "LOOREBEE Business Hub",
  "version": "1.0.0",
  "schemaVersion": 1,
  "exportedAt": "",
  "data": {}
}
```

## Segurança e limitações

Por segurança, utilize um gestor de palavras-passe para guardar credenciais sensíveis. O módulo de contas não deverá guardar palavras-passe reais.

## Roadmap

- **Fase 2:** clientes, leads, projetos e tarefas funcionais.
- **Fase 3:** marketing, calendário editorial e conteúdos.
- **Fase 4:** financeiro, objetivos e relatórios.
- **Fase 5:** documentos, imagens, templates, domínios, contas e conhecimento.
- **Fase 6:** pesquisa global completa, notificações, backup, acessibilidade avançada, testes e documentação final.

## Capturas de ecrã

A adicionar quando a identidade visual final e a logótipo oficial estiverem disponíveis em `assets/branding/logo-loorebee.png`.

## Créditos e identidade LOOREBEE

A aplicação foi desenhada para usar a logótipo oficial em `assets/branding/logo-loorebee.png`, sem recriação, redesenho ou geração por IA. Caso o ficheiro ainda não exista, a interface usa uma marca textual temporária apenas como fallback técnico.
