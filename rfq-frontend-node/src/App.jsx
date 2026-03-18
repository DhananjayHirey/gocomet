import React, { useState } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';


import { AUCTION_URL } from './constants/urls';


import { useAuth } from './hooks/useAuth';
import { useAuctions } from './hooks/useAuctions';
import { useSocket } from './hooks/useSocket';


import AuthView from './components/auth/AuthView';
import Dashboard from './components/dashboard/Dashboard';
import CreateAuctionModal from './components/dashboard/CreateAuctionModal';
import AuctionDetails from './components/auction/AuctionDetails';
import PastAuctions from './components/dashboard/PastAuctions';


import './index.css';

const App = () => {
  const { user, loading: authLoading, error: authError, setError: setAuthError, view, setView, login, register, logout } = useAuth();
  const { auctions, loading: auctionsLoading, error: auctionsError, fetchAuctions, setError: setAuctionsError } = useAuctions(view);
  const { socket, subscribeToAuction } = useSocket(user);

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '', role: 'SUPPLIER' });
  const [actionLoading, setActionLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(authForm.username, authForm.password);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(authForm);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCreateAuction = async (newAuction) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('rfq_token');
      const auctionToCreate = {
        ...newAuction,
        bid_start_time: new Date(newAuction.bid_start_time).toISOString(),
        bid_close_time: new Date(newAuction.bid_close_time).toISOString(),
        forced_close_time: new Date(newAuction.forced_close_time).toISOString(),
      };
      await axios.post(AUCTION_URL, auctionToCreate, { headers: { Authorization: `Bearer ${ token }` } });
      setShowCreateModal(false);
      fetchAuctions();
    } catch (err) {
      setAuctionsError(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setActionLoading(false);
    }
  };

  const selectAuction = (auction) => {
    setSelectedAuction(auction);
    setView('auction-details');
    subscribeToAuction(auction.id);
  };

  return (
    <>
      {(view === 'login' || view === 'register') && (
        <AuthView
          view={view}
          setView={setView}
          authData={authForm}
          setAuthData={setAuthForm}
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={authLoading}
          error={authError}
        />
      )}
      {view === 'dashboard' && (
        <>
          <Dashboard
            user={user}
            auctions={auctions}
            loading={auctionsLoading}
            onSelectAuction={selectAuction}
            onCreateClick={() => setShowCreateModal(true)}
            onLogout={logout}
            onPastAuctions={() => setView('past-auctions')}
          />
          <AnimatePresence>
            {showCreateModal && (
              <CreateAuctionModal
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateAuction}
                loading={actionLoading}
              />
            )}
          </AnimatePresence>
        </>
      )}
      {view === 'auction-details' && selectedAuction && (
        <AuctionDetails
          user={user}
          auction={selectedAuction}
          socket={socket}
          notifications={notifications}
          setNotifications={setNotifications}
          onBack={() => setView('dashboard')}
          error={auctionsError}
          setError={setAuctionsError}
        />
      )}
      {view === 'past-auctions' && (
        <PastAuctions
          user={user}
          onBack={() => setView('dashboard')}
          onSelectAuction={selectAuction}
          onLogout={logout}
        />
      )}
    </>
  );
};

export default App;