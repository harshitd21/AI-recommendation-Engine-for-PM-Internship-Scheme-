import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';

const InternshipCard = ({ internship, onApply, onSave, onViewDetails, onAction }) => {
  const [isSaved, setIsSaved] = useState(internship?.isSaved || false);
  const [isApplying, setIsApplying] = useState(false);
  const { t } = useTranslation();

  const handleSave = async () => {
    setIsSaved(!isSaved);
    await onSave(internship?.id, !isSaved);
  };

  const handleApply = async () => {
    setIsApplying(true);
    await onApply(internship?.id);
    setIsApplying(false);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'text-success bg-success/10';
    if (percentage >= 75) return 'text-primary bg-primary/10';
    if (percentage >= 60) return 'text-warning bg-warning/10';
    return 'text-muted-foreground bg-muted';
  };

  const formatStipend = (amount) => {
    if (amount === 0) return 'Unpaid';
    if (amount >= 100000) return `₹${(amount / 100000)?.toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000)?.toFixed(0)}K`;
    return `₹${amount}`;
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline(internship?.applicationDeadline);

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
            <Image
              src={internship?.company?.logo || internship?.companyLogo || '/assets/images/download.png'}
              alt={`${(internship?.company?.name || internship?.company || '')} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {internship?.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {internship?.company?.name || internship?.company}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            iconName={isSaved ? 'Heart' : 'Heart'}
            className={isSaved ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}
          />
        </div>
      </div>
      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="MapPin" size={14} />
            <span>{internship?.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={14} />
            <span>{internship?.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="DollarSign" size={14} />
            <span>{formatStipend(internship?.stipend)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Icon name="Calendar" size={14} />
            <span>{t('card.applyBy', { date: new Date(internship.applicationDeadline)?.toLocaleDateString() })}</span>
          </div>
          {daysLeft <= 7 && (
            <div className="flex items-center space-x-1 text-warning">
              <Icon name="AlertTriangle" size={14} />
              <span className="font-medium">
                {daysLeft <= 0 ? t('card.deadlinePassed') : t('card.daysLeft', { count: daysLeft })}
              </span>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {internship?.requiredSkills?.slice(0, 4)?.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {skill}
            </span>
          ))}
          {internship?.requiredSkills?.length > 4 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              {t('card.moreSkills', { count: internship?.requiredSkills?.length - 4 })}
            </span>
          )}
        </div>

        {/* AI Reasoning */}
        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
          <div className="flex items-start space-x-2">
            <Icon name="Sparkles" size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">{t('card.aiReasoning')}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {internship?.aiReasoning}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Button
          variant="primary"
          size="sm"
          onClick={handleApply}
          loading={isApplying}
          disabled={daysLeft <= 0}
          iconName="ExternalLink"
          iconPosition="right"
          className="flex-1"
        >
          {daysLeft <= 0 ? t('card.deadlinePassedBtn') : t('card.applyNow')}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(internship)}
          iconName="Eye"
          iconPosition="left"
        >
          {t('card.details')}
        </Button>
        {/* New quick actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction?.(internship, 'under_review')}
          iconName="Eye"
        >
          {t('dashboard.recommendations.review')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction?.(internship, 'rejected')}
          iconName="XCircle"
        >
          {t('dashboard.recommendations.reject')}
        </Button>
      </div>
      {/* Company Rating */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)]?.map((_, i) => (
              <Icon
                key={i}
                name="Star"
                size={14}
                className={i < Math.floor(internship?.company?.rating) 
                  ? 'text-warning fill-current' :'text-muted-foreground'
                }
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {internship?.company?.rating} ({internship?.company?.reviewCount} {t('card.reviews')})
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          {t('card.postedAgo', { days: internship?.postedDaysAgo })}
        </div>
      </div>
    </div>
  );
};

export default InternshipCard;