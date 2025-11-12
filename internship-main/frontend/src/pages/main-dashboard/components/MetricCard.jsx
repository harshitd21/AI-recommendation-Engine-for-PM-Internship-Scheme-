import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, icon, color, trend, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200 cursor-pointer ${
        onClick ? 'hover:border-primary/30' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses?.[color] || colorClasses?.blue}`}>
          <Icon name={icon} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend?.type === 'up' ? 'text-success' : trend?.type === 'down' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            <Icon 
              name={trend?.type === 'up' ? 'TrendingUp' : trend?.type === 'down' ? 'TrendingDown' : 'Minus'} 
              size={16} 
            />
            <span>{trend?.value}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-muted-foreground text-sm">{title}</p>
      </div>
    </div>
  );
};

export default MetricCard;