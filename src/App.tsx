/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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
import { WebsiteOverview } from './components/overview/WebsiteOverview';

function AppContent() {
  const { activeTab, setActiveTab } = useApp();

  // Modal controls
  const [isAddActivityOpen, setAddActivityOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);

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
        {activeTab === 'overview' && <WebsiteOverview onNavigate={(tab) => setActiveTab(tab)} />}
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
