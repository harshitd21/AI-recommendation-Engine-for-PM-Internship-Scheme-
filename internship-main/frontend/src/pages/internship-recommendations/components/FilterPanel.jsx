import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useTranslation } from 'react-i18next';

const FilterPanel = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const { t } = useTranslation();

  const sectorOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'research', label: 'Research' }
  ];

  const locationOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'pune', label: 'Pune' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' }
  ];

  const durationOptions = [
    { value: '1-3', label: t('filters.duration.1_3') },
    { value: '3-6', label: t('filters.duration.3_6') },
    { value: '6-12', label: t('filters.duration.6_12') },
    { value: '12+', label: t('filters.duration.12_plus') }
  ];

  const stipendRanges = [
    { value: '0-10000', label: t('filters.stipend.r0_10') },
    { value: '10000-25000', label: t('filters.stipend.r10_25') },
    { value: '25000-50000', label: t('filters.stipend.r25_50') },
    { value: '50000+', label: t('filters.stipend.r50_plus') }
  ];

  const skillOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'react', label: 'React' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'java', label: 'Java' },
    { value: 'sql', label: 'SQL' },
    { value: 'aws', label: 'AWS' },
    { value: 'docker', label: 'Docker' }
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      sectors: [],
      locations: [],
      duration: '',
      stipendRange: '',
      skills: [],
      remoteOnly: false,
      immediateStart: false
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = Object.values(localFilters)?.filter(value => {
    if (Array.isArray(value)) return value?.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '';
  })?.length;

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          iconName="Filter"
          iconPosition="left"
          className="w-full"
        >
          {t('filters.toggle')} {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>
      {/* Filter Panel */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'} lg:block
        fixed lg:static inset-0 lg:inset-auto z-50 lg:z-auto
        bg-card lg:bg-transparent border-r lg:border-r-0 border-border
        w-80 lg:w-full h-full lg:h-auto overflow-y-auto lg:overflow-visible
        p-6 lg:p-0
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">{t('filters.title')}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            iconName="X"
          />
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">{t('filters.desktopTitle')}</h3>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-destructive hover:text-destructive"
            >
              {t('filters.clearAll')}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Sectors */}
          <div>
            <Select
              label={t('filters.labels.sectors')}
              placeholder={t('filters.placeholders.sectors')}
              multiple
              searchable
              clearable
              options={sectorOptions}
              value={localFilters?.sectors}
              onChange={(value) => handleFilterChange('sectors', value)}
            />
          </div>

          {/* Locations */}
          <div>
            <Select
              label={t('filters.labels.locations')}
              placeholder={t('filters.placeholders.locations')}
              multiple
              searchable
              clearable
              options={locationOptions}
              value={localFilters?.locations}
              onChange={(value) => handleFilterChange('locations', value)}
            />
          </div>

          {/* Duration */}
          <div>
            <Select
              label={t('filters.labels.duration')}
              placeholder={t('filters.placeholders.duration')}
              clearable
              options={durationOptions}
              value={localFilters?.duration}
              onChange={(value) => handleFilterChange('duration', value)}
            />
          </div>

          {/* Stipend Range */}
          <div>
            <Select
              label={t('filters.labels.stipendRange')}
              placeholder={t('filters.placeholders.stipendRange')}
              clearable
              options={stipendRanges}
              value={localFilters?.stipendRange}
              onChange={(value) => handleFilterChange('stipendRange', value)}
            />
          </div>

          {/* Skills */}
          <div>
            <Select
              label={t('filters.labels.skills')}
              placeholder={t('filters.placeholders.skills')}
              multiple
              searchable
              clearable
              options={skillOptions}
              value={localFilters?.skills}
              onChange={(value) => handleFilterChange('skills', value)}
            />
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">{t('filters.additionalOptions')}</h4>
            
            <Checkbox
              label={t('filters.remoteOnly')}
              checked={localFilters?.remoteOnly}
              onChange={(e) => handleFilterChange('remoteOnly', e?.target?.checked)}
            />
            
            <Checkbox
              label={t('filters.immediateStart')}
              checked={localFilters?.immediateStart}
              onChange={(e) => handleFilterChange('immediateStart', e?.target?.checked)}
            />
          </div>

          {/* Mobile Apply Button */}
          <div className="lg:hidden pt-6 border-t border-border">
            <Button
              variant="primary"
              fullWidth
              onClick={onToggle}
            >
              {t('filters.apply')} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-subtle z-40"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default FilterPanel;