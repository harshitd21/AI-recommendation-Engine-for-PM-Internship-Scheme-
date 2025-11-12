import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const InternshipDetailsModal = ({ internship, isOpen, onClose, onApply, onSave, onAction }) => {
  if (!isOpen || !internship) return null;

  const formatStipend = (amount) => {
    if (amount === 0) return 'Unpaid';
    if (amount >= 100000) return `₹${(amount / 100000)?.toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000)?.toFixed(0)}K`;
    return `₹${amount}`;
  };

  const getMatchColor = (percentage) => {
    const p = Number(percentage ?? 0);
    if (p >= 90) return 'text-success bg-success/10';
    if (p >= 75) return 'text-primary bg-primary/10';
    if (p >= 60) return 'text-warning bg-warning/10';
    return 'text-muted-foreground bg-muted';
  };

  const safeToLocaleDate = (value) => {
    if (!value) return 'Not specified';
    const d = new Date(value);
    return isNaN(d.getTime()) ? 'Not specified' : d.toLocaleDateString();
  };

  const requiredSkills = Array.isArray(internship?.requiredSkills) ? internship.requiredSkills : [];
  const qualifications = Array.isArray(internship?.qualifications) ? internship.qualifications : [];
  const benefits = Array.isArray(internship?.benefits) ? internship.benefits : [];
  const company = internship?.company || {};
  const companyRating = Number(company?.rating ?? 0);
  const companyReviews = Number(company?.reviewCount ?? 0);
  const companySize = company?.size || '—';
  const companyIndustry = company?.industry || '—';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-subtle z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <Image
                src={company?.logo}
                alt={`${company?.name || 'Company'} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{internship?.title}</h2>
              <p className="text-lg text-muted-foreground">{company?.name || '—'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(internship?.matchPercentage)}`}>
              {Number(internship?.matchPercentage ?? 0)}% match
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{internship?.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground">{internship?.duration || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon name="DollarSign" size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Stipend</p>
                  <p className="font-medium text-foreground">{formatStipend(Number(internship?.stipend ?? 0))}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium text-foreground">{safeToLocaleDate(internship?.applicationDeadline)}</p>
                </div>
              </div>
            </div>

            {/* AI Match Reasoning */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="Sparkles" size={20} className="text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Why This Matches You</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {internship?.aiReasoning}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">About This Internship</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="leading-relaxed whitespace-pre-line">
                  {internship?.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Requirements</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Qualifications</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {qualifications?.map((qualification, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Icon name="Check" size={16} className="text-success shrink-0 mt-0.5" />
                        <span>{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">About {company?.name || 'Company'}</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)]?.map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={16}
                        className={i < Math.floor(companyRating) 
                          ? 'text-warning fill-current' :'text-muted-foreground'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {companyRating} ({companyReviews} reviews)
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {company?.description || '—'}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={14} />
                    <span>{companySize} employees</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Building" size={14} />
                    <span>{companyIndustry}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            {benefits?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Benefits & Perks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {benefits?.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="Check" size={16} className="text-success shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onSave(internship?.id, true)}
              iconName="Heart"
              iconPosition="left"
            >
              Save for Later
            </Button>
            
            <Button
              variant="outline"
              iconName="Share"
              iconPosition="left"
            >
              Share
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            
            <Button
              variant="primary"
              onClick={() => onApply(internship?.id)}
              iconName="ExternalLink"
              iconPosition="right"
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction?.(internship, 'under_review')}
              iconName="Eye"
            >
              Review
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction?.(internship, 'rejected')}
              iconName="XCircle"
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailsModal;