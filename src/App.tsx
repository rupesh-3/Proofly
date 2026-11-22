/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentProfile } from './components/student/StudentProfile';
import { SkillsExplorer } from './components/student/SkillsExplorer';
import { OpportunitiesView } from './components/student/OpportunitiesView';
import { ProjectIdeaChecker } from './components/student/ProjectIdeaChecker';
import { FacultyPortal } from './components/faculty/FacultyPortal';
import { PlacementPortal } from './components/placement/PlacementPortal';
import { AddActivityWizard } from './components/student/AddActivityWizard';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { WebsiteOverview } from './components/overview/WebsiteOverview';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { activeTab, setActiveTab } = useApp();
  const { isAuthenticated, isLoading } = useAuth();

  // Modal controls
  const [isAddActivityOpen, setAddActivityOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [showPublicOverview, setShowPublicOverview] = useState(false);

  // If initializing Supabase session, show subtle branded splash
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#161B2E] text-[#F1F4FA]">
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-[#7C8CFF] to-[#2DD4BF] flex items-center justify-center text-white mb-4 shadow-xl shadow-[#7C8CFF]/20 animate-pulse">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="font-display text-xl font-bold tracking-tight mb-1 text-[#F1F4FA]">PROOFLY</div>
        <p className="text-xs text-[#8A94AD] font-mono-data">Authenticating institutional session...</p>
      </div>
    );
  }

  // Not authenticated: render the Auth Page in the beginning!
  if (!isAuthenticated && !showPublicOverview) {
    return (
      <AuthPage 
        onSuccess={() => setActiveTab('dashboard')} 
        onExplorePublic={() => setShowPublicOverview(true)}
      />
    );
  }

  // Viewing public platform overview before login
  if (!isAuthenticated && showPublicOverview) {
    return (
      <div className="min-h-screen bg-[#1A2040] text-[#F4F6FF]">
        <WebsiteOverview onNavigate={(tab) => {
          if (tab === 'auth' || tab === 'landing') {
            setShowPublicOverview(false);
          } else {
            setActiveTab(tab);
          }
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1A2040] text-[#F4F6FF]">
      
      {/* Top Navigation Bar (Hidden when on public Website Overview since it has its own minimal header) */}
      {activeTab !== 'overview' && (
        <Header 
          onOpenAddActivity={() => setAddActivityOpen(true)} 
          onOpenAuth={() => setAuthOpen(true)} 
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {activeTab === 'overview' && (
          <WebsiteOverview onNavigate={(tab) => {
            if (tab === 'auth') {
              setActiveTab('dashboard');
            } else {
              setActiveTab(tab);
            }
          }} />
        )}
        {(activeTab === 'profile' || activeTab === 'public-portfolio') && <StudentProfile />}
        {activeTab === 'skills' && <SkillsExplorer />}
        {activeTab === 'opportunities' && <OpportunitiesView />}
        {activeTab === 'checker' && <ProjectIdeaChecker />}
        {activeTab === 'faculty' && <FacultyPortal />}
        {activeTab === 'placement' && <PlacementPortal />}
        {activeTab === 'dashboard' && (
          <StudentDashboard onOpenAddActivity={() => setAddActivityOpen(true)} />
        )}
      </main>

      {/* Modals & Command Palette */}
      <CommandPalette />
      
      <AddActivityWizard 
        isOpen={isAddActivityOpen} 
        onClose={() => setAddActivityOpen(false)} 
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setAuthOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
