import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AUCTION_URL } from '../constants/urls';
import { CloudCog } from 'lucide-react';

export const useAuctions = (view) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(AUCTION_URL);
      console.log(res.data);
      setAuctions(res.data);
    } catch (err) {
      setError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'dashboard') {
      fetchAuctions();
    }
  }, [view, fetchAuctions]);

  return { auctions, loading, error, fetchAuctions, setError };
};
