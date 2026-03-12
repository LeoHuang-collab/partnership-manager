import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, getStatusColor, getPeriodLabel } from '../utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    pendingTodos: 0,
    completedTodos: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [recentTodos, setRecentTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [projectsData, todosData, reportsData] = await Promise.all([
        api.projects.getAll(),
        api.todos.getAll(),
        api.reports.getAll(),
      ]);
      
      const activeProjects = projectsData.filter(p => p.status === '建设中').length;
      const pendingTodos = todosData.filter(t => t.status === '进行中').length;
      const completedTodos = todosData.filter(t => t.status === '已完成').length;
      
      setStats({
        totalProjects: projectsData.length,
        activeProjects,
        pendingTodos,
        completedTodos,
      });
      
      const sortedReports = reportsData
        .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
        .slice(0, 5);
      
      setRecentReports(sortedReports);
      
      const sortedTodos = todosData
        .filter(t => t.status === '进行中')
        .sort((a, b) => new Date(a.planCompleteDate || '9999') - new Date(b.planCompleteDate || '9999'))
        .slice(0, 5);
      
      setRecentTodos(sortedTodos);
      
      setProjects(projectsData);
    } catch (error) {
      console.error('Load data error:', error);
      if (error.message.includes('Token') || error.message.includes('授权')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };
  
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className={`text-xl font-semibold ${color}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          title="项目总数" 
          value={stats.totalProjects} 
          icon="🏠" 
          color="text-blue-600"
        />
        <StatCard 
          title="进行中" 
          value={stats.activeProjects} 
          icon="🔄" 
          color="text-green-600"
        />
        <StatCard 
          title="待办事项" 
          value={stats.pendingTodos} 
          icon="📋" 
          color="text-orange-600"
        />
        <StatCard 
          title="已完成" 
          value={stats.completedTodos} 
          icon="✅" 
          color="text-green-600"
        />
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">项目列表</h2>
          <Link to="/projects" className="text-sm text-blue-600">查看全部</Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无项目</p>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 3).map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">待办事项</h2>
          <Link to="/todos" className="text-sm text-blue-600">查看全部</Link>
        </div>
        {recentTodos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无待办事项</p>
        ) : (
          <div className="space-y-2">
            {recentTodos.map(todo => (
              <Link
                key={todo.id}
                to="/todos"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{todo.task}</p>
                    <p className="text-xs text-gray-500">{todo.project?.name} · {todo.responsiblePerson || '待定'}</p>
                  </div>
                  <span className="text-xs text-orange-600">
                    {formatDate(todo.planCompleteDate)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">最新汇报</h2>
          <Link to="/reports" className="text-sm text-blue-600">查看全部</Link>
        </div>
        {recentReports.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无汇报记录</p>
        ) : (
          <div className="space-y-2">
            {recentReports.map(report => (
              <Link
                key={report.id}
                to={`/reports?project=${report.projectId}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{report.project?.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(report.reportDate)} · {getPeriodLabel(report.period)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.overallStatus)}`}>
                    {report.overallStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
