import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const PRIORITIES = ['紧急', '重要', '一般'];

export default function TodoNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdFromQuery = searchParams.get('projectId');
  
  const [todo, setTodo] = useState({
    projectId: projectIdFromQuery || '',
    task: '',
    blocker: '',
    responsiblePerson: '',
    planCompleteDate: '',
    actualCompleteDate: '',
    priority: '',
    status: '进行中',
  });
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    api.projects.getAll().then(setProjects).catch(console.error);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!todo.projectId) return alert('请选择项目');
    if (!todo.task) return alert('请填写事项');
    
    try {
      await api.todos.create(todo);
      navigate('/todos');
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800">新增待办事项</h2>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">选择项目 *</label>
          <select value={todo.projectId} onChange={(e) => setTodo({ ...todo, projectId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled={!!projectIdFromQuery}>
            <option value="">请选择项目</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">事项 *</label>
          <input type="text" value={todo.task} onChange={(e) => setTodo({ ...todo, task: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="请输入待办事项" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">优先级</label>
          <select value={todo.priority} onChange={(e) => setTodo({ ...todo, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">请选择优先级</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">卡点/难点</label>
          <textarea value={todo.blocker} onChange={(e) => setTodo({ ...todo, blocker: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">责任人</label>
          <input type="text" value={todo.responsiblePerson} onChange={(e) => setTodo({ ...todo, responsiblePerson: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">计划完成时间</label>
            <input type="date" value={todo.planCompleteDate} onChange={(e) => setTodo({ ...todo, planCompleteDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">实际完成时间</label>
            <input type="date" value={todo.actualCompleteDate} onChange={(e) => setTodo({ ...todo, actualCompleteDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium">保存</button>
      </form>
    </div>
  );
}
