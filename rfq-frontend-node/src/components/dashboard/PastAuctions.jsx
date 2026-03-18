import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Gavel, ArrowLeft, Clock, BarChart3, ChevronRight, Timer, Zap, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { Topbar } from '../shared/UIComponents';
import { statusConfig } from '../../constants/status';
import { AUCTION_URL } from '../../constants/urls';

const PastAuctions = ({ user, onBack, onSelectAuction, onLogout }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(AUCTION_URL);
        const now = new Date();
        const past = res.data
          .filter(a => new Date(a.bid_close_time) < now)
          .sort((a, b) => new Date(b.bid_close_time) - new Date(a.bid_close_time)); // newest closed first
        setAuctions(past);
      } catch (err) {
        console.error('Failed to fetch auctions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }} className="bg-grid">
      <Topbar
        left={
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
            <ArrowLeft size={15} /> Back to Marketplace
          </button>
        }
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Archive size={15} color="var(--text-3)" />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Auction Archive</span>
          </div>
        }
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 className="syne" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Past Auctions</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 8, fontSize: 15 }}>Closed and completed RFQ auctions</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ animation: 'spin 1s linear infinite' }}><Zap size={32} color="var(--accent)" /></div>
          </div>
        ) : auctions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-3)' }}>
            <Archive size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p className="syne" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No past auctions</p>
            <p style={{ fontSize: 14 }}>Closed auctions will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {auctions.map((auction, i) => {
              const status = statusConfig[auction.status] || statusConfig.PENDING;
              return (
                <motion.div key={auction.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="card" style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}
                  onClick={() => onSelectAuction(auction)} whileHover={{ x: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ink-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Gavel size={16} color="var(--text-3)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="syne" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auction.name}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>ID #{auction.id}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'Syne,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Closed at</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{format(new Date(auction.bid_close_time), 'MMM d, yyyy · HH:mm')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'Syne,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Trigger</div>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', background: 'rgba(123,97,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>{auction.trigger_type}</span>
                    </div>
                    <div>
                      <span className={`tag ${ status.cls }`}></span>
                    </div>
                    <ChevronRight size={16} color="var(--text-3)" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastAuctions;
