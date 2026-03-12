import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const CONTACT_LEVELS = ['项目基层人员', '项目负责人', '集团公司管理层'];

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [partner, setPartner] = useState({
    name: '',
    type: '机构',
    contacts: [],
  });
  const [projects, setProjects] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    level: '项目基层人员',
    phone: '',
    email: '',
  });
  
  useEffect(() => {
    if (!isNew) {
      loadPartner();
    }
  }, [id, isNew]);
  
  const loadPartner = async () => {
    try {
      const data = await api.partners.getById(id);
      setPartner(data);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Load partner error:', error);
      if (error.message.includes('Token') || error.message.includes('授权')) {
        navigate('/login');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!partner.name) {
      alert('请填写合作方名称');
      return;
    }
    
    try {
      if (isNew) {
        await api.partners.create(partner);
      } else {
        await api.partners.update(id, partner);
      }
      navigate('/partners');
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleDelete = async () => {
    if (confirm('确定要删除这个合作方吗？')) {
      try {
        await api.partners.delete(id);
        navigate('/partners');
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const handleAddContact = async () => {
    if (!contactForm.name) {
      alert('请填写联系人姓名');
      return;
    }
    
    let newContacts;
    if (editingContact) {
      newContacts = partner.contacts.map(c => c.id === editingContact.id ? { ...c, ...contactForm } : c);
    } else {
      newContacts = [...(partner.contacts || []), { ...contactForm, id: Date.now().toString() }];
    }
    
    try {
      await api.partners.update(id, { ...partner, contacts: newContacts });
      setPartner({ ...partner, contacts: newContacts });
      setShowContactForm(false);
      setEditingContact(null);
      setContactForm({ name: '', level: '项目基层人员', phone: '', email: '' });
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({ name: contact.name, level: contact.level, phone: contact.phone, email: contact.email });
    setShowContactForm(true);
  };
  
  const handleDeleteContact = async (contactId) => {
    if (confirm('确定要删除这个联系人吗？')) {
      const newContacts = partner.contacts.filter(c => c.id !== contactId);
      try {
        await api.partners.update(id, { ...partner, contacts: newContacts });
        setPartner({ ...partner, contacts: newContacts });
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const groupedContacts = (partner.contacts || []).reduce((acc, contact) => {
    if (!acc[contact.level]) {
      acc[contact.level] = [];
    }
    acc[contact.level].push(contact);
    return acc;
  }, {});
  
  const types = ['机构', '个人'];
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800">{isNew ? '新增合作方' : '编辑合作方'}</h2>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">合作方名称 *</label>
          <input
            type="text"
            value={partner.name}
            onChange={(e) => setPartner({ ...partner, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入合作方名称"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">类型</label>
          <select
            value={partner.type}
            onChange={(e) => setPartner({ ...partner, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        
        {!isNew && (
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              保存修改
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium"
            >
              删除
            </button>
          </div>
        )}
        
        {isNew && (
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            创建
          </button>
        )}
      </form>
      
      {!isNew && (
        <>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">对接人列表</h2>
              <button
                onClick={() => {
                  setShowContactForm(true);
                  setEditingContact(null);
                  setContactForm({ name: '', level: '项目基层人员', phone: '', email: '' });
                }}
                className="text-sm text-blue-600"
              >
                + 添加对接人
              </button>
            </div>
            
            {showContactForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  {editingContact ? '编辑对接人' : '新增对接人'}
                </h3>
                <div>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="姓名 *"
                  />
                </div>
                <div>
                  <select
                    value={contactForm.level}
                    onChange={(e) => setContactForm({ ...contactForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {CONTACT_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="电话"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="邮箱"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddContact}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                  >
                    {editingContact ? '保存' : '添加'}
                  </button>
                  <button
                    onClick={() => {
                      setShowContactForm(false);
                      setEditingContact(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            {CONTACT_LEVELS.map(level => (
              groupedContacts[level] && groupedContacts[level].length > 0 && (
                <div key={level} className="mb-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{level}</h3>
                  <div className="space-y-2">
                    {groupedContacts[level].map(contact => (
                      <div key={contact.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.phone} · {contact.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="text-xs text-blue-600"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-xs text-red-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            {(!partner.contacts || partner.contacts.length === 0) && (
              <p className="text-gray-500 text-center py-4">暂无对接人</p>
            )}
          </div>
          
          {projects.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3">合作项目</h2>
              <div className="space-y-2">
                {projects.map(p => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.location} · {p.status}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
