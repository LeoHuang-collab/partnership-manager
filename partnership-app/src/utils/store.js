import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  PROJECTS: 'partnership_projects',
  PARTNERS: 'partnership_partners',
  REPORTS: 'partnership_reports',
  TODOS: 'partnership_todos',
};

const getStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const projectStore = {
  getAll: () => getStorage(STORAGE_KEYS.PROJECTS),
  
  getById: (id) => {
    const projects = getStorage(STORAGE_KEYS.PROJECTS);
    return projects.find(p => p.id === id);
  },
  
  create: (project) => {
    const projects = getStorage(STORAGE_KEYS.PROJECTS);
    const newProject = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(newProject);
    setStorage(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },
  
  update: (id, updates) => {
    const projects = getStorage(STORAGE_KEYS.PROJECTS);
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setStorage(STORAGE_KEYS.PROJECTS, projects);
      return projects[index];
    }
    return null;
  },
  
  delete: (id) => {
    const projects = getStorage(STORAGE_KEYS.PROJECTS);
    const filtered = projects.filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PROJECTS, filtered);
  },
};

export const partnerStore = {
  getAll: () => getStorage(STORAGE_KEYS.PARTNERS),
  
  getById: (id) => {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    return partners.find(p => p.id === id);
  },
  
  create: (partner) => {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    const newPartner = {
      ...partner,
      contacts: partner.contacts || [],
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    partners.push(newPartner);
    setStorage(STORAGE_KEYS.PARTNERS, partners);
    return newPartner;
  },
  
  update: (id, updates) => {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    const index = partners.findIndex(p => p.id === id);
    if (index !== -1) {
      partners[index] = { ...partners[index], ...updates };
      setStorage(STORAGE_KEYS.PARTNERS, partners);
      return partners[index];
    }
    return null;
  },
  
  delete: (id) => {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    const filtered = partners.filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PARTNERS, filtered);
  },
  
  addContact: (partnerId, contact) => {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    const index = partners.findIndex(p => p.id === partnerId);
    if (index !== -1) {
      const newContact = {
        ...contact,
        id: uuidv4(),
      };
      partners[index].contacts = [...(partners[index].contacts || []), newContact];
      setStorage(STORAGE_KEYS.PARTNERS, partners);
      return partners[index];
    }
    return null;
  },
  
  updateContact: (partnerId, contactId, updates) => {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    const partnerIndex = partners.findIndex(p => p.id === partnerId);
    if (partnerIndex !== -1) {
      const contactIndex = partners[partnerIndex].contacts.findIndex(c => c.id === contactId);
      if (contactIndex !== -1) {
        partners[partnerIndex].contacts[contactIndex] = {
          ...partners[partnerIndex].contacts[contactIndex],
          ...updates,
        };
        setStorage(STORAGE_KEYS.PARTNERS, partners);
        return partners[partnerIndex];
      }
    }
    return null;
  },
  
  deleteContact: (partnerId, contactId) => {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    const index = partners.findIndex(p => p.id === partnerId);
    if (index !== -1) {
      partners[index].contacts = partners[index].contacts.filter(c => c.id !== contactId);
      setStorage(STORAGE_KEYS.PARTNERS, partners);
      return partners[index];
    }
    return null;
  },
};

export const reportStore = {
  getAll: () => getStorage(STORAGE_KEYS.REPORTS),
  
  getByProject: (projectId) => {
    const reports = getStorage(STORAGE_KEYS.REPORTS);
    return reports.filter(r => r.projectId === projectId);
  },
  
  getByProjectAndPeriod: (projectId, period) => {
    const reports = getStorage(STORAGE_KEYS.REPORTS);
    return reports.filter(r => r.projectId === projectId && r.period === period);
  },
  
  getLatestByProject: (projectId, period) => {
    const reports = getStorage(STORAGE_KEYS.REPORTS);
    const filtered = reports.filter(r => r.projectId === projectId && r.period === period);
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))[0];
  },
  
  create: (report) => {
    const reports = getStorage(STORAGE_KEYS.REPORTS);
    const newReport = {
      ...report,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    reports.push(newReport);
    setStorage(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  },
  
  update: (id, updates) => {
    const reports = getStorage(STORAGE_KEYS.REPORTS);
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates };
      setStorage(STORAGE_KEYS.REPORTS, reports);
      return reports[index];
    }
    return null;
  },
  
  delete: (id) => {
    const reports = getStorage(STORAGE_KEYS.REPORTS);
    const filtered = reports.filter(r => r.id !== id);
    setStorage(STORAGE_KEYS.REPORTS, filtered);
  },
};

export const todoStore = {
  getAll: () => getStorage(STORAGE_KEYS.TODOS),
  
  getByProject: (projectId) => {
    const todos = getStorage(STORAGE_KEYS.TODOS);
    return todos.filter(t => t.projectId === projectId);
  },
  
  create: (todo) => {
    const todos = getStorage(STORAGE_KEYS.TODOS);
    const newTodo = {
      ...todo,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    todos.push(newTodo);
    setStorage(STORAGE_KEYS.TODOS, todos);
    return newTodo;
  },
  
  update: (id, updates) => {
    const todos = getStorage(STORAGE_KEYS.TODOS);
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      setStorage(STORAGE_KEYS.TODOS, todos);
      return todos[index];
    }
    return null;
  },
  
  delete: (id) => {
    const todos = getStorage(STORAGE_KEYS.TODOS);
    const filtered = todos.filter(t => t.id !== id);
    setStorage(STORAGE_KEYS.TODOS, filtered);
  },
};

export const initSampleData = () => {
  if (getStorage(STORAGE_KEYS.PARTNERS).length === 0) {
    const samplePartners = [
      {
        name: '鼎晖投资',
        type: '机构',
        contacts: [
          { name: '张经理', level: '项目基层人员', phone: '13800138000', email: 'zhang@dinghui.com' },
          { name: '王总', level: '项目负责人', phone: '13800138001', email: 'wang@dinghui.com' },
          { name: '李董', level: '集团公司管理层', phone: '13800138002', email: 'li@dinghui.com' },
        ],
      },
      {
        name: '红杉资本',
        type: '机构',
        contacts: [
          { name: '李经理', level: '项目基层人员', phone: '13900139000', email: 'li@sequoia.com' },
          { name: '陈总', level: '项目负责人', phone: '13900139001', email: 'chen@sequoia.com' },
        ],
      },
    ];
    samplePartners.forEach(p => partnerStore.create(p));
  }
  
  if (getStorage(STORAGE_KEYS.PROJECTS).length === 0) {
    const partners = getStorage(STORAGE_KEYS.PARTNERS);
    if (partners.length > 0) {
      const sampleProjects = [
        {
          name: '翡翠湾住宅项目',
          location: '上海市浦东新区',
          partnerId: partners[0].id,
          equityRatio: 40,
          totalInvestment: 50000,
          status: '建设中',
          startDate: '2024-01-15',
          endDate: '2026-06-30',
        },
        {
          name: '财富广场商业项目',
          location: '北京市朝阳区',
          partnerId: partners[1]?.id || partners[0].id,
          equityRatio: 35,
          totalInvestment: 80000,
          status: '筹备中',
          startDate: '2024-06-01',
          endDate: '2027-12-31',
        },
      ];
      sampleProjects.forEach(p => projectStore.create(p));
    }
  }
};
