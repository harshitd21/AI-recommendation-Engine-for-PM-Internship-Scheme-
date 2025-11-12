import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ComparisonModal = ({ internships, isOpen, onClose, onApply }) => {
  if (!isOpen || !internships || internships?.length === 0) return null;

  const formatStipend = (amount) => {
    if (amount === 0) return 'Unpaid';
    if (amount >= 100000) return `₹${(amount / 100000)?.toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000)?.toFixed(0)}K`;
    return `₹${amount}`;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 75) return 'text-primary';
    if (percentage >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const comparisonRows = [
    { label: 'Company', key: 'company' },
    { label: 'Match %', key: 'match' },
    { label: 'Location', key: 'location' },
    { label: 'Duration', key: 'duration' },
    { label: 'Stipend', key: 'stipend' },
    { label: 'Deadline', key: 'deadline' },
    { label: 'Rating', key: 'rating' },
    { label: 'Skills', key: 'skills' }
  ];

  const renderCellContent = (internship, key) => {
    switch (key) {
      case 'company':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded overflow-hidden bg-muted">
              <Image
                src={internship?.company?.logo}
                alt={`${internship?.company?.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium">{internship?.company?.name}</span>
          </div>
        );
      case 'match':
        return (
          <span className={`font-semibold ${getMatchColor(internship?.matchPercentage)}`}>
            {internship?.matchPercentage}%
                      </span>
        );
      case 'location':
        return internship?.location;
      case 'duration':
        return internship?.duration;
      case 'stipend':
        return formatStipend(internship?.stipend);
      case 'deadline':
        return new Date(internship.applicationDeadline)?.toLocaleDateString();
      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            <Icon name="Star" size={14} className="text-warning fill-current" />
            <span>{internship?.company?.rating}</span>
          </div>
        );
      case 'skills':
        return (
          <div className="flex flex-wrap gap-1">
            {internship?.requiredSkills?.slice(0, 3)?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {internship?.requiredSkills?.length > 3 && (
              <span className="px-2 py-1 bg-muted text-xs rounded">
                +{internship?.requiredSkills?.length - 3}
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-subtle z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            Compare Internships ({internships?.length})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Internship Headers */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${internships?.length}, 1fr)` }}>
              <div></div>
              {internships?.map((internship) => (
                <div key={internship?.id} className="text-center">
                  <h3 className="font-semibold text-foreground mb-2 truncate">
                    {internship?.title}
                  </h3>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApply(internship?.id)}
                    iconName="ExternalLink"
                    iconPosition="right"
                    fullWidth
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="space-y-4">
              {comparisonRows?.map((row) => (
                <div
                  key={row?.key}
                  className="grid gap-4 py-3 border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns: `200px repeat(${internships?.length}, 1fr)` }}
                >
                  <div className="font-medium text-foreground">
                    {row?.label}
                  </div>
                  {internships?.map((internship) => (
                    <div key={internship?.id} className="text-sm text-muted-foreground">
                      {renderCellContent(internship, row?.key)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* AI Reasoning Comparison */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">AI Match Reasoning</h3>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${internships?.length}, 1fr)` }}>
                {internships?.map((internship) => (
                  <div key={internship?.id} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Sparkles" size={16} className="text-primary" />
                      <span className="font-medium text-primary">
                        {internship?.matchPercentage}% Match
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {internship?.aiReasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;