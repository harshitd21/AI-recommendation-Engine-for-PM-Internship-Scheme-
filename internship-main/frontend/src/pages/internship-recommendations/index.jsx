import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import HelpDeskWidget from '../../components/ui/HelpDeskWidget';
import FilterPanel from './components/FilterPanel';
import SortControls from './components/SortControls';
import InternshipCard from './components/InternshipCard';
import InternshipDetailsModal from './components/InternshipDetailsModal';
import BulkActions from './components/BulkActions';
import ComparisonModal from './components/ComparisonModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { applicationsAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

const InternshipRecommendations = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    sectors: [],
    locations: [],
    duration: '',
    stipendRange: '',
    skills: [],
    remoteOnly: false,
    immediateStart: false
  });
  const [sortBy, setSortBy] = useState('match');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInternships, setSelectedInternships] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allInternships, setAllInternships] = useState([]);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'}/internships/discover`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data?.internships) {
          setAllInternships(data.internships);
          setInternships(data.internships);
        }
      } catch (e) {
        console.error('Failed to load discover internships', e);
      }
    };
    fetchDiscover();
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Apply filters to internships
    applyFiltersAndSort(newFilters, sortBy, sortOrder);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    applyFiltersAndSort(filters, newSortBy, newSortOrder);
  };

  const applyFiltersAndSort = (currentFilters, currentSortBy, currentSortOrder) => {
  let filteredInternships = [...allInternships];

    // Apply filters
    if (currentFilters?.sectors?.length > 0) {
      filteredInternships = filteredInternships?.filter(internship =>
        currentFilters?.sectors?.some(sector => 
          internship?.company?.industry?.toLowerCase()?.includes(sector?.toLowerCase())
        )
      );
    }

    if (currentFilters?.locations?.length > 0) {
      filteredInternships = filteredInternships?.filter(internship =>
        currentFilters?.locations?.includes(internship?.location?.toLowerCase())
      );
    }

    if (currentFilters?.duration) {
      filteredInternships = filteredInternships?.filter(internship => {
        const duration = internship?.duration?.toLowerCase();
        switch (currentFilters?.duration) {
          case '1-3': return duration?.includes('1') || duration?.includes('2') || duration?.includes('3');
          case '3-6': return duration?.includes('3') || duration?.includes('4') || duration?.includes('5') || duration?.includes('6');
          case '6-12': return duration?.includes('6') || duration?.includes('12');
          case '12+': return duration?.includes('12');
          default: return true;
        }
      });
    }

    if (currentFilters?.stipendRange) {
      filteredInternships = filteredInternships?.filter(internship => {
        const stipend = internship?.stipend;
        switch (currentFilters?.stipendRange) {
          case '0-10000': return stipend >= 0 && stipend <= 10000;
          case '10000-25000': return stipend > 10000 && stipend <= 25000;
          case '25000-50000': return stipend > 25000 && stipend <= 50000;
          case '50000+': return stipend > 50000;
          default: return true;
        }
      });
    }

    if (currentFilters?.skills?.length > 0) {
      filteredInternships = filteredInternships?.filter(internship =>
        currentFilters?.skills?.some(skill =>
          internship?.requiredSkills?.some(reqSkill =>
            reqSkill?.toLowerCase()?.includes(skill?.toLowerCase())
          )
        )
      );
    }

    if (currentFilters?.remoteOnly) {
      filteredInternships = filteredInternships?.filter(internship =>
        internship?.location?.toLowerCase()?.includes('remote')
      );
    }

    // Apply sorting
    filteredInternships?.sort((a, b) => {
      let aValue, bValue;
      
      switch (currentSortBy) {
        case 'match':
          aValue = a?.matchPercentage;
          bValue = b?.matchPercentage;
          break;
        case 'deadline':
          aValue = new Date(a.applicationDeadline);
          bValue = new Date(b.applicationDeadline);
          break;
        case 'stipend':
          aValue = a?.stipend;
          bValue = b?.stipend;
          break;
        case 'rating':
          aValue = a?.company?.rating;
          bValue = b?.company?.rating;
          break;
        case 'posted':
          aValue = a?.postedDaysAgo;
          bValue = b?.postedDaysAgo;
          break;
        default:
          return 0;
      }

      if (currentSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  setInternships(filteredInternships);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'}/internships/discover`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data?.internships) {
        setAllInternships(data.internships);
        // Re-apply current filters and sorting on fresh data
        const prevAll = data.internships;
        let filtered = [...prevAll];
        // reuse logic via function
        setInternships(filtered);
        applyFiltersAndSort(filters, sortBy, sortOrder);
      }
    } catch (e) {
      console.error('Failed to refresh internships', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApply = async (internshipId) => {
    const item = internships.find(i => i.id === internshipId);
    if (item) {
      try {
        await applicationsAPI.upsert({
          title: item.title,
          company: item.company?.name || item.company,
          location: item.location,
          duration: item.duration,
          stipend: item.stipend,
          applicationDeadline: item.applicationDeadline,
          description: item.description,
          status: 'applied',
          sourceType: 'csv',
          sourceId: String(item.id),
        });
      } catch (e) {
        console.error('Failed to save application', e);
      }
    }
    navigate('/application-tracker');
  };

  const handleSave = async (internshipId, isSaved) => {
    setInternships(prev => prev?.map(internship =>
      internship?.id === internshipId
        ? { ...internship, isSaved }
        : internship
    ));
  };

  const handleViewDetails = (internship) => {
    setSelectedInternship(internship);
    setIsDetailsModalOpen(true);
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
        sourceType: 'csv',
        sourceId: String(internship.id),
      });
      navigate('/application-tracker');
    } catch (e) {
      console.error('Failed to upsert application', e);
    }
  };

  const handleInternshipSelect = (internshipId) => {
    setSelectedInternships(prev => {
      if (prev?.includes(internshipId)) {
        return prev?.filter(id => id !== internshipId);
      } else {
        return [...prev, internshipId];
      }
    });
  };

  const handleBulkSave = async (internshipIds) => {
    setInternships(prev => prev?.map(internship =>
      internshipIds?.includes(internship?.id)
        ? { ...internship, isSaved: true }
        : internship
    ));
    setSelectedInternships([]);
  };

  const handleBulkCompare = (internshipIds) => {
    const selectedInternshipData = internships?.filter(internship =>
      internshipIds?.includes(internship?.id)
    );
    setSelectedInternship(selectedInternshipData);
    setIsComparisonModalOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedInternships([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <button
              onClick={() => navigate('/main-dashboard')}
              className="hover:text-foreground transition-colors duration-200"
            >
              {t('nav.dashboard')}
            </button>
            <Icon name="ChevronRight" size={16} />
            <span>{t('recommend.title')}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('recommend.heading')}
              </h1>
              <p className="text-muted-foreground">
                {t('recommend.subtitle')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/user-profile-management')}
                iconName="Settings"
                iconPosition="left"
              >
                {t('recommend.updatePreferences')}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-80 shrink-0">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={isFilterPanelOpen}
              onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Controls */}
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {t('recommend.showingCount', { count: internships?.length || 0 })}
                {Object.values(filters)?.some(value => 
                  Array.isArray(value) ? value?.length > 0 : value
                ) && ` (${t('recommend.filtered')})`}
              </div>
              
              {selectedInternships?.length > 0 && (
                <div className="text-sm text-primary">
                  {t('recommend.selectedForComparison', { count: selectedInternships?.length })}
                </div>
              )}
            </div>

            {/* Internship Cards */}
            {internships?.length > 0 ? (
              <div className="space-y-6">
                {internships?.map((internship) => (
                  <div key={internship?.id} className="relative">
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedInternships?.includes(internship?.id)}
                        onChange={() => handleInternshipSelect(internship?.id)}
                        className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
                      />
                    </div>
                    
                    <div className="pl-10">
                      <InternshipCard
                        internship={internship}
                        onApply={handleApply}
                        onSave={handleSave}
                        onViewDetails={handleViewDetails}
                        onAction={handleAction}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('recommend.noResultsTitle')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('recommend.noResultsDesc')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleFiltersChange({
                    sectors: [],
                    locations: [],
                    duration: '',
                    stipendRange: '',
                    skills: [],
                    remoteOnly: false,
                    immediateStart: false
                  })}
                >
                  {t('recommend.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modals and Widgets */}
      <InternshipDetailsModal
        internship={selectedInternship}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedInternship(null);
        }}
        onApply={handleApply}
        onSave={handleSave}
        onAction={handleAction}
      />
      <ComparisonModal
        internships={Array.isArray(selectedInternship) ? selectedInternship : []}
        isOpen={isComparisonModalOpen}
        onClose={() => {
          setIsComparisonModalOpen(false);
          setSelectedInternship(null);
        }}
        onApply={handleApply}
      />
      <BulkActions
        selectedInternships={selectedInternships}
        onBulkSave={handleBulkSave}
        onBulkCompare={handleBulkCompare}
        onClearSelection={handleClearSelection}
      />
      <HelpDeskWidget />
    </div>
  );
};

export default InternshipRecommendations;