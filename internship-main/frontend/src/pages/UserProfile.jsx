import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Fetch user data from backend
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchUserData} iconName="RefreshCw" iconPosition="left">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-lg border border-border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {userData?.firstName} {userData?.lastName}
                </h1>
                <p className="text-muted-foreground">{userData?.email}</p>
                <p className="text-sm text-muted-foreground">{userData?.university}</p>
              </div>
            </div>
            
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              iconName={isEditing ? "X" : "Edit"}
              iconPosition="left"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Phone</h3>
              <p className="text-foreground">{userData?.phone || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
              <p className="text-foreground">{userData?.location || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Year of Study</h3>
              <p className="text-foreground">{userData?.yearOfStudy || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Major</h3>
              <p className="text-foreground">{userData?.major || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-card rounded-lg border border-border p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Skills</h2>
          
          {userData?.skills && userData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No skills added yet</p>
          )}
        </div>

        {/* Experience Section */}
        <div className="bg-card rounded-lg border border-border p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Experience</h2>
          
          {userData?.experience && userData.experience.length > 0 ? (
            <div className="space-y-6">
              {userData.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <h3 className="font-semibold text-foreground">{exp.title}</h3>
                  <p className="text-primary font-medium">{exp.company}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                  {exp.description && (
                    <p className="text-muted-foreground">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No experience added yet</p>
          )}
        </div>

        {/* Education Section */}
        <div className="bg-card rounded-lg border border-border p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Education</h2>
          
          {userData?.education && userData.education.length > 0 ? (
            <div className="space-y-4">
              {userData.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                  <p className="text-primary font-medium">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.startYear} - {edu.endYear || 'Present'}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-foreground">{userData?.university}</h3>
              <p className="text-primary font-medium">{userData?.major}</p>
              <p className="text-sm text-muted-foreground">{userData?.yearOfStudy}</p>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="bg-card rounded-lg border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">About Me</h2>
          
          {userData?.bio ? (
            <p className="text-muted-foreground leading-relaxed">{userData.bio}</p>
          ) : (
            <p className="text-muted-foreground">No bio added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
