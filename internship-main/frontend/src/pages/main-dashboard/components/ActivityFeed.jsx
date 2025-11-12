import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'application': return 'FileText';
      case 'interview': return 'Calendar';
      case 'offer': return 'CheckCircle';
      case 'rejection': return 'XCircle';
      case 'profile': return 'User';
      default: return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'application': return 'text-blue-600 bg-blue-50';
      case 'interview': return 'text-purple-600 bg-purple-50';
      case 'offer': return 'text-green-600 bg-green-50';
      case 'rejection': return 'text-red-600 bg-red-50';
      case 'profile': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return activityDate?.toLocaleDateString();
  };

  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          {t('dashboard.activity.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('dashboard.activity.subtitle')}
        </p>
      </div>
      <div className="space-y-4">
        {activities?.slice(0, 6)?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                {activity?.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTimeAgo(activity?.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
      {activities?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t('dashboard.activity.emptyTitle')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('dashboard.activity.emptyDesc')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;