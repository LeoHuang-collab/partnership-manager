import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency, getStatusColor } from '../utils/helpers';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const data = await api.projects.getAll({ search, status: statusFilter });
      setProjects(data);
    } catch (error) {
      console.error('Load projects error:', error);
      if (error.message.includes('Token') || error.message.includes('授权')) {
        navigate('/login');
      }
    }
  };
  
  useEffect(() => {
    loadData();
  }, [search, statusFilter]);
  
  const handleDelete = async (id) => {
    if (confirm('确定要删除这个项目吗？')) {
      try {
        await api.projects.delete(id);
        loadData();
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const statuses = ['筹备中', '建设中', '已售罄', '已结算'];
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="搜索项目..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部状态</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      
      <Link
        to="/projects/new"
        className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-medium"
      >
        + 新增项目
      </Link>
      
      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无项目</p>
          <p className="text-sm">点击上方按钮添加第一个项目</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.location}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">合作方：</span>
                  <span className="text-gray-800">{project.partner?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">股权比例：</span>
                  <span className="text-gray-800">{project.equityRatio}%</span>
                </div>
                <div>
                  <span className="text-gray-500">总投资：</span>
                  <span className="text-gray-800">{formatCurrency(project.totalInvestment)}</span>
                </div>
                <div>
                  <span className="text-gray-500">我方权益：</span>
                  <span className="text-gray-800">{formatCurrency(project.totalInvestment * project.equityRatio / 100)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
