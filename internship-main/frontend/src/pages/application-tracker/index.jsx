import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/ui/Header';
import HelpDeskWidget from '../../components/ui/HelpDeskWidget';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import SearchAndFilters from './components/SearchAndFilters';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import { applicationsAPI } from '../../services/api';

const ApplicationTracker = () => {
  const [activeView, setActiveView] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    sortBy: 'date_desc',
    dateRange: 'all'
  });
  const [applications, setApplications] = useState([]);

  // Filter and search applications
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered?.filter(app =>
        app?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        app?.position?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Apply status filter
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(app => app?.status === filters?.status);
    }

    // Apply priority filter
    if (filters?.priority !== 'all') {
      filtered = filtered?.filter(app => app?.priority === filters?.priority);
    }

    // Apply date range filter
    if (filters?.dateRange !== 'all') {
      const cutoffDate = new Date();
      cutoffDate?.setDate(cutoffDate?.getDate() - parseInt(filters?.dateRange));
      filtered = filtered?.filter(app => new Date(app.appliedDate) >= cutoffDate);
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'date_asc':
          return new Date(a.appliedDate) - new Date(b.appliedDate);
        case 'date_desc':
          return new Date(b.appliedDate) - new Date(a.appliedDate);
        case 'company_asc':
          return a?.company?.localeCompare(b?.company);
        case 'company_desc':
          return b?.company?.localeCompare(a?.company);
        case 'priority_desc':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, searchQuery, filters]);

  const views = [
    { id: 'kanban', label: 'Kanban Board', icon: 'Columns' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ];

  const handleStatusUpdate = (applicationId, newStatus) => {
    setApplications(prev => prev?.map(app => app?.id === applicationId ? { ...app, status: newStatus } : app));
    applicationsAPI.update(applicationId, { status: newStatus }).catch(() => {
      // noop: optimistic update; could add rollback if desired
    });
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleUpdateApplication = (updatedApplication) => {
    setApplications(prev => prev?.map(app => app?.id === updatedApplication?.id ? updatedApplication : app));
    applicationsAPI.update(updatedApplication?.id, updatedApplication).catch(() => {
      // noop
    });
  };

  const handleDeleteApplication = (applicationId) => {
    setApplications(prev => prev?.filter(app => app?.id !== applicationId));
    setIsModalOpen(false);
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log(`Performing ${action} on applications:`, selectedIds);
    // Implement bulk actions here
  };

  const handleAddEvent = () => {
    console.log('Add new event');
    // Implement add event functionality
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    // Implement event click handling
  };

  // Set page title
  useEffect(() => {
    document.title = 'Application Tracker - InternGuide AI';
  }, []);

  // Load applications
  useEffect(() => {
    const load = async () => {
      try {
        const res = await applicationsAPI.list();
        const apps = (res?.applications || []).map(a => ({
          // normalize fields for UI
          ...a,
          id: a._id,
          position: a.title,
          salaryRange: a.stipend ? `₹${a.stipend}` : undefined,
        }));
        setApplications(apps);
      } catch (e) {
        console.error('Failed to load applications', e);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Application Tracker
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage your internship applications across multiple companies
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {applications?.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Applications
                </p>
              </div>
              
              <Button
                variant="primary"
                iconName="Plus"
                iconPosition="left"
                onClick={() => window.location.href = '/internship-recommendations'}
              >
                Add Application
              </Button>
            </div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex bg-muted rounded-lg p-1 w-fit">
            {views?.map((view) => (
              <button
                key={view?.id}
                onClick={() => setActiveView(view?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeView === view?.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={view?.icon} size={16} />
                <span>{view?.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            onBulkAction={handleBulkAction}
            selectedApplications={selectedApplications}
            totalApplications={filteredApplications?.length}
          />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-6 min-h-[600px]"
        >
          {activeView === 'kanban' && (
            <KanbanBoard
              applications={filteredApplications}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              applications={filteredApplications}
              onAddEvent={handleAddEvent}
              onEventClick={handleEventClick}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              applications={filteredApplications}
            />
          )}
        </motion.div>

        {/* Empty State */}
        {filteredApplications?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Icon name="Inbox" size={64} className="mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No applications found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || Object.values(filters)?.some(f => f !== 'all')
                ? 'Try adjusting your search or filters' :'Start by applying to internships from our recommendations'
              }
            </p>
            <Button
              variant="primary"
              iconName="Search"
              iconPosition="left"
              onClick={() => window.location.href = '/internship-recommendations'}
            >
              Find Internships
            </Button>
          </motion.div>
        )}
      </main>
      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateApplication}
        onDelete={handleDeleteApplication}
      />
      <HelpDeskWidget />
    </div>
  );
};

export default ApplicationTracker;