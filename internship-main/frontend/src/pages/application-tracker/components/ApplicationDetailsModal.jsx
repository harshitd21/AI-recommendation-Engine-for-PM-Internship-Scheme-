import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ApplicationDetailsModal = ({ application, isOpen, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedApplication, setEditedApplication] = useState(application || {});
  const [activeTab, setActiveTab] = useState('details');

  if (!application) return null;

  const statusOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'offer_received', label: 'Offer Received' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const tabs = [
    { id: 'details', label: 'Details', icon: 'FileText' },
    { id: 'timeline', label: 'Timeline', icon: 'Clock' },
    { id: 'notes', label: 'Notes', icon: 'MessageSquare' },
    { id: 'documents', label: 'Documents', icon: 'Paperclip' }
  ];

  const handleSave = () => {
    onUpdate(editedApplication);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedApplication(application);
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      offer_received: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const timelineEvents = [
    {
      id: 1,
      type: 'applied',
      title: 'Application Submitted',
      description: 'Successfully submitted application through company portal',
      date: application?.appliedDate,
      icon: 'Send'
    },
    {
      id: 2,
      type: 'status_update',
      title: 'Application Under Review',
      description: 'HR team is reviewing your application',
      date: application?.reviewDate,
      icon: 'Eye'
    },
    {
      id: 3,
      type: 'interview',
      title: 'Interview Scheduled',
      description: 'Technical interview scheduled with the engineering team',
      date: application?.interviewDate,
      icon: 'Calendar'
    }
  ]?.filter(event => event?.date);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-subtle"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Building" size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {application?.position}
                  </h2>
                  <p className="text-muted-foreground">{application?.company}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application?.status)}`}>
                  {application?.status?.replace('_', ' ')}
                </span>
                
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    iconName="Edit"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  iconName="X"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex space-x-8 px-6">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200 ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span className="font-medium">{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Application Details</h3>
                      
                      {isEditing ? (
                        <div className="space-y-4">
                          <Input
                            label="Company"
                            value={editedApplication?.company}
                            onChange={(e) => setEditedApplication({
                              ...editedApplication,
                              company: e?.target?.value
                            })}
                          />
                          
                          <Input
                            label="Position"
                            value={editedApplication?.position}
                            onChange={(e) => setEditedApplication({
                              ...editedApplication,
                              position: e?.target?.value
                            })}
                          />
                          
                          <Select
                            label="Status"
                            options={statusOptions}
                            value={editedApplication?.status}
                            onChange={(value) => setEditedApplication({
                              ...editedApplication,
                              status: value
                            })}
                          />
                          
                          <Select
                            label="Priority"
                            options={priorityOptions}
                            value={editedApplication?.priority}
                            onChange={(value) => setEditedApplication({
                              ...editedApplication,
                              priority: value
                            })}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Company</label>
                            <p className="text-foreground">{application?.company}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Position</label>
                            <p className="text-foreground">{application?.position}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Location</label>
                            <p className="text-foreground">{application?.location}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Salary Range</label>
                            <p className="text-foreground">{application?.salaryRange}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Important Dates</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                          <p className="text-foreground">
                            {new Date(application.appliedDate)?.toLocaleDateString()}
                          </p>
                        </div>
                        
                        {application?.deadline && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                            <p className="text-foreground">
                              {new Date(application.deadline)?.toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        {application?.interviewDate && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Interview Date</label>
                            <p className="text-foreground">
                              {new Date(application.interviewDate)?.toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        {application?.followUpDate && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Follow-up Date</label>
                            <p className="text-foreground">
                              {new Date(application.followUpDate)?.toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Job Description</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-foreground whitespace-pre-wrap">
                        {application?.description || 'No job description available.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Application Timeline</h3>
                  
                  <div className="space-y-4">
                    {timelineEvents?.map((event, index) => (
                      <div key={event?.id} className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name={event?.icon} size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">{event?.title}</h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.date)?.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">
                            {event?.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Plus"
                      iconPosition="left"
                    >
                      Add Note
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {application?.notes?.map((note, index) => (
                      <div key={index} className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            {note?.author || 'You'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(note.date)?.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground">{note?.content}</p>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground">No notes added yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Documents</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Upload"
                      iconPosition="left"
                    >
                      Upload Document
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application?.documents?.map((doc, index) => (
                      <div key={index} className="bg-muted rounded-lg p-4 flex items-center space-x-3">
                        <Icon name="FileText" size={24} className="text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{doc?.name}</p>
                          <p className="text-sm text-muted-foreground">{doc?.size}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Download"
                        />
                      </div>
                    )) || (
                      <div className="col-span-2 text-center py-8">
                        <Icon name="Paperclip" size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground">No documents uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(application?.id)}
                iconName="Trash2"
                iconPosition="left"
              >
                Delete Application
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="ExternalLink"
                  iconPosition="left"
                >
                  View Job Posting
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  iconName="Send"
                  iconPosition="left"
                >
                  Send Follow-up
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationDetailsModal;