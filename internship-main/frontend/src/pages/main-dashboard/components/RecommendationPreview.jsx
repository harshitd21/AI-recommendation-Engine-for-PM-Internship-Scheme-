import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import RecommendationFormModal from './RecommendationFormModal';
import { applicationsAPI } from '../../../services/api';
import { useTranslation } from 'react-i18next';

const RecommendationPreview = ({ recommendations = [], onViewAll, onRequestRecommendations }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Helper to choose badge color based on match %
  const badgeClass = (pct) => {
    if (pct >= 90) return 'bg-green-100 text-green-700';
    if (pct >= 75) return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const handleGetRecommendations = async (payload) => {
    try {
      setLoading(true);
      await onRequestRecommendations?.(payload);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (internship, status) => {
    if (!internship) return;
    try {
      await applicationsAPI.upsert({
        title: internship.title,
        company: internship.company?.name || internship.company,
        location: internship.location,
        duration: internship.duration,
        stipend: internship.stipend,
        applicationDeadline: internship.applicationDeadline,
        description: internship.description,
        status,
        sourceType: 'recommendation',
        sourceId: String(internship.id || `${internship.title}-${internship.company}`),
      });
      // Navigate to tracker so user can see it reflected immediately
      navigate('/application-tracker');
    } catch (e) {
      console.error('Failed to upsert application from dashboard recommendations', e);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">
            {t('dashboard.recommendations.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('dashboard.recommendations.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            iconName="Sparkles"
            iconPosition="left"
          >
            {t('dashboard.recommendations.get')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            iconName="ArrowRight"
            iconPosition="right"
          >
            {t('dashboard.recommendations.viewAll')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.slice(0, 3).map((internship) => (
          <div
            key={internship.id || `${internship.title}-${internship.company}`}
            className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-200"
          >
            {/* Company Logo or Placeholder */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <Image
                src={internship.companyLogo || '/default-company-logo.png'}
                alt={internship.company}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Internship Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {internship.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {internship.company} • {internship.location}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {internship.duration && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {internship.duration}
                    </span>
                  </div>
                )}
                {internship.stipend && (
                  <div className="flex items-center space-x-1">
                    <Icon name="DollarSign" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {internship.stipend}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions and Match Percentage */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="primary"
                size="xs"
                onClick={() => handleAction(internship, 'applied')}
                iconName="Send"
              >
                {t('dashboard.recommendations.apply')}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleAction(internship, 'under_review')}
                iconName="Eye"
              >
                {t('dashboard.recommendations.review')}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleAction(internship, 'rejected')}
                iconName="XCircle"
              >
                {t('dashboard.recommendations.reject')}
              </Button>
              {typeof internship.matchPercentage === 'number' && (
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(
                    internship.matchPercentage
                  )}`}
                >
                  {internship.matchPercentage}% {t('dashboard.recommendations.match')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t('dashboard.recommendations.emptyTitle')}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {t('dashboard.recommendations.emptyDesc')}
          </p>
          <Button variant="outline" size="sm" iconName="User" iconPosition="left">
            {t('dashboard.completeProfile')}
          </Button>
        </div>
      )}

      <RecommendationFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleGetRecommendations}
        loading={loading}
      />
    </div>
  );
};

export default RecommendationPreview;