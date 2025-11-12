import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const KanbanBoard = ({ applications, onStatusUpdate, onViewDetails }) => {
  const [draggedItem, setDraggedItem] = useState(null);

  const columns = [
    { id: 'applied', title: 'Applied', color: 'bg-blue-100 border-blue-200', count: 0 },
    { id: 'under_review', title: 'Under Review', color: 'bg-yellow-100 border-yellow-200', count: 0 },
    { id: 'interview_scheduled', title: 'Interview Scheduled', color: 'bg-purple-100 border-purple-200', count: 0 },
    { id: 'offer_received', title: 'Offer Received', color: 'bg-green-100 border-green-200', count: 0 },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-100 border-red-200', count: 0 }
  ];

  // Count applications by status
  columns?.forEach(column => {
    column.count = applications?.filter(app => app?.status === column?.id)?.length;
  });

  const handleDragStart = (e, application) => {
    setDraggedItem(application);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e?.preventDefault();
    if (draggedItem && draggedItem?.status !== newStatus) {
      onStatusUpdate(draggedItem?.id, newStatus);
    }
    setDraggedItem(null);
  };

  const getStatusIcon = (status) => {
    const icons = {
      applied: 'Send',
      under_review: 'Eye',
      interview_scheduled: 'Calendar',
      offer_received: 'CheckCircle',
      rejected: 'XCircle'
    };
    return icons?.[status] || 'FileText';
  };

  const getNextAction = (application) => {
    const actions = {
      applied: 'Wait for response',
      under_review: 'Prepare for next round',
      interview_scheduled: `Interview on ${new Date(application.interviewDate)?.toLocaleDateString()}`,
      offer_received: 'Review offer details',
      rejected: 'Apply to similar roles'
    };
    return actions?.[application?.status] || 'No action required';
  };

  const ApplicationCard = ({ application }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      draggable
      onDragStart={(e) => handleDragStart(e, application)}
      className="bg-card border border-border rounded-lg p-4 cursor-move hover:shadow-elevation-2 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground text-sm mb-1">
            {application?.position}
          </h4>
          <p className="text-muted-foreground text-xs mb-2">
            {application?.company}
          </p>
        </div>
        <Icon 
          name={getStatusIcon(application?.status)} 
          size={16} 
          className="text-muted-foreground flex-shrink-0" 
        />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Icon name="Calendar" size={12} className="mr-1" />
          <span>Applied: {new Date(application.appliedDate)?.toLocaleDateString()}</span>
        </div>
        
        {application?.deadline && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Icon name="Clock" size={12} className="mr-1" />
            <span>Deadline: {new Date(application.deadline)?.toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="bg-muted rounded-md p-2 mb-3">
        <p className="text-xs text-muted-foreground">Next Action:</p>
        <p className="text-xs font-medium text-foreground">
          {getNextAction(application)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className={`inline-block w-2 h-2 rounded-full ${
            application?.priority === 'high' ? 'bg-red-500' :
            application?.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`}></span>
          <span className="text-xs text-muted-foreground capitalize">
            {application?.priority} priority
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onViewDetails(application)}
          iconName="ExternalLink"
          className="text-xs"
        >
          View
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-full">
        {columns?.map((column) => (
          <div
            key={column?.id}
            className={`${column?.color} rounded-lg p-4 flex flex-col h-full min-h-0`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column?.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">
                {column?.title}
              </h3>
              <span className="bg-card text-foreground text-xs px-2 py-1 rounded-full font-medium">
                {column?.count}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              <AnimatePresence>
                {applications?.filter(app => app?.status === column?.id)?.map((application) => (
                    <ApplicationCard
                      key={application?.id}
                      application={application}
                    />
                  ))}
              </AnimatePresence>
              
              {applications?.filter(app => app?.status === column?.id)?.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Inbox" size={32} className="mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-xs text-muted-foreground">No applications</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;