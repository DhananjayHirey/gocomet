import React from 'react';
import { motion } from 'framer-motion';
import { Gavel, User, LogOut, Plus, Clock, Timer, Zap, BarChart3, ChevronRight, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { Topbar } from '../shared/UIComponents';
import { statusConfig } from '../../constants/status';
import { useCountdown } from '../../hooks/useCountdown';

// Countdown chip shown on each auction card
const CountdownChip = ({ closeTime, startTime, status }) => {
  const timeLeft = useCountdown(closeTime);
  const now = new Date();
  const started = new Date(startTime) <= now;
  const closed = new Date(closeTime) <= now;
  if (status !== 'ACTIVE' || !started || closed) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: timeLeft ? 'rgba(123,97,255,0.1)' : 'var(--red-bg)',
      border: `1px solid ${ timeLeft ? 'rgba(123,97,255,0.25)' : 'rgba(248,113,113,0.25)' }`,
      borderRadius: 8, padding: '4px 10px', fontSize: 13,
    }}>
      <Clock size={12} color={timeLeft ? 'var(--accent-2)' : 'var(--red)'} />
      <span className="mono" style={{ fontWeight: 600, color: timeLeft ? 'var(--accent-2)' : 'var(--red)', letterSpacing: '0.02em' }}>
        {timeLeft ?? 'ENDED'}
      </span>
    </div>
  );
};

const Dashboard = ({ user, auctions, loading, onSelectAuction, onCreateClick, onLogout, onPastAuctions }) => {
  const now = new Date();
  const activeCount = auctions.filter(a =>
    a.status === 'ACTIVE' &&
    new Date(a.bid_start_time) <= now &&
    new Date(a.bid_close_time) > now
  ).length;
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }} className="bg-grid">
      <Topbar
        left={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gavel size={16} color="white" />
            </div>
            <span className="syne" style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>RFQ</span>
            <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
            <span style={{ color: 'var(--text-3)', fontSize: 14 }}>Marketplace</span>
          </div>
        }
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onPastAuctions} className="btn-ghost" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Archive size={14} /> Past Auctions
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--ink-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="var(--text-2)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2 }}>{user?.username}</div>
                <span className="role-pill">{user?.role}</span>
              </div>
            </div>
            <button onClick={onLogout} className="btn-ghost" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        }
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {activeCount > 0 && <><div className="pulse-dot" /><span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, fontFamily: 'Syne,sans-serif' }}>{activeCount} live</span></>}
            </div>
            <h1 className="syne" style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1 }}>Active Auctions</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 8, fontSize: 15 }}>{auctions.filter((a) => a.bid_close_time > new Date()).length} RFQ{auctions.length !== 1 ? 's' : ''} available</p>
          </div>
          {user?.role === 'BUYER' && (
            <button className="btn-primary" onClick={onCreateClick} style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <Plus size={16} /> New Auction
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ animation: 'spin 1s linear infinite' }}><Zap size={32} color="var(--accent)" /></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {auctions.map((auction, i) => {
              const status = statusConfig[auction.status] || statusConfig.PENDING;
              return (

                <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="card card-glow" style={{ padding: 24, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                  onClick={() => onSelectAuction(auction)} whileHover={{ y: -4 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: auction.status === 'ACTIVE' ? 0.8 : 0.2 }} />

                  {/* Status + countdown row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {status.dot && new Date(auction.bid_start_time) <= new Date() && new Date(auction.bid_close_time) > new Date() && <div className="pulse-dot" style={{ width: 6, height: 6 }} />}
                      <span className={`tag ${ status.cls }`}>{status.label}</span>
                    </div>
                    <CountdownChip closeTime={auction.bid_close_time} startTime={auction.bid_start_time} status={auction.status} />
                  </div>

                  <h3 className="syne" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 14, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{auction.name}</h3>

                  {/* Deadline block */}
                  <div style={{ background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'Syne,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Bid Deadline</div>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{format(new Date(auction.bid_close_time), 'MMM d, yyyy · HH:mm')}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 13 }}>
                      <Timer size={13} color="var(--text-3)" />
                      <span>Extends by <span style={{ color: 'var(--text)' }}>{auction.extension_duration_minutes}m</span> on trigger</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 13 }}>
                      <Zap size={13} color="var(--text-3)" />
                      <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', background: 'rgba(123,97,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>{auction.trigger_type}</span>
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'Syne,sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Open auction</span>
                    <ChevronRight size={16} color="var(--text-3)" />
                  </div>
                </motion.div>
              );
            })}
            {auctions.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', color: 'var(--text-3)' }}>
                <BarChart3 size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p className="syne" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No active auctions</p>
                <p style={{ fontSize: 14 }}>Buyers can create new RFQ auctions from here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
