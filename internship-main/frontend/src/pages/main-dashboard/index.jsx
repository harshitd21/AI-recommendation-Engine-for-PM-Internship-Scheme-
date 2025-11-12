import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import HelpDeskWidget from '../../components/ui/HelpDeskWidget';
import WelcomeSection from './components/WelcomeSection';
import MetricCard from './components/MetricCard';
import RecommendationPreview from './components/RecommendationPreview';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import QuickActions from './components/QuickActions';
import ActivityFeed from './components/ActivityFeed';
import { userAPI, internshipAPI, applicationsAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

const MainDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userData, setUserData] = useState({ name: '', profileCompletion: 0, email: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [internships, setInternships] = useState([]);
  const [internshipCount, setInternshipCount] = useState(0);
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const applicationStats = [
    { title: 'Internships Available', value: String(internshipCount || internships?.length || 0), icon: 'Briefcase', color: 'blue', trend: { type: 'up', value: '' } },
    { title: 'Skills Added', value: String((userData?.profile?.skills || []).length), icon: 'Code', color: 'yellow', trend: { type: 'up', value: '' } },
    { title: 'Sector', value: userData?.profile?.sector || '—', icon: 'Building2', color: 'purple', trend: { type: 'up', value: '' } },
    { title: 'Location', value: userData?.profile?.location || '—', icon: 'MapPin', color: 'green', trend: { type: 'up', value: '' } },
  ];

  const handleCompleteProfile = () => {
    navigate('/user-profile-management');
  };

  const handleViewAllRecommendations = () => {
    navigate('/internship-recommendations');
  };

  const handleRequestRecommendations = async (payload) => {
    try {
      const res = await internshipAPI.getRecommendations(payload);
      setRecommendations(res?.recommendations || []);
    } catch (e) {
      console.error('Get recommendations error', e);
    }
  };

  const handleViewCalendar = () => {
    navigate('/application-tracker');
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  const handleMetricClick = (metric) => {
    navigate('/application-tracker');
  };

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/user-login');
      return;
    }
    const load = async () => {
      try {
        // Load profile
        const profileRes = await userAPI.getProfile();
        if (profileRes?.user) {
          const user = profileRes.user;
          setUserData({
            name: user?.name,
            email: user?.email,
            profile: user?.profile || {},
            profileCompletion: calcProfileCompletion(user?.profile || {}),
          });
        }
        // Load recommendations (requires profile)
        const recRes = await internshipAPI.getRecommendations();
        setRecommendations(recRes?.recommendations || []);
        // Load internships list (prefer DB, fallback to discover CSV)
        let allRes = await internshipAPI.getAllInternships().catch(() => null);
        let list = Array.isArray(allRes?.internships) ? allRes.internships : [];
        let count = typeof allRes?.count === 'number' ? allRes.count : list.length;

        if (!list.length) {
          const discoverRes = await internshipAPI.getDiscoverInternships().catch(() => null);
          const dList = Array.isArray(discoverRes?.internships) ? discoverRes.internships : [];
          const dCount = typeof discoverRes?.count === 'number' ? discoverRes.count : dList.length;
          list = dList;
          count = dCount;
        }

        setInternships(list);
        setInternshipCount(count);
        // Load activities & deadlines from applications
        const [actRes, dlRes] = await Promise.all([
          applicationsAPI.recentActivity().catch(() => ({ activities: [] })),
          applicationsAPI.upcomingDeadlines().catch(() => ({ deadlines: [] })),
        ]);
        setActivities(Array.isArray(actRes?.activities) ? actRes.activities : []);
        setDeadlines(Array.isArray(dlRes?.deadlines) ? dlRes.deadlines : []);
      } catch (e) {
        console.error('Dashboard load error', e);
      }
    };
    load();
  }, [navigate]);

  const calcProfileCompletion = (profile) => {
    if (!profile) return 0;
    const fields = ['education', 'skills', 'sector', 'location'];
    const filled = fields.reduce((acc, key) => {
      const val = profile[key];
      if (Array.isArray(val)) return acc + (val.length > 0 ? 1 : 0);
      return acc + (val ? 1 : 0);
    }, 0);
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <WelcomeSection
          userName={userData?.name}
          profileCompletion={userData?.profileCompletion}
          onCompleteProfile={handleCompleteProfile}
        />

        {/* Application Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {applicationStats?.map((stat, index) => (
            <MetricCard
              key={index}
              title={stat?.title}
              value={stat?.value}
              icon={stat?.icon}
              color={stat?.color}
              trend={stat?.trend}
              onClick={() => handleMetricClick(stat)}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Recommendations and Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            <RecommendationPreview
              recommendations={recommendations}
              onViewAll={handleViewAllRecommendations}
              onRequestRecommendations={handleRequestRecommendations}
            />
            
            <QuickActions onNavigate={handleNavigate} />
          </div>

          {/* Right Column - Deadlines and Activity */}
          <div className="space-y-8">
            <UpcomingDeadlines
              deadlines={deadlines}
              onViewCalendar={handleViewCalendar}
            />
            
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Mobile-specific sections */}
        <div className="lg:hidden space-y-6">
          {/* Mobile swipeable recommendations preview */}
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {recommendations?.map((internship) => (
                <div
                  key={internship?._id || internship?.id}
                  className="flex-shrink-0 w-72 bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img
                        src={internship?.companyLogo || '/assets/images/download.png'}
                        alt={internship?.company || internship?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/no_image.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground text-sm">
                        {internship?.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {internship?.company || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {internship?.location}
                    </span>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {(() => {
                        if (typeof internship?.matchPercentage === 'number') {
                          return `${Math.min(100, Math.round(internship.matchPercentage))}% ${t('dashboard.recommendations.match')}`;
                        }
                        if (typeof internship?.matchScore === 'number') {
                          return `${Math.min(100, Math.round(internship.matchScore * 100))}% ${t('dashboard.recommendations.match')}`;
                        }
                        return '';
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <HelpDeskWidget />
    </div>
  );
};

export default MainDashboard;