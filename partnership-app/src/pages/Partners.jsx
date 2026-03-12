import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Partners() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const data = await api.partners.getAll({ search });
      setPartners(data);
    } catch (error) {
      console.error('Load partners error:', error);
      if (error.message.includes('Token') || error.message.includes('授权')) {
        navigate('/login');
      }
    }
  };
  
  useEffect(() => {
    loadData();
  }, [search]);
  
  const handleDelete = async (id) => {
    if (confirm('确定要删除这个合作方吗？')) {
      try {
        await api.partners.delete(id);
        loadData();
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="搜索合作方..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <Link
        to="/partners/new"
        className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-medium"
      >
        + 新增合作方
      </Link>
      
      {partners.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无合作方</p>
          <p className="text-sm">点击上方按钮添加第一个合作方</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map(partner => (
            <div
              key={partner.id}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{partner.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {partner.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/partners/${partner.id}`}
                    className="text-blue-600 text-sm"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="text-red-600 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1 mb-2">
                <p className="text-blue-600">合作项目数：{partner._count?.projects || 0}</p>
              </div>
              
              {partner.contacts && partner.contacts.length > 0 && (
                <div>
                  <button
                    className="text-xs text-gray-500 flex items-center gap-1"
                  >
                    对接人 ({partner.contacts.length}人)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
