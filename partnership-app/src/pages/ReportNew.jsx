import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const PERIODS = [
  { value: 'week', label: '周报' },
  { value: 'month', label: '月报' },
  { value: 'quarter', label: '季报' },
];

export default function ReportNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdFromQuery = searchParams.get('projectId');
  
  const [report, setReport] = useState({
    projectId: projectIdFromQuery || '',
    reportDate: new Date().toISOString().split('T')[0],
    period: 'week',
    progress: '',
    difficulties: '',
    matters: '',
    overallStatus: '正常',
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  
  useEffect(() => {
    api.projects.getAll().then(setProjects).catch(console.error);
  }, []);
  
  useEffect(() => {
    if (report.projectId) {
      const project = projects.find(p => p.id === report.projectId);
      if (project) setSelectedProject({ ...project, partnerName: project.partner?.name || '-', contacts: project.partner?.contacts || [] });
    }
  }, [report.projectId, projects]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!report.projectId) return alert('请选择项目');
    
    try {
      await api.reports.create(report);
      navigate('/reports');
    } catch (error) {
      alert(error.message);
    }
  };
  
  const generateReportContent = () => {
    if (!selectedProject) return;
    const periodLabel = PERIODS.find(p => p.value === report.period)?.label || '汇报';
    const statusLabel = { '正常': '进展顺利', '关注': '需要关注', '预警': '存在风险' }[report.overallStatus] || report.overallStatus;
    
    let content = `【${selectedProject.name}】${periodLabel}\n汇报日期：${report.reportDate}\n合作方：${selectedProject.partnerName}\n我方股权：${selectedProject.equityRatio}%\n\n`;
    content += `一、项目进展\n${report.progress || '无'}\n\n`;
    content += `二、难点问题\n${report.difficulties || '无'}\n\n`;
    content += `三、需要协调事项\n${report.matters || '无'}\n\n`;
    content += `四、总体状态：${statusLabel}\n`;
    
    setGeneratedContent(content);
    setShowEmailModal(true);
  };
  
  const sendEmail = () => {
    if (!selectedProject?.contacts?.length) return alert('该合作方暂无对接人邮箱信息');
    const emails = selectedProject.contacts.map(c => c.email).filter(e => e);
    if (!emails.length) return alert('该合作方暂无对接人邮箱信息');
    const mailToLink = `mailto:${emails.join(',')}?subject=${encodeURIComponent(`【${selectedProject.name}】${PERIODS.find(p => p.value === report.period)?.label || '汇报'} - ${report.reportDate}`)}&body=${encodeURIComponent(generatedContent)}`;
    window.open(mailToLink);
    setShowEmailModal(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('汇报内容已复制到剪贴板');
  };
  
  const statuses = ['正常', '关注', '预警'];
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800">新增汇报</h2>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">选择项目 *</label>
          <select value={report.projectId} onChange={(e) => setReport({ ...report, projectId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled={!!projectIdFromQuery}>
            <option value="">请选择项目</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        
        {selectedProject && <div className="bg-gray-50 p-3 rounded-lg text-sm"><p className="text-gray-600">合作方：{selectedProject.partnerName}</p><p className="text-gray-600">股权比例：{selectedProject.equityRatio}%</p></div>}
        
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1">汇报日期</label><input type="date" value={report.reportDate} onChange={(e) => setReport({ ...report, reportDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">汇报类型</label>
            <select value={report.period} onChange={(e) => setReport({ ...report, period: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        
        <div><label className="block text-sm text-gray-600 mb-1">项目进展</label><textarea value={report.progress} onChange={(e) => setReport({ ...report, progress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={4} placeholder="请描述项目进展" /></div>
        <div><label className="block text-sm text-gray-600 mb-1">难点问题</label><textarea value={report.difficulties} onChange={(e) => setReport({ ...report, difficulties: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} /></div>
        <div><label className="block text-sm text-gray-600 mb-1">需要协调事项</label><textarea value={report.matters} onChange={(e) => setReport({ ...report, matters: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} /></div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">总体状态</label>
          <div className="flex gap-2">
            {statuses.map(s => (
              <button key={s} type="button" onClick={() => setReport({ ...report, overallStatus: s })} className={`flex-1 py-2 rounded-lg text-sm font-medium ${report.overallStatus === s ? (s === '正常' ? 'bg-green-100 text-green-800 border-2 border-green-500' : s === '关注' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500' : 'bg-red-100 text-red-800 border-2 border-red-500') : 'bg-gray-100 text-gray-600 border border-gray-300'}`}>{s}</button>
            ))}
          </div>
        </div>
        
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium">保存汇报</button>
        {report.progress || report.difficulties || report.matters ? <button type="button" onClick={generateReportContent} className="w-full py-2 bg-green-600 text-white rounded-lg font-medium">生成汇报材料并发送邮件</button> : null}
      </form>
      
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-3">汇报材料预览</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded mb-4 max-h-64 overflow-y-auto">{generatedContent}</pre>
            <p className="text-sm text-gray-600 mb-2">发送对象：</p>
            <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
              {selectedProject?.contacts?.filter(c => c.email).map(c => <div key={c.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{c.name} ({c.level}) - {c.email}</div>)}
              {(!selectedProject?.contacts || selectedProject.contacts.filter(c => c.email).length === 0) && <p className="text-red-500 text-sm">该合作方暂无邮箱信息</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={sendEmail} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium" disabled={!selectedProject?.contacts?.filter(c => c.email).length}>发送邮件</button>
              <button onClick={copyToClipboard} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">复制内容</button>
              <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
