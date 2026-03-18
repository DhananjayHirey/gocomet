import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, ArrowLeft, Clock, Zap, Timer, Award, Activity, Loader2, CheckCircle2, AlertCircle, Bell, User } from 'lucide-react';
import { format } from 'date-fns';
import { Topbar, StatCard, Label } from '../shared/UIComponents';
import { statusConfig } from '../../constants/status';
import { BIDDING_URL } from '../../constants/urls';
import { useCountdown } from '../../hooks/useCountdown';

const AuctionDetails = ({ user, auction, socket, notifications, setNotifications, onBack, error, setError }) => {
  const [bidPrice, setBidPrice] = useState('');
  const [bidLog, setBidLog] = useState([]);
  const [liveAuction, setLiveAuction] = useState(auction);
  const [submitState, setSubmitState] = useState('idle');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${ BIDDING_URL }/${ liveAuction.id }`);
        setBidLog(res.data.history);
        setLiveAuction(prev => ({ ...prev, rankings: res.data.rankings }));
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };
    fetchHistory();

    if (!socket) return;
    const handleUpdate = (data) => {
      if (data.auction_id == liveAuction.id) {
        setBidLog(prev => [data, ...prev].slice(0, 100));
        setLiveAuction(prev => ({ ...prev, bid_close_time: data.bid_close_time, rankings: data.rankings }));
        setNotifications(prev => [`New quote — $${ data.price }`, ...prev].slice(0, 20));
      }
    };
    const handleExtension = (data) => {
      if (data.auction_id == liveAuction.id)
        setNotifications(prev => [`⚡ Auction extended — new close: ${ data.new_close_time }`, ...prev].slice(0, 20));
    };
    socket.on('bid_update', handleUpdate);
    socket.on('auction_extended', handleExtension);
    socket.on('bid_error', (data) => {
      setError(data.message);
      setNotifications(prev => [`❌ ${ data.message }`, ...prev].slice(0, 20));
    });
    return () => { 
      socket.off('bid_update', handleUpdate); 
      socket.off('auction_extended', handleExtension);
      socket.off('bid_error');
    };
  }, [socket, liveAuction.id]);

  const placeBid = async (e) => {
    e.preventDefault();
    setSubmitState('loading');
    try {
      const token = localStorage.getItem('rfq_token');
      await axios.post(`${ BIDDING_URL }`, { auction_id: liveAuction.id, price: parseFloat(bidPrice) }, { headers: { Authorization: `Bearer ${ token }` } });
      setBidPrice('');
      setSubmitState('success');
      setTimeout(() => setSubmitState('idle'), 2000);
      setNotifications(prev => ['✓ Your quote was submitted', ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  const status = statusConfig[liveAuction.status] || statusConfig.PENDING;
  const countdown = useCountdown(liveAuction.bid_close_time);

  return (
    <div style={{ minHeight: '100vh' }} className="bg-grid">
      <Topbar
        left={
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
            <ArrowLeft size={16} /> Back to Marketplace
          </button>
        }
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {status.dot && <div className="pulse-dot" style={{ width: 7, height: 7 }} />}
            <span className={`tag ${ status.cls }`}>{status.label}</span>
          </div>
        }
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent), var(--accent-2), transparent)' }} />
            <div style={{ position: 'absolute', top: -60, right: -40, opacity: 0.04 }}><Gavel size={200} /></div>
            <div style={{ marginBottom: 24 }}>
              <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>{liveAuction.name}</h1>
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Auction ID: <span className="mono" style={{ color: 'var(--text-2)' }}>#{liveAuction.id}</span></p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                <Label>Start time</Label>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{format(new Date(liveAuction.bid_start_time), 'MMM d, yyyy · HH:mm')}</div>
              </div>
              <div style={{ background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                <Label>Forced close (hard limit)</Label>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{format(new Date(liveAuction.forced_close_time), 'MMM d, yyyy · HH:mm')}</div>
              </div>
            </div>

            {/* Live countdown hero */}
            <div style={{ background: countdown ? 'rgba(123,97,255,0.06)' : 'var(--red-bg)', border: `1px solid ${countdown ? 'rgba(123,97,255,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'Syne,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 4 }}>Bid Deadline</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{format(new Date(liveAuction.bid_close_time), 'MMM d, yyyy · HH:mm')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontFamily: 'Syne,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 4 }}>Time remaining</div>
                <span className="mono" style={{ fontSize: 28, fontWeight: 600, color: countdown ? 'var(--accent-2)' : 'var(--red)', letterSpacing: '0.02em' }}>
                  {countdown ?? 'ENDED'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <StatCard icon={Zap} label="Trigger" value={liveAuction.trigger_type.replace(/_/g, ' ')} />
              <StatCard icon={Timer} label="Extension" value={`+${ liveAuction.extension_duration_minutes }m`} />
            </div>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Award size={18} color="var(--amber)" />
              <h3 className="syne" style={{ fontSize: 16, fontWeight: 700 }}>Supplier Leaderboard</h3>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>UNIQUE BIDDERS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {liveAuction.rankings?.length > 0 ? liveAuction.rankings.map((supplierId, i) => (
                <div key={supplierId} style={{ background: i === 0 ? 'var(--green-bg)' : 'var(--ink-3)', border: `1px solid ${ i === 0 ? 'rgba(34,211,160,0.3)' : 'var(--border)' }`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? 'var(--green)' : 'var(--text-3)', marginBottom: 4 }}>RANK {i + 1}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Supplier #{supplierId}</div>
                </div>
              )) : <div style={{ gridColumn: '1/-1', color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '10px' }}>No active bidders</div>}
            </div>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Activity size={18} color="var(--accent)" />
              <h3 className="syne" style={{ fontSize: 16, fontWeight: 700 }}>Live Quotes</h3>
              {bidLog.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)', fontFamily: 'Syne,sans-serif', fontWeight: 600 }}>{bidLog.length} quote{bidLog.length !== 1 ? 's' : ''}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence initial={false}>
                {bidLog.map((bid, i) => (
                  <motion.div key={`${ bid.supplier_id }-${ i }`} initial={{ opacity: 0, x: -16, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }}
                    style={{ background: i === 0 ? 'rgba(123,97,255,0.06)' : 'var(--ink-3)', border: `1px solid ${ i === 0 ? 'rgba(123,97,255,0.2)' : 'var(--border)' }`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: i === 0 ? 'rgba(123,97,255,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i === 0 ? <Award size={15} color="var(--accent-2)" /> : <User size={15} color="var(--text-3)" />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Supplier #{bid.supplier_id}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{i === 0 ? 'Latest quote' : 'Earlier quote'}</div>
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 20, fontWeight: 500, color: i === 0 ? 'var(--accent-2)' : 'var(--text)' }}>${Number(bid.price).toLocaleString()}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {bidLog.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-3)' }}>
                  <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  <p style={{ fontSize: 14 }}>Waiting for the first quote…</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 80 }}>
          {user?.role === 'SUPPLIER' && (
            <div className="card" style={{ padding: 24, border: '1px solid rgba(123,97,255,0.2)', background: 'rgba(123,97,255,0.04)' }}>
              <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Submit your quote</h3>
              <form onSubmit={placeBid}>
                <div style={{ marginBottom: 16 }}>
                  <Label>Quote price (USD)</Label>
                  <div style={{ position: 'relative' }}>
                    <span className="mono" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 22, color: 'var(--text-3)' }}>$</span>
                    <input type="number" step="0.01" className="input-field mono"
                      style={{ padding: '18px 18px 18px 34px', fontSize: 28, fontWeight: 500, textAlign: 'right' }}
                      placeholder="0.00" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={submitState === 'loading'}>
                  {submitState === 'loading' && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {submitState === 'success' && <CheckCircle2 size={16} />}
                  {submitState === 'idle' && <Zap size={16} />}
                  {submitState === 'loading' ? 'Submitting…' : submitState === 'success' ? 'Submitted!' : 'Place bid'}
                </button>
                {error && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={13} /> {error}</div>}
              </form>
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--ink-3)', borderRadius: 10, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-2)' }}>Tip:</strong> Reverse auction — lower bids win.
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={15} color="var(--accent)" />
                <h3 className="syne" style={{ fontSize: 14, fontWeight: 700 }}>Activity feed</h3>
              </div>
              {notifications.length > 0 && (
                <span style={{ background: 'var(--accent)', borderRadius: 100, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                  {Math.min(notifications.length, 9)}{notifications.length > 9 ? '+' : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }} className="scrollbar-thin">
              <AnimatePresence>
                {notifications.map((n, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="notification-item">{n}</motion.div>
                ))}
              </AnimatePresence>
              {notifications.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>No activity yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
