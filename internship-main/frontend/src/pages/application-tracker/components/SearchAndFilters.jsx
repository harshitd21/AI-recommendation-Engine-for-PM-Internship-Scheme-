import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SearchAndFilters = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange, 
  onBulkAction,
  selectedApplications,
  totalApplications 
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'applied', label: 'Applied' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'offer_received', label: 'Offer Received' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'company_asc', label: 'Company A-Z' },
    { value: 'company_desc', label: 'Company Z-A' },
    { value: 'priority_desc', label: 'High Priority First' }
  ];

  const bulkActions = [
    { value: 'mark_reviewed', label: 'Mark as Reviewed', icon: 'Eye' },
    { value: 'set_priority', label: 'Set Priority', icon: 'Flag' },
    { value: 'add_note', label: 'Add Note', icon: 'MessageSquare' },
    { value: 'export', label: 'Export Selected', icon: 'Download' },
    { value: 'delete', label: 'Delete Selected', icon: 'Trash2', variant: 'destructive' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      sortBy: 'date_desc',
      dateRange: 'all'
    });
    onSearchChange('');
  };

  const hasActiveFilters = () => {
    return searchQuery || 
           filters?.status !== 'all' || 
           filters?.priority !== 'all' || 
           filters?.dateRange !== 'all';
  };

  return (
    <div className="space-y-4">
      {/* Main Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Filters */}
          <div className="hidden md:flex items-center space-x-2">
            <Select
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => handleFilterChange('status', value)}
              placeholder="Status"
              className="w-40"
            />
            
            <Select
              options={sortOptions}
              value={filters?.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              placeholder="Sort by"
              className="w-40"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filters Toggle */}
          <Button
            variant={isFiltersOpen ? "primary" : "outline"}
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            iconName="Filter"
            iconPosition="left"
          >
            Filters
            {hasActiveFilters() && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters)?.filter(v => v !== 'all')?.length + (searchQuery ? 1 : 0)}
              </span>
            )}
          </Button>

          {/* Bulk Actions Toggle */}
          {selectedApplications?.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
              iconName="MoreHorizontal"
              iconPosition="left"
            >
              Actions ({selectedApplications?.length})
            </Button>
          )}

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              iconName="X"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-lg p-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Status"
                options={statusOptions}
                value={filters?.status}
                onChange={(value) => handleFilterChange('status', value)}
              />
              
              <Select
                label="Priority"
                options={priorityOptions}
                value={filters?.priority}
                onChange={(value) => handleFilterChange('priority', value)}
              />
              
              <Select
                label="Date Range"
                options={[
                  { value: 'all', label: 'All Time' },
                  { value: '7', label: 'Last 7 Days' },
                  { value: '30', label: 'Last 30 Days' },
                  { value: '90', label: 'Last 3 Months' }
                ]}
                value={filters?.dateRange}
                onChange={(value) => handleFilterChange('dateRange', value)}
              />
              
              <Select
                label="Sort By"
                options={sortOptions}
                value={filters?.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
              />
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {totalApplications} applications
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersOpen(false)}
                iconName="ChevronUp"
              >
                Collapse
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bulk Actions Panel */}
      <AnimatePresence>
        {showBulkActions && selectedApplications?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-secondary/10 border border-secondary/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">
                  {selectedApplications?.length} applications selected
                </span>
                <div className="flex items-center space-x-2">
                  {bulkActions?.map((action) => (
                    <Button
                      key={action?.value}
                      variant={action?.variant || "outline"}
                      size="sm"
                      onClick={() => onBulkAction(action?.value, selectedApplications)}
                      iconName={action?.icon}
                      iconPosition="left"
                    >
                      {action?.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkActions(false)}
                iconName="X"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Results Summary */}
      {(searchQuery || hasActiveFilters()) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {searchQuery && `Searching for "${searchQuery}"`}
            {searchQuery && hasActiveFilters() && " with filters applied"}
            {!searchQuery && hasActiveFilters() && "Filters applied"}
          </span>
          <span>{totalApplications} results found</span>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;