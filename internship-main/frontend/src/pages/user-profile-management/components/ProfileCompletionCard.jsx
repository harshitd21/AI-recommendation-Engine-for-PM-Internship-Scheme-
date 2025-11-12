import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileCompletionCard = ({ profile, onSectionEdit }) => {
  const calculateCompletionPercentage = () => {
    let completed = 0;
    let total = 8;

    // Personal Details (2 points)
    if (profile?.fullName && profile?.email) completed += 1;
    if (profile?.phone && profile?.location) completed += 1;

    // Skills (2 points)
    if (profile?.techSkills && profile?.techSkills?.length > 0) completed += 1;
    if (profile?.softSkills && profile?.softSkills?.length > 0) completed += 1;

    // Education (2 points)
    if (profile?.education?.institution && profile?.education?.degree) completed += 1;
    if (profile?.education?.major && profile?.education?.graduationYear) completed += 1;

    // Preferences (1 point)
    if (profile?.preferences?.sectors && profile?.preferences?.sectors?.length > 0) completed += 1;

    // Resume (1 point)
    if (profile?.resume?.current) completed += 1;

    return Math.round((completed / total) * 100);
  };

  const getMissingItems = () => {
    const missing = [];

    if (!profile?.fullName || !profile?.email) {
      missing?.push({ section: 'personal', label: 'Complete basic personal information', icon: 'User' });
    }
    if (!profile?.phone || !profile?.location) {
      missing?.push({ section: 'personal', label: 'Add contact details and location', icon: 'MapPin' });
    }
    if (!profile?.techSkills || profile?.techSkills?.length === 0) {
      missing?.push({ section: 'skills', label: 'Add technical skills', icon: 'Code' });
    }
    if (!profile?.softSkills || profile?.softSkills?.length === 0) {
      missing?.push({ section: 'skills', label: 'Select soft skills', icon: 'Heart' });
    }
    if (!profile?.education?.institution || !profile?.education?.degree) {
      missing?.push({ section: 'education', label: 'Add educational background', icon: 'GraduationCap' });
    }
    if (!profile?.education?.major || !profile?.education?.graduationYear) {
      missing?.push({ section: 'education', label: 'Complete education details', icon: 'BookOpen' });
    }
    if (!profile?.preferences?.sectors || profile?.preferences?.sectors?.length === 0) {
      missing?.push({ section: 'preferences', label: 'Set internship preferences', icon: 'Target' });
    }
    if (!profile?.resume?.current) {
      missing?.push({ section: 'resume', label: 'Upload your resume', icon: 'FileText' });
    }

    return missing;
  };

  const completionPercentage = calculateCompletionPercentage();
  const missingItems = getMissingItems();
  const isComplete = completionPercentage === 100;

  const getCompletionColor = () => {
    if (completionPercentage >= 80) return 'text-success';
    if (completionPercentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getCompletionBgColor = () => {
    if (completionPercentage >= 80) return 'bg-success';
    if (completionPercentage >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isComplete ? 'bg-success/10' : 'bg-warning/10'
          }`}>
            <Icon 
              name={isComplete ? 'CheckCircle' : 'AlertCircle'} 
              size={20} 
              className={isComplete ? 'text-success' : 'text-warning'} 
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Profile Completion</h3>
            <p className="text-sm text-muted-foreground">
              {isComplete ? 'Your profile is complete!' : 'Complete your profile for better matches'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${getCompletionColor()}`}>
            {completionPercentage}%
          </div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getCompletionBgColor()}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      {/* Completion Status */}
      {isComplete ? (
        <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Trophy" size={20} className="text-success" />
            <h4 className="font-medium text-success">Profile Complete!</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Excellent! Your complete profile will help our AI provide you with the most relevant internship recommendations.
          </p>
        </div>
      ) : (
        <div>
          <h4 className="font-medium text-foreground mb-4">Complete these items to improve your matches:</h4>
          <div className="space-y-3">
            {missingItems?.slice(0, 4)?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Icon name={item?.icon} size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{item?.label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSectionEdit(item?.section)}
                  iconName="ChevronRight"
                />
              </div>
            ))}
            
            {missingItems?.length > 4 && (
              <div className="text-center pt-2">
                <span className="text-sm text-muted-foreground">
                  +{missingItems?.length - 4} more items to complete
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Impact Preview */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Zap" size={16} className="text-primary mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Recommendation Impact</p>
            <p>
              {completionPercentage >= 80 
                ? 'Your complete profile enables highly accurate AI matching with relevant internships.'
                : completionPercentage >= 60
                ? 'Good progress! Complete remaining sections for more precise recommendations.'
                : 'Complete more sections to unlock better internship matching and recommendations.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;