export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('zh-CN').format(num);
};

export const formatCurrency = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num * 10000);
};

export const getStatusColor = (status) => {
  const colors = {
    '筹备中': 'bg-blue-100 text-blue-800',
    '建设中': 'bg-green-100 text-green-800',
    '已售罄': 'bg-yellow-100 text-yellow-800',
    '已结算': 'bg-gray-100 text-gray-800',
    '待确认': 'bg-orange-100 text-orange-800',
    '已确认': 'bg-blue-100 text-blue-800',
    '已支付': 'bg-green-100 text-green-800',
    '正常': 'bg-green-100 text-green-800',
    '关注': 'bg-yellow-100 text-yellow-800',
    '预警': 'bg-red-100 text-red-800',
    '进行中': 'bg-orange-100 text-orange-800',
    '已完成': 'bg-green-100 text-green-800',
    '已逾期': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPeriodLabel = (period) => {
  const labels = {
    'week': '周报',
    'month': '月报',
    'quarter': '季报',
  };
  return labels[period] || period;
};
