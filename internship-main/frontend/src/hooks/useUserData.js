import { useState, useEffect, useContext, createContext } from 'react';
import { userAPI, internshipAPI } from '../services/api';

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Load user profile
      const profile = await userAPI.getProfile();
      setUserData(profile);
      
      // Set user skills
      const skills = profile.skills || JSON.parse(localStorage.getItem('userSkills') || '[]');
      setUserSkills(skills);
      
      // Get recommendations based on skills
      if (skills.length > 0) {
        const recRes = await internshipAPI.getRecommendations(skills);
        setRecommendations(recRes?.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserSkills = async (newSkills) => {
    try {
      await userAPI.addSkills(newSkills);
      setUserSkills(newSkills);
      localStorage.setItem('userSkills', JSON.stringify(newSkills));
      
      // Refresh recommendations
  const recRes = await internshipAPI.getRecommendations(newSkills);
  setRecommendations(recRes?.recommendations || []);
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };

  const refreshRecommendations = async () => {
    if (userSkills.length > 0) {
      try {
  const recRes = await internshipAPI.getRecommendations(userSkills);
  setRecommendations(recRes?.recommendations || []);
      } catch (error) {
        console.error('Error refreshing recommendations:', error);
      }
    }
  };

  return (
    <UserDataContext.Provider value={{
      userData,
      userSkills,
      recommendations,
      loading,
      setUserData,
      updateUserSkills,
      refreshRecommendations,
      loadUserData
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};
