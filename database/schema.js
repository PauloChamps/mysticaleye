export const APP_NAME = 'LOOREBEE Business Hub';
export const APP_VERSION = '1.0.0';
export const SCHEMA_VERSION = 1;

export const STORES = [
  { name: 'clients', keyPath: 'id', indexes: ['name', 'company', 'status', 'createdAt'] },
  { name: 'leads', keyPath: 'id', indexes: ['name', 'stage', 'createdAt'] },
  { name: 'projects', keyPath: 'id', indexes: ['name', 'clientId', 'status', 'deadline'] },
  { name: 'tasks', keyPath: 'id', indexes: ['title', 'projectId', 'clientId', 'status', 'dueDate'] },
  { name: 'marketingPosts', keyPath: 'id', indexes: ['title', 'clientId', 'platform', 'status', 'date'] },
  { name: 'events', keyPath: 'id', indexes: ['title', 'clientId', 'projectId', 'date', 'type'] },
  { name: 'financialMovements', keyPath: 'id', indexes: ['description', 'clientId', 'projectId', 'type', 'status', 'date', 'dueDate'] },
  { name: 'goals', keyPath: 'id', indexes: ['name', 'category', 'status', 'deadline'] },
  { name: 'documents', keyPath: 'id', indexes: ['title', 'category', 'clientId', 'projectId', 'date'] },
  { name: 'assets', keyPath: 'id', indexes: ['name', 'category', 'clientId', 'projectId', 'date'] },
  { name: 'templates', keyPath: 'id', indexes: ['title', 'type', 'category'] },
  { name: 'domains', keyPath: 'id', indexes: ['domain', 'clientId', 'renewalDate', 'status'] },
  { name: 'accounts', keyPath: 'id', indexes: ['platform', 'owner', 'clientId', 'status'] },
  { name: 'knowledgeArticles', keyPath: 'id', indexes: ['title', 'category', 'updatedAt', 'favorite'] },
  { name: 'activities', keyPath: 'id', indexes: ['module', 'entityId', 'createdAt'] },
  { name: 'files', keyPath: 'id', indexes: ['name', 'module', 'entityId', 'createdAt'] },
  { name: 'settings', keyPath: 'key' }
];
