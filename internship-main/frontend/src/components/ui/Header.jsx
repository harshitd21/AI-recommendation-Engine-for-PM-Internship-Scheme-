import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if we're on the landing page
  const isLandingPage = location?.pathname === '/';

  const navigationItems = [
    { label: t('nav.dashboard'), path: '/main-dashboard', icon: 'LayoutDashboard' },
    { label: t('nav.discover'), path: '/internship-recommendations', icon: 'Search' },
    { label: t('nav.track'), path: '/application-tracker', icon: 'ClipboardList' },
    { label: t('nav.profile'), path: '/user-profile-management', icon: 'User' }
  ];

  const isActivePath = (path) => location?.pathname === path;

    const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };


  const handleSettingsClick = () => {
    navigate('/settings');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);


  const handleLogout = () => {
    // Clear any stored authentication tokens/data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userSkills');
    sessionStorage.clear();

    // Navigate to landing page (root path)
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Don't render header on landing page (it has its own header)
  if (isLandingPage) {
    return null;
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-elevation-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/main-dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Briefcase" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                {t('appTitle')}
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath(item?.path)
                    ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="relative">
             <div className="hidden md:block mr-3">
               <LanguageSwitcher />
             </div>
             <Button
                variant="outline"
                size="sm"
                iconName="Settings"
                iconPosition="left"
                onClick={toggleDropdown}
                aria-label={t('nav.settings')}
              />
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                  <button
                    onClick={() => handleNavigation('/user-profile-management')}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="User" size={16} />
                      <span>{t('nav.profile')}</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="LogOut" size={16} />
                      <span>{t('nav.logout')}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              iconName={isMobileMenuOpen ? 'X' : 'Menu'}
              aria-label="Toggle Menu"
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-slide-in">
            <div className="px-6 py-4 space-y-2">
              <div className="flex justify-end pb-2">
                <LanguageSwitcher />
              </div>
              {navigationItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`flex items-center space-x-3 w-full px-3 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActivePath(item?.path)
                      ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                </button>
              ))}
              
              <div className="pt-4 border-t border-border space-y-2">
                
                <button
                  onClick={() => handleNavigation('/user-profile-management')}
                  className="flex items-center space-x-3 w-full px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                >
                  <Icon name="User" size={18} />
                  <span>{t('nav.profile')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-3 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-muted transition-colors duration-200"
                >
                  <Icon name="LogOut" size={18} />
                  <span>{t('nav.logout')}</span>
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;