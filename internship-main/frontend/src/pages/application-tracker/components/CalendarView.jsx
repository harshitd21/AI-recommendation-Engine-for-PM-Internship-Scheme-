import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Button from '../../../components/ui/Button';

const CalendarView = ({ applications, onAddEvent, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const currentMonth = currentDate?.getMonth();
  const currentYear = currentDate?.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth?.getDay();
  const daysInMonth = lastDayOfMonth?.getDate();

  // Generate calendar events from applications
  const events = applications?.reduce((acc, app) => {
    // Add application deadline
    if (app?.deadline) {
      const deadlineDate = new Date(app.deadline)?.toDateString();
      if (!acc?.[deadlineDate]) acc[deadlineDate] = [];
      acc?.[deadlineDate]?.push({
        id: `deadline-${app?.id}`,
        type: 'deadline',
        title: `${app?.company} - Deadline`,
        application: app,
        color: 'bg-red-500'
      });
    }

    // Add interview date
    if (app?.interviewDate) {
      const interviewDate = new Date(app.interviewDate)?.toDateString();
      if (!acc?.[interviewDate]) acc[interviewDate] = [];
      acc?.[interviewDate]?.push({
        id: `interview-${app?.id}`,
        type: 'interview',
        title: `${app?.company} - Interview`,
        application: app,
        color: 'bg-purple-500'
      });
    }

    // Add follow-up dates
    if (app?.followUpDate) {
      const followUpDate = new Date(app.followUpDate)?.toDateString();
      if (!acc?.[followUpDate]) acc[followUpDate] = [];
      acc?.[followUpDate]?.push({
        id: `followup-${app?.id}`,
        type: 'followup',
        title: `${app?.company} - Follow Up`,
        application: app,
        color: 'bg-blue-500'
      });
    }

    return acc;
  }, {});

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate?.setMonth(prev?.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (day) => {
    return today?.getDate() === day && 
           today?.getMonth() === currentMonth && 
           today?.getFullYear() === currentYear;
  };

  const getDayEvents = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return events?.[date?.toDateString()] || [];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-foreground">
            {monthNames?.[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
              iconName="ChevronLeft"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
              iconName="ChevronRight"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Deadlines</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-muted-foreground">Interviews</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Follow-ups</span>
            </div>
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddEvent()}
            iconName="Plus"
            iconPosition="left"
          >
            Add Event
          </Button>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays?.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 flex-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayWeekday }, (_, index) => (
            <div key={`empty-${index}`} className="border-r border-b border-border p-2 bg-muted/30">
            </div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dayEvents = getDayEvents(day);
            const isCurrentDay = isToday(day);

            return (
              <motion.div
                key={day}
                className={`border-r border-b border-border p-2 min-h-[120px] cursor-pointer hover:bg-muted/50 transition-colors duration-200 ${
                  isCurrentDay ? 'bg-primary/10' : ''
                }`}
                onClick={() => setSelectedDate(day)}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentDay 
                    ? 'text-primary font-semibold' :'text-foreground'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents?.slice(0, 3)?.map((event) => (
                    <motion.div
                      key={event?.id}
                      className={`${event?.color} text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity duration-200`}
                      onClick={(e) => {
                        e?.stopPropagation();
                        onEventClick(event);
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="truncate font-medium">
                        {event?.title}
                      </div>
                    </motion.div>
                  ))}
                  
                  {dayEvents?.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{dayEvents?.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Upcoming Events Sidebar */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(events)?.filter(([dateStr]) => new Date(dateStr) >= today)?.sort(([a], [b]) => new Date(a) - new Date(b))?.slice(0, 6)?.map(([dateStr, dayEvents]) => (
              <div key={dateStr} className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-medium text-foreground mb-2">
                  {new Date(dateStr)?.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="space-y-2">
                  {dayEvents?.map((event) => (
                    <div
                      key={event?.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-muted rounded p-1 transition-colors duration-200"
                      onClick={() => onEventClick(event)}
                    >
                      <div className={`w-2 h-2 rounded-full ${event?.color}`}></div>
                      <span className="text-sm text-foreground truncate">
                        {event?.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;