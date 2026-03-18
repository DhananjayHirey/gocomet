import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, AlertCircle, CheckCircle2, Package, Shield, Loader2 } from 'lucide-react';
import { Label } from '../shared/UIComponents';

const AuthView = ({ view, setView, authData, setAuthData, onLogin, onRegister, loading, error }) => {
  const isLogin = view === 'login';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }} className="bg-grid">
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(123,97,255,0.12), transparent 70%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, var(--accent), #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 8px 32px var(--accent-glow)' }}>
            <Gavel size={26} color="white" />
          </div>
          <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--text-2)', marginTop: 8, fontSize: 15 }}>
            {isLogin ? 'Sign in to your RFQ workspace' : 'Join the reverse auction platform'}
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: error.includes('created') ? 'var(--green-bg)' : 'var(--red-bg)', border: `1px solid ${ error.includes('created') ? 'rgba(34,211,160,0.2)' : 'rgba(248,113,113,0.2)' }`, borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                {error.includes('created') ? <CheckCircle2 size={16} color="var(--green)" /> : <AlertCircle size={16} color="var(--red)" />}
                <span style={{ color: error.includes('created') ? 'var(--green)' : 'var(--red)' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={isLogin ? onLogin : onRegister}>
            <div style={{ marginBottom: 20 }}>
              <Label>Username</Label>
              <input type="text" className="input-field" placeholder="your_username" style={{ padding: '12px 16px' }}
                value={authData.username} onChange={(e) => setAuthData({ ...authData, username: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <Label>Password</Label>
              <input type="password" className="input-field" placeholder="••••••••" style={{ padding: '12px 16px' }}
                value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} required />
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
                  <Label>I am a</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {['BUYER', 'SUPPLIER'].map(role => (
                      <button key={role} type="button" onClick={() => setAuthData({ ...authData, role })}
                        style={{ padding: '12px', borderRadius: 12, border: `1px solid ${ authData.role === role ? 'rgba(123,97,255,0.4)' : 'var(--border)' }`, background: authData.role === role ? 'rgba(123,97,255,0.12)' : 'var(--ink-3)', color: authData.role === role ? 'var(--accent-2)' : 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {role === 'BUYER' ? <Package size={15} /> : <Shield size={15} />}
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }} disabled={loading}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ color: 'var(--text-3)', fontSize: 14 }}>{isLogin ? 'No account? ' : 'Already have one? '}</span>
            <button onClick={() => setView(isLogin ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--accent-2)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
              {isLogin ? 'Register here' : 'Sign in'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Real-time Bidding', 'Secure Platform', 'Live Analytics'].map((txt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 100, padding: '5px 12px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
              {txt}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthView;
