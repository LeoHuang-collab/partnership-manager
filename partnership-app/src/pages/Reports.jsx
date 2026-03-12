import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, getStatusColor, getPeriodLabel } from '../utils/helpers';

const PERIODS = [
  { value: 'week', label: '周报' },
  { value: 'month', label: '月报' },
  { value: 'quarter', label: '季报' },
];

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || '');
  const [periodFilter, setPeriodFilter] = useState('');
  
  useEffect(() => {
    loadData();
  }, [projectFilter, periodFilter]);
  
  const loadData = async () => {
    try {
      const [reportsData, projectsData] = await Promise.all([
        api.reports.getAll({ projectId: projectFilter, period: periodFilter }),
        api.projects.getAll(),
      ]);
      setReports(reportsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Load reports error:', error);
      if (error.message.includes('Token') || error.message.includes('授权')) {
        navigate('/login');
      }
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm('确定要删除这条汇报记录吗？')) {
      try {
        await api.reports.delete(id);
        loadData();
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const generateReport = (report) => {
    const periodLabel = PERIODS.find(p => p.value === report.period)?.label || '汇报';
    const statusLabel = {
      '正常': '进展顺利',
      '关注': '需要关注',
      '预警': '存在风险',
    }[report.overallStatus] || report.overallStatus;
    
    return `
【${report.project?.name}】${periodLabel}
汇报日期：${formatDate(report.reportDate)}
合作方：${report.project?.partner?.name}
我方股权：${report.project?.equityRatio}%

一、项目进展
${report.progress || '无'}

二、难点问题
${report.difficulties || '无'}

三、需要协调事项
${report.matters || '无'}

四、总体状态：${statusLabel}
    `.trim();
  };
  
  const copyToClipboard = (report) => {
    const text = generateReport(report);
    navigator.clipboard.writeText(text);
    alert('汇报内容已复制到剪贴板');
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部项目</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部类型</option>
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      
      <Link
        to={projectFilter ? `/reports/new?projectId=${projectFilter}` : '/reports/new'}
        className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-medium"
      >
        + 新增汇报
      </Link>
      
      {reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无汇报记录</p>
          <p className="text-sm">点击上方按钮添加汇报</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{report.project?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(report.reportDate)} · {getPeriodLabel(report.period)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.overallStatus)}`}>
                  {report.overallStatus}
                </span>
              </div>
              
              {report.progress && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500">项目进展</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{report.progress}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => copyToClipboard(report)}
                  className="flex-1 py-1.5 text-sm text-blue-600 border border-blue-600 rounded"
                >
                  复制汇报
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="px-4 py-1.5 text-sm text-red-600 border border-red-600 rounded"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
