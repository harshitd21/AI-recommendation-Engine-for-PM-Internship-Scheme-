import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';

const SkillsSetup = () => {
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const predefinedSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML/CSS',
    'Data Analysis', 'Machine Learning', 'UI/UX Design', 'Project Management',
    'Marketing', 'Sales', 'Content Writing', 'Graphic Design', 'Photography',
    'Video Editing', 'Social Media', 'SEO', 'Accounting', 'Finance'
  ];

  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setCurrentSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    if (skills.length === 0) return;
    
    try {
      setLoading(true);
      await userAPI.addSkills(skills);
      
      // Store skills locally for immediate use
      localStorage.setItem('userSkills', JSON.stringify(skills));
      
      // Redirect to dashboard
      navigate('/main-dashboard');
    } catch (error) {
      console.error('Error saving skills:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Award" size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add Your Skills
          </h1>
          <p className="text-muted-foreground">
            Help us find the perfect internships for you by adding your skills
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-8">
          {/* Skill Input */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill(currentSkill)}
                placeholder="Add a skill..."
                className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button 
                onClick={() => addSkill(currentSkill)}
                disabled={!currentSkill.trim()}
                iconName="Plus"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Predefined Skills */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Popular Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {predefinedSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  disabled={skills.includes(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    skills.includes(skill)
                      ? 'bg-primary text-white cursor-not-allowed'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Your Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/main-dashboard')}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={skills.length === 0 || loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Continue to Dashboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSetup;
