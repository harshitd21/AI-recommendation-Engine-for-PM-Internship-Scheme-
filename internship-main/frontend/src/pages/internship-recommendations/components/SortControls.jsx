import React from 'react';

import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';

const SortControls = ({ sortBy, sortOrder, onSortChange, onRefresh, isRefreshing }) => {
  const { t } = useTranslation();
  const sortOptions = [
    { value: 'match', label: t('sort.match') },
    { value: 'deadline', label: t('sort.deadline') },
    { value: 'stipend', label: t('sort.stipend') },
    { value: 'rating', label: t('sort.rating') },
    { value: 'posted', label: t('sort.posted') }
  ];

  const handleSortByChange = (value) => {
    onSortChange(value, sortOrder);
  };

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newOrder);
  };

  const getSortOrderIcon = () => {
    return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getSortOrderLabel = () => {
    const labels = {
      match: sortOrder === 'desc' ? t('sort.highestFirst') : t('sort.lowestFirst'),
      deadline: sortOrder === 'asc' ? t('sort.earliestFirst') : t('sort.latestFirst'),
      stipend: sortOrder === 'desc' ? t('sort.highestFirst') : t('sort.lowestFirst'),
      rating: sortOrder === 'desc' ? t('sort.highestFirst') : t('sort.lowestFirst'),
      posted: sortOrder === 'desc' ? t('sort.newestFirst') : t('sort.oldestFirst')
    };
    return labels?.[sortBy] || '';
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none min-w-0 sm:min-w-48">
          <Select
            placeholder={t('sort.placeholder')}
            options={sortOptions}
            value={sortBy}
            onChange={handleSortByChange}
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSortOrderToggle}
          iconName={getSortOrderIcon()}
          iconPosition="left"
          className="shrink-0"
        >
          <span className="hidden sm:inline">{getSortOrderLabel()}</span>
          <span className="sm:hidden">
            {sortOrder === 'asc' ? t('sort.lowHigh') : t('sort.highLow')}
          </span>
        </Button>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          iconName={isRefreshing ? 'Loader2' : 'RefreshCw'}
          iconPosition="left"
          className={isRefreshing ? 'animate-spin' : ''}
        >
          <span className="hidden sm:inline">
            {isRefreshing ? t('sort.refreshing') : t('sort.refreshResults')}
          </span>
          <span className="sm:hidden">
            {isRefreshing ? t('sort.refreshing') : t('sort.refresh')}
          </span>
        </Button>

        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {t('sort.updatedAgo', { minutes: 2 })}
        </div>
      </div>
    </div>
  );
};

export default SortControls;