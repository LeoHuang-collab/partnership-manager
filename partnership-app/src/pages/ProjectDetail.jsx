import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, getStatusColor, getPeriodLabel } from '../utils/helpers';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [project, setProject] = useState({
    name: '', location: '', partnerId: '', equityRatio: 50, totalInvestment: 0, status: '筹备中', startDate: '', endDate: '',
  });
  const [partners, setPartners] = useState([]);
  const [reports, setReports] = useState([]);
  const [todos, setTodos] = useState([]);
  
  useEffect(() => {
    api.partners.getAll().then(setPartners).catch(console.error);
    if (!isNew) {
      api.projects.getById(id).then(data => {
        setProject(data);
        setReports(data.reports || []);
        setTodos(data.todos || []);
      }).catch(console.error);
    }
  }, [id, isNew]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project.name || !project.partnerId) return alert('请填写项目名称和选择合作方');
    
    try {
      if (isNew) await api.projects.create(project);
      else await api.projects.update(id, project);
      navigate('/projects');
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleDelete = async () => {
    if (confirm('确定要删除这个项目吗？')) {
      try {
        await api.projects.delete(id);
        navigate('/projects');
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const pendingTodos = todos.filter(t => t.status === '进行中').length;
  const completedTodos = todos.filter(t => t.status === '已完成').length;
  const statuses = ['筹备中', '建设中', '已售罄', '已结算'];
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800">{isNew ? '新增项目' : '编辑项目'}</h2>
        
        <div><label className="block text-sm text-gray-600 mb-1">项目名称 *</label><input type="text" value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="请输入项目名称" /></div>
        <div><label className="block text-sm text-gray-600 mb-1">项目位置</label><input type="text" value={project.location} onChange={(e) => setProject({ ...project, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">合作方 *</label>
          <select value={project.partnerId} onChange={(e) => setProject({ ...project, partnerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">请选择合作方</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1">我方股权比例 (%)</label><input type="number" value={project.equityRatio} onChange={(e) => setProject({ ...project, equityRatio: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">总投资额 (万元)</label><input type="number" value={project.totalInvestment} onChange={(e) => setProject({ ...project, totalInvestment: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">项目状态</label>
          <select value={project.status} onChange={(e) => setProject({ ...project, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1">开工日期</label><input type="date" value={project.startDate} onChange={(e) => setProject({ ...project, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">计划结束日期</label><input type="date" value={project.endDate} onChange={(e) => setProject({ ...project, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium">{isNew ? '创建项目' : '保存修改'}</button>
          {!isNew && <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium">删除</button>}
        </div>
      </form>
      
      {!isNew && (
        <>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">待办事项</h2>
              <Link to={`/todos/new?projectId=${id}`} className="text-sm text-blue-600">+ 添加待办</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-orange-50 p-3 rounded"><p className="text-gray-500">进行中</p><p className="font-semibold text-orange-600">{pendingTodos}</p></div>
              <div className="bg-green-50 p-3 rounded"><p className="text-gray-500">已完成</p><p className="font-semibold text-green-600">{completedTodos}</p></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">汇报记录</h2>
              <Link to={`/reports/new?projectId=${id}`} className="text-sm text-blue-600">+ 添加汇报</Link>
            </div>
            {reports.length === 0 ? <p className="text-gray-500 text-center py-4">暂无汇报记录</p> : (
              <div className="space-y-2">
                {reports.slice(0, 3).map(r => (
                  <div key={r.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div><p className="text-sm font-medium text-gray-800">{formatDate(r.reportDate)} · {getPeriodLabel(r.period)}</p></div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(r.overallStatus)}`}>{r.overallStatus}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
