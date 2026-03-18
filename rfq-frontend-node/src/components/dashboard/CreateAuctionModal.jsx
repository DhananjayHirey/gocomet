import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';
import { Label } from '../shared/UIComponents';

const CreateAuctionModal = ({ onClose, onSubmit, loading }) => {
  const [newAuction, setNewAuction] = useState({
    name: '', bid_start_time: '', bid_close_time: '', forced_close_time: '',
    trigger_window_minutes: 10, extension_duration_minutes: 5, trigger_type: 'ANY_BID'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newAuction);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
        className="card scrollbar-thin" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>New British Auction</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 4 }}>Configure your reverse RFQ auction</p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 8, borderRadius: 10 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Auction name</Label>
              <input type="text" className="input-field" style={{ padding: '12px 16px' }} placeholder="e.g. Q3 Logistics Procurement"
                value={newAuction.name} onChange={(e) => setNewAuction({ ...newAuction, name: e.target.value })} required />
            </div>
            <div>
              <Label>Start time</Label>
              <input type="datetime-local" className="input-field" style={{ padding: '12px 16px' }}
                value={newAuction.bid_start_time} onChange={(e) => setNewAuction({ ...newAuction, bid_start_time: e.target.value })} required />
            </div>
            <div>
              <Label>Close time</Label>
              <input type="datetime-local" className="input-field" style={{ padding: '12px 16px' }}
                value={newAuction.bid_close_time} onChange={(e) => setNewAuction({ ...newAuction, bid_close_time: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Forced close time</Label>
              <input type="datetime-local" className="input-field" style={{ padding: '12px 16px' }}
                value={newAuction.forced_close_time} onChange={(e) => setNewAuction({ ...newAuction, forced_close_time: e.target.value })} required />
            </div>
            <div>
              <Label>Trigger window (min)</Label>
              <input type="number" className="input-field" style={{ padding: '12px 16px' }}
                value={newAuction.trigger_window_minutes} onChange={(e) => setNewAuction({ ...newAuction, trigger_window_minutes: e.target.value })} required />
            </div>
            <div>
              <Label>Extension duration (min)</Label>
              <input type="number" className="input-field" style={{ padding: '12px 16px' }}
                value={newAuction.extension_duration_minutes} onChange={(e) => setNewAuction({ ...newAuction, extension_duration_minutes: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Trigger type</Label>
              <div style={{ position: 'relative' }}>
                <select className="select-field" style={{ padding: '12px 40px 12px 16px' }}
                  value={newAuction.trigger_type} onChange={(e) => setNewAuction({ ...newAuction, trigger_type: e.target.value })}>
                  <option value="ANY_BID">Any Bid — trigger on every bid</option>
                  <option value="ANY_RANK_CHANGE">Any Rank Change — trigger on rank shift</option>
                  <option value="L1_CHANGE">L1 Change — trigger when top changes</option>
                </select>
                <ChevronDown size={14} color="var(--text-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '13px', fontSize: 14, fontWeight: 500 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '13px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Plus size={16} /> Create auction</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateAuctionModal;
