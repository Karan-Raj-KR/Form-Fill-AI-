import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Clock, UserCircle2, LayoutDashboard, ScanLine, LockKeyhole } from 'lucide-react';
import type { Page, Profile, Settings, DetectedField } from '../shared/types';
import { getProfiles, getSettings, addProfile, generateId } from '../shared/storage';
import { DEFAULT_SETTINGS, EMPTY_PROFILE_DATA, PROFILE_COLORS, PROFILE_EMOJIS } from '../shared/constants';

import DashboardPage from './pages/Dashboard';
import HomePage from './pages/Home';
import PreviewPage from './pages/Preview';
import ProfilesPage from './pages/Profiles';
import SettingsPage from './pages/Settings';
import HistoryPage from './pages/History';
import PaymentVaultPage from './pages/PaymentVault';
import PasswordVaultPage from './pages/PasswordVault';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [fields, setFields] = useState<DetectedField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab state
  const [activeTabUrl, setActiveTabUrl] = useState<string>('');
  const [activeTabDomain, setActiveTabDomain] = useState<string>('');

  useEffect(() => {
    // Load config
    Promise.all([getProfiles(), getSettings()]).then(([p, s]) => {
      setProfiles(p);
      setSettings(s);
      setIsLoading(false);
    });

    // ... original code ...
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || '';
        setActiveTabUrl(url);
        try {
          const domain = new URL(url).hostname;
          setActiveTabDomain(domain);
        } catch {
          setActiveTabDomain('');
        }
      });
    }

    return () => {
      if (chrome?.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_HIGHLIGHTS' }).catch(() => {});
          }
        });
      }
    };
  }, []);

  const activeProfile = profiles.find((p) => p.id === settings.activeProfileId) || profiles[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#080F1E' }}>
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const PageComponent = {
    dashboard: <DashboardPage settings={settings} setSettings={setSettings} navigateTo={navigateTo} profiles={profiles} />,
    home: <HomePage fields={fields} setFields={setFields} navigateTo={navigateTo} activeProfile={activeProfile} />,
    preview: <PreviewPage fields={fields} setFields={setFields} navigateTo={navigateTo} activeProfile={activeProfile} activeTabUrl={activeTabUrl} />,
    profiles: <ProfilesPage profiles={profiles} setProfiles={setProfiles} activeProfileId={settings.activeProfileId} setSettings={setSettings} />,
    settings: <SettingsPage settings={settings} setSettings={setSettings} profiles={profiles} />,
    history: <HistoryPage />,
    paymentVault: <PaymentVaultPage navigateTo={navigateTo} />,
    passwordVault: <PasswordVaultPage navigateTo={navigateTo} />,
  }[currentPage];

  return (
    <div className="flex flex-col h-full bg-[#080F1E] text-white">
      {/* Header */}
      <header className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between bg-[#0A1628]">
        <div className="flex items-center gap-2" onClick={() => navigateTo('dashboard')} style={{cursor: 'pointer'}}>
          <img
            src="/icons/icon48.png"
            className="w-6 h-6 rounded"
            style={{ boxShadow: '0 2px 10px rgba(13,148,251,0.45)' }}
            alt="Logo"
          />
          <span className="font-bold text-sm tracking-wide text-white">FormFill AI</span>
        </div>

        {currentPage !== 'dashboard' && activeProfile && (
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-full text-xs cursor-pointer transition-colors duration-150"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#7B92B5' }}
            onClick={() => navigateTo('profiles')}
          >
            <span>{activeProfile.emoji}</span>
            <span className="font-medium mr-1 truncate max-w-[80px]">{activeProfile.name}</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="absolute inset-0 p-4">
          <div className="page-active h-full">
            {PageComponent}
          </div>
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-2 py-3 border-t border-[rgba(255,255,255,0.07)] bg-[#080F1E] z-10">
        <NavItem active={currentPage === 'dashboard'} icon={<LayoutDashboard size={16} />} label="Dash" onClick={() => navigateTo('dashboard')} />
        <NavItem active={currentPage === 'home' || currentPage === 'preview'} icon={<ScanLine size={16} />} label="Scan" onClick={() => navigateTo('home')} />
        <NavItem active={currentPage === 'profiles'} icon={<UserCircle2 size={16} />} label="Profiles" onClick={() => navigateTo('profiles')} />
        <NavItem active={currentPage === 'history'} icon={<Clock size={16} />} label="History" onClick={() => navigateTo('history')} />
        <NavItem active={currentPage === 'paymentVault' || currentPage === 'passwordVault'} icon={<LockKeyhole size={16} />} label="Vault" onClick={() => navigateTo('paymentVault')} />
        <NavItem active={currentPage === 'settings'} icon={<SettingsIcon size={16} />} label="Settings" onClick={() => navigateTo('settings')} />
      </nav>
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors duration-150 px-1"
      style={{ color: active ? '#0D94FB' : '#3A5070' }}
      onClick={onClick}
    >
      {icon}
      {active && (
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#0D94FB', display: 'block' }} />
      )}
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}
