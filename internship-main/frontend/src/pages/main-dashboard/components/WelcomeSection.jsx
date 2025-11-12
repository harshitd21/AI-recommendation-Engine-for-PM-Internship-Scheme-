import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';

const WelcomeSection = ({ userName, profileCompletion, onCompleteProfile }) => {
  const { t } = useTranslation();
  const currentHour = new Date()?.getHours();
  const getGreeting = () => {
    if (currentHour < 12) return t('dashboard.greeting.morning');
    if (currentHour < 17) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-white/90 mb-4">
            {t('dashboard.readyToDiscover')}
          </p>
          
          {profileCompletion < 100 && (
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('dashboard.profileCompletion')}</span>
                <span className="text-sm">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onCompleteProfile}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                iconName="User"
                iconPosition="left"
              >
                {t('dashboard.completeProfile')}
              </Button>
            </div>
          )}
        </div>
        
        <div className="hidden md:block">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="Briefcase" size={40} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;