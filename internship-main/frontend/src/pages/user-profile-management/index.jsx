import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import HelpDeskWidget from '../../components/ui/HelpDeskWidget';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PersonalDetailsSection from './components/PersonalDetailsSection';
import SkillsSection from './components/SkillsSection';
import EducationSection from './components/EducationSection';
import PreferencesSection from './components/PreferencesSection';
import ResumeSection from './components/ResumeSection';
import ProfileCompletionCard from './components/ProfileCompletionCard';
import PrivacySettingsSection from './components/PrivacySettingsSection';
import { userAPI, skillsAPI } from '../../services/api';

const UserProfileManagement = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [editingSections, setEditingSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Profile schema is backed by backend user.profile { education, skills, sector, location }

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/user-login');
      return;
    }
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const res = await userAPI.getProfile();
        if (res?.user) {
          const u = res.user;
          // Fetch separate skills doc
          let separateSkills = { techSkills: [], softSkills: [] };
          try {
            const sk = await skillsAPI.get();
            if (sk?.skills) separateSkills = { techSkills: sk.skills.techSkills || [], softSkills: sk.skills.softSkills || [] };
          } catch {}
          // Map backend profile into UI shape, keeping extra fields optional
          setProfile({
            fullName: u?.name,
            email: u?.email,
            location: u?.profile?.location || '',
            techSkills: Array.isArray(separateSkills.techSkills) && separateSkills.techSkills.length > 0 ? separateSkills.techSkills : (Array.isArray(u?.profile?.skills) ? u.profile.skills : []),
            softSkills: Array.isArray(separateSkills.softSkills) ? separateSkills.softSkills : [],
            education: {
              institution: u?.profile?.education || '',
              degree: '',
              major: '',
              graduationYear: '',
              cgpa: '',
              maxCgpa: '',
              coursework: []
            },
            preferences: {
              sectors: u?.profile?.sector ? [u.profile.sector] : [],
              locations: u?.profile?.location ? [u.profile.location] : [],
              workType: '',
              duration: '',
              salary: ''
            },
            resume: { current: null },
            privacy: {}
          });
          setLastUpdated(new Date()?.toISOString());
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSectionUpdate = async (section, data) => {
    // Persist changes to backend profile model fields
    try {
      let update = {};
      if (section === 'personalDetails') {
        update.location = data?.location || '';
        if (typeof data?.fullName === 'string' && data.fullName) {
          // name is on root user model in backend; optionally handle later
        }
      }
      if (section === 'skills') {
        const tech = Array.isArray(data?.techSkills) ? data.techSkills : [];
        update.skills = tech;
      }
      if (section === 'education') {
        update.education = data?.institution || '';
      }
      if (section === 'preferences') {
        update.sector = Array.isArray(data?.sectors) && data.sectors[0] ? data.sectors[0] : '';
        if (Array.isArray(data?.locations) && data.locations[0]) {
          update.location = data.locations[0];
        }
      }
      const res = await userAPI.updateProfile(update);
      // Also save separate skills document when skills section updates
      if (section === 'skills') {
        try { await skillsAPI.save({ techSkills: update.skills, softSkills: Array.isArray(data?.softSkills) ? data.softSkills : [] }); } catch {}
      }
      if (res?.user) {
        // reflect backend response to local UI model
        setProfile(prev => ({
          ...prev,
          ...(section === 'personalDetails' ? { location: update.location } : {}),
          ...(section === 'skills' ? { techSkills: update.skills } : {}),
          ...(section === 'education' ? { education: { ...prev.education, institution: update.education } } : {}),
          ...(section === 'preferences' ? { preferences: { ...prev.preferences, sectors: update.sector ? [update.sector] : [], locations: update.location ? [update.location] : [] } } : {}),
        }));
        setLastUpdated(new Date()?.toISOString());
      }
    } catch (e) {
      console.error('Failed to update profile section', section, e);
    }
  };

  const toggleSectionEdit = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleSectionEdit = (section) => {
    const sectionMap = {
      personal: 'personalDetails',
      skills: 'skills',
      education: 'education',
      preferences: 'preferences',
      resume: 'resume',
      privacy: 'privacy'
    };
    
    const mappedSection = sectionMap?.[section] || section;
    toggleSectionEdit(mappedSection);
    
    // Scroll to section
    const element = document.getElementById(`section-${mappedSection}`);
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {[1, 2, 3, 4]?.map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-48"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-12 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Profile Management</h1>
              <p className="text-muted-foreground">
                Keep your profile updated for better internship recommendations
              </p>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date(lastUpdated)?.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/internship-recommendations')}
                iconName="Search"
                iconPosition="left"
              >
                View Recommendations
              </Button>
              <Button
                variant="default"
                onClick={() => navigate('/main-dashboard')}
                iconName="LayoutDashboard"
                iconPosition="left"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Personal Details Section */}
            <div id="section-personalDetails">
              <PersonalDetailsSection
                profile={profile}
                onUpdate={handleSectionUpdate}
                isEditing={editingSections?.personalDetails}
                onToggleEdit={() => toggleSectionEdit('personalDetails')}
              />
            </div>

            {/* Skills Section */}
            <div id="section-skills">
              <SkillsSection
                profile={profile}
                onUpdate={handleSectionUpdate}
                isEditing={editingSections?.skills}
                onToggleEdit={() => toggleSectionEdit('skills')}
              />
            </div>

            {/* Education Section */}
            <div id="section-education">
              <EducationSection
                profile={profile}
                onUpdate={handleSectionUpdate}
                isEditing={editingSections?.education}
                onToggleEdit={() => toggleSectionEdit('education')}
              />
            </div>

            {/* Preferences Section */}
            <div id="section-preferences">
              <PreferencesSection
                profile={profile}
                onUpdate={handleSectionUpdate}
                isEditing={editingSections?.preferences}
                onToggleEdit={() => toggleSectionEdit('preferences')}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Profile Completion Card */}
              <ProfileCompletionCard
                profile={profile}
                onSectionEdit={handleSectionEdit}
              />

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/application-tracker')}
                    iconName="ClipboardList"
                    iconPosition="left"
                  >
                    Track Applications
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/internship-recommendations')}
                    iconName="Search"
                    iconPosition="left"
                  >
                    Find Internships
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => window.print()}
                    iconName="Download"
                    iconPosition="left"
                  >
                    Export Profile
                  </Button>
                </div>
              </div>

              {/* Profile Tips */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Lightbulb" size={20} className="text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">Profile Tips</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <p>Keep your skills updated to match current industry trends</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <p>Upload a recent resume for better AI matching</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <p>Set specific preferences to get targeted recommendations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <p>Review privacy settings to control data sharing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HelpDeskWidget />
    </div>
  );
};

export default UserProfileManagement;