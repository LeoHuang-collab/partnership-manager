import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, getStatusColor } from '../utils/helpers';

const STATUSES = ['进行中', '已完成', '已逾期'];
const PRIORITIES = ['紧急', '重要', '一般'];

export default function Todos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  useEffect(() => {
    loadData();
  }, [projectFilter, statusFilter, priorityFilter]);
  
  const loadData = async () => {
    try {
      const [todosData, projectsData] = await Promise.all([
        api.todos.getAll({ projectId: projectFilter, status: statusFilter, priority: priorityFilter }),
        api.projects.getAll(),
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      
      const todosWithInfo = todosData.map(t => {
        let displayStatus = t.status;
        if (displayStatus === '进行中' && t.planCompleteDate && t.planCompleteDate < today) {
          displayStatus = '已逾期';
        }
        return { ...t, displayStatus };
      }).sort((a, b) => {
        const statusOrder = { '进行中': 0, '已逾期': 1, '已完成': 2 };
        if (statusOrder[a.displayStatus] !== statusOrder[b.displayStatus]) {
          return statusOrder[a.displayStatus] - statusOrder[b.displayStatus];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setTodos(todosWithInfo);
      setProjects(projectsData);
    } catch (error) {
      console.error('Load todos error:', error);
      if (error.message.includes('Token') || error.message.includes('授权')) {
        navigate('/login');
      }
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm('确定要删除这条待办事项吗？')) {
      try {
        await api.todos.delete(id);
        loadData();
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.todos.update(id, { 
        status: newStatus,
        actualCompleteDate: newStatus === '已完成' ? new Date().toISOString().split('T')[0] : null
      });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };
  
  const pendingTodos = todos.filter(t => t.displayStatus === '进行中').length;
  const completedTodos = todos.filter(t => t.displayStatus === '已完成').length;
  const overdueTodos = todos.filter(t => t.displayStatus === '已逾期').length;
  
  const getPriorityColor = (priority) => {
    const colors = { '紧急': 'bg-red-100 text-red-800', '重要': 'bg-yellow-100 text-yellow-800', '一般': 'bg-gray-100 text-gray-800' };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">全部项目</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">全部状态</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">全部优先级</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg p-3 shadow-sm"><p className="text-xs text-gray-500">进行中</p><p className="text-xl font-semibold text-orange-600">{pendingTodos}</p></div>
        <div className="bg-white rounded-lg p-3 shadow-sm"><p className="text-xs text-gray-500">已逾期</p><p className="text-xl font-semibold text-red-600">{overdueTodos}</p></div>
        <div className="bg-white rounded-lg p-3 shadow-sm"><p className="text-xs text-gray-500">已完成</p><p className="text-xl font-semibold text-green-600">{completedTodos}</p></div>
      </div>
      
      <Link to={projectFilter ? `/todos/new?projectId=${projectFilter}` : '/todos/new'} className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-medium">
        + 新增待办事项
      </Link>
      
      {todos.length === 0 ? (
        <div className="text-center py-8 text-gray-500"><p>暂无待办事项</p></div>
      ) : (
        <div className="space-y-3">
          {todos.map(todo => (
            <div key={todo.id} className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${todo.displayStatus === '进行中' ? 'border-orange-400' : todo.displayStatus === '已逾期' ? 'border-red-400' : 'border-green-400'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{todo.task}</h3>
                    {todo.priority && <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(todo.priority)}`}>{todo.priority}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{todo.project?.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(todo.displayStatus)}`}>{todo.displayStatus}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                {todo.blocker && <p><span className="text-gray-500">卡点：</span>{todo.blocker}</p>}
                {todo.responsiblePerson && <p><span className="text-gray-500">责任人：</span>{todo.responsiblePerson}</p>}
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-500">计划完成：{formatDate(todo.planCompleteDate)}</span>
                  {todo.actualCompleteDate && <span className="text-green-600">实际完成：{formatDate(todo.actualCompleteDate)}</span>}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                {todo.displayStatus === '进行中' && <button onClick={() => handleUpdateStatus(todo.id, '已完成')} className="flex-1 py-1.5 text-sm text-green-600 border border-green-600 rounded">标记完成</button>}
                {todo.displayStatus === '已完成' && <button onClick={() => handleUpdateStatus(todo.id, '进行中')} className="flex-1 py-1.5 text-sm text-orange-600 border border-orange-600 rounded">重新打开</button>}
                <button onClick={() => handleDelete(todo.id)} className="px-4 py-1.5 text-sm text-red-600 border border-red-600 rounded">删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
