import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalyticsView = ({ applications }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('status');

  const timeFilters = [
    { value: 'all', label: 'All Time' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
    { value: '180', label: 'Last 6 Months' }
  ];

  // Filter applications based on time
  const filteredApplications = useMemo(() => {
    if (timeFilter === 'all') return applications;
    
    const cutoffDate = new Date();
    cutoffDate?.setDate(cutoffDate?.getDate() - parseInt(timeFilter));
    
    return applications?.filter(app => new Date(app.appliedDate) >= cutoffDate);
  }, [applications, timeFilter]);

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCounts = filteredApplications?.reduce((acc, app) => {
      acc[app.status] = (acc?.[app?.status] || 0) + 1;
      return acc;
    }, {});

    const statusLabels = {
      applied: 'Applied',
      under_review: 'Under Review',
      interview_scheduled: 'Interview Scheduled',
      offer_received: 'Offer Received',
      rejected: 'Rejected'
    };

    return Object.entries(statusCounts)?.map(([status, count]) => ({
      name: statusLabels?.[status] || status,
      value: count,
      status: status
    }));
  }, [filteredApplications]);

  // Monthly application trend
  const monthlyTrend = useMemo(() => {
    const monthlyData = {};
    
    filteredApplications?.forEach(app => {
      const date = new Date(app.appliedDate);
      const monthKey = `${date?.getFullYear()}-${String(date?.getMonth() + 1)?.padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData?.[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)?.sort(([a], [b]) => a?.localeCompare(b))?.map(([month, count]) => ({
        month: new Date(month + '-01')?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        applications: count
      }));
  }, [filteredApplications]);

  // Success rate calculation
  const successRate = useMemo(() => {
    const total = filteredApplications?.length;
    const successful = filteredApplications?.filter(app => 
      app?.status === 'offer_received' || app?.status === 'interview_scheduled'
    )?.length;
    
    return total > 0 ? Math.round((successful / total) * 100) : 0;
  }, [filteredApplications]);

  // Response rate calculation
  const responseRate = useMemo(() => {
    const total = filteredApplications?.length;
    const responded = filteredApplications?.filter(app => 
      app?.status !== 'applied'
    )?.length;
    
    return total > 0 ? Math.round((responded / total) * 100) : 0;
  }, [filteredApplications]);

  // Company distribution
  const companyData = useMemo(() => {
    const companyCounts = filteredApplications?.reduce((acc, app) => {
      acc[app.company] = (acc?.[app?.company] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(companyCounts)?.sort(([, a], [, b]) => b - a)?.slice(0, 10)?.map(([company, count]) => ({
        company,
        applications: count
      }));
  }, [filteredApplications]);

  const COLORS = ['#2563EB', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];

  const StatCard = ({ title, value, subtitle, icon, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name={icon} size={24} className="text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <Icon 
            name={trend > 0 ? 'TrendingUp' : 'TrendingDown'} 
            size={16} 
            className={trend > 0 ? 'text-green-500' : 'text-red-500'} 
          />
          <span className={`text-sm ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}% from last period
          </span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Time Period:</span>
            <div className="flex bg-muted rounded-lg p-1">
              {timeFilters?.map((filter) => (
                <button
                  key={filter?.value}
                  onClick={() => setTimeFilter(filter?.value)}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                    timeFilter === filter?.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter?.label}
                </button>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export Report
          </Button>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value={filteredApplications?.length}
          subtitle="Applications submitted"
          icon="FileText"
          trend={12}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle="Interviews + Offers"
          icon="Target"
          trend={5}
        />
        <StatCard
          title="Response Rate"
          value={`${responseRate}%`}
          subtitle="Companies responded"
          icon="MessageSquare"
          trend={-2}
        />
        <StatCard
          title="Active Applications"
          value={filteredApplications?.filter(app => 
            ['applied', 'under_review', 'interview_scheduled']?.includes(app?.status)
          )?.length}
          subtitle="In progress"
          icon="Clock"
          trend={8}
        />
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Application Status</h3>
            <Icon name="PieChart" size={20} className="text-muted-foreground" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Application Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Application Trend</h3>
            <Icon name="TrendingUp" size={20} className="text-muted-foreground" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Top Companies</h3>
            <Icon name="Building" size={20} className="text-muted-foreground" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  type="number"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="company" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="applications" 
                  fill="var(--color-secondary)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Application Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <Icon name="Activity" size={20} className="text-muted-foreground" />
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {filteredApplications?.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))?.slice(0, 8)?.map((app, index) => (
                <div key={app?.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    app?.status === 'offer_received' ? 'bg-green-500' :
                    app?.status === 'interview_scheduled' ? 'bg-purple-500' :
                    app?.status === 'under_review' ? 'bg-yellow-500' :
                    app?.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {app?.company} - {app?.position}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(app.appliedDate)?.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    app?.status === 'offer_received' ? 'bg-green-100 text-green-800' :
                    app?.status === 'interview_scheduled' ? 'bg-purple-100 text-purple-800' :
                    app?.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                    app?.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {app?.status?.replace('_', ' ')}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsView;