import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { SearchResults } from './components/SearchResults';
import { ListingDetail } from './components/ListingDetail';
import { PublishListing } from './components/PublishListing';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { SellerProfile } from './components/SellerProfile';
import { ShareModal } from './components/ShareModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { activeView, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 antialiased font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast feedback pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar />

      {/* Dynamic Content View */}
      <main className="flex-1">
        {activeView === 'home' && <HomeView />}
        {activeView === 'search' && <SearchResults />}
        {activeView === 'listing-detail' && <ListingDetail />}
        {(activeView === 'publish' || activeView === 'edit-listing') && <PublishListing />}
        {(activeView === 'user-dashboard' || activeView === 'favorites') && <UserDashboard />}
        {activeView === 'admin-panel' && <AdminPanel />}
        {activeView === 'seller-profile' && <SellerProfile />}
      </main>

      {/* Platform Footer */}
      <Footer />

      {/* Floating Modals */}
      <ShareModal />
      <ReportModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
