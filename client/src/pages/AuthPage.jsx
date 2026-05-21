import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, BookOpen, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api, saveAuth } from '../services/api';
import { auth, googleProvider, yahooProvider, signInWithPopup } from '../config/firebase';
import './AuthPage.css';

const AuthPage = () => {
  // mode can be: 'login', 'register', 'forgot', 'reset'
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    skillsOffered: '',
    skillsWanted: '',
  });

  useEffect(() => {
    const resetToken = searchParams.get('reset');
    if (resetToken) {
      setMode('reset');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const result = await api.login({ email: form.email, password: form.password });
        if (result.token) {
          saveAuth(result.token, result.user);
          navigate('/dashboard');
        }
      } else if (mode === 'register') {
        const result = await api.register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          skillsOffered: form.skillsOffered,
          skillsWanted: form.skillsWanted,
        });
        if (result.token) {
          saveAuth(result.token, result.user);
          navigate('/dashboard');
        }
      } else if (mode === 'forgot') {
        const result = await api.forgotPassword({ email: form.email });
        setMessage(result.message || 'Check your email for the reset link.');
      } else if (mode === 'reset') {
        const token = searchParams.get('reset');
        const result = await api.resetPassword({ token, newPassword: form.password });
        setMessage(result.message || 'Password updated! You can now log in.');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err) {
      if (mode === 'login' && err.status === 404) {
        window.alert("You don't have an account. Please create one!");
        setMode('register');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    try {
      setLoading(true);
      setError('');
      const provider = providerName === 'google' ? googleProvider : yahooProvider;
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Attempt to extract email from providerData if main user.email is null
      const providerEmail = user.providerData && user.providerData.length > 0 ? user.providerData[0].email : null;
      const finalEmail = user.email || providerEmail || `${user.uid}@${providerName}.local`;

      const res = await api.socialLogin({
        email: finalEmail,
        fullName: user.displayName || 'User',
        uid: user.uid,
        authProvider: providerName
      });

      if (res.token) {
        saveAuth(res.token, res.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Social login error:', err);
      setError('Social login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getHeaderTexts = () => {
    switch (mode) {
      case 'login': return { title: 'Welcome back', subtitle: 'Sign in to continue your learning journey' };
      case 'register': return { title: 'Create your account', subtitle: 'Start exchanging skills with the community' };
      case 'forgot': return { title: 'Reset Password', subtitle: "Enter your email and we'll send you a link" };
      case 'reset': return { title: 'New Password', subtitle: 'Enter your new password below' };
      default: return { title: '', subtitle: '' };
    }
  };

  const { title, subtitle } = getHeaderTexts();

  return (
    <div className="auth-page">
      {/* Left Panel — Branding */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo">
            <GraduationCap size={32} />
            <span>SkillSetu</span>
          </div>
          <h1>
            Exchange Skills,<br />
            <span className="auth-highlight">Not Money.</span>
          </h1>
          <p>
            Join a community where knowledge is the only currency.
            Teach, learn, and grow — together.
          </p>
          <div className="auth-stats-row">
            <div className="auth-stat">
              <strong>2,400+</strong>
              <span>Learners</span>
            </div>
            <div className="auth-stat">
              <strong>180+</strong>
              <span>Skills</span>
            </div>
            <div className="auth-stat">
              <strong>₹0</strong>
              <span>Cost</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success" style={{ padding: '0.85rem 1.25rem', borderRadius: '4px', background: '#e6f4ea', color: '#137333', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #ceead6' }}>{message}</div>}

          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="social-login-container" style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <button type="button" onClick={() => handleSocialLogin('google')} className="social-btn" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500' }}>
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                  Google
                </button>
                <button type="button" onClick={() => handleSocialLogin('yahoo')} className="social-btn" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500' }}>
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#6001d2" d="M448 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V96c0-35.35-28.65-64-64-64z"/><path fill="#fff" d="M316.52 144.15l-63.53 103.73V352h-43.2V248l-63.14-103.85h49.69l34.42 63.63 35.26-63.63h50.5zm19.8 190.23c-15.02 0-23.75-10.02-23.75-23.86s8.73-23.86 23.75-23.86c15.01 0 23.74 10.02 23.74 23.86.01 13.84-8.73 23.86-23.74 23.86z"/></svg>
                  Yahoo
                </button>
              </div>
              <div className="divider" style={{ textAlign: 'center', margin: '1rem 0', position: 'relative' }}>
                <span style={{ background: '#fff', padding: '0 10px', color: '#888', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>OR EMAIL</span>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#eee', zIndex: 0 }}></div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input id="fullName" name="fullName" type="text" placeholder="Your full name" value={form.fullName} onChange={handleChange} required />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="skillsOffered">Skills You Can Teach</label>
                  <div className="input-wrapper">
                    <BookOpen size={18} />
                    <input id="skillsOffered" name="skillsOffered" type="text" placeholder="e.g. Python, React, Guitar" value={form.skillsOffered} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="skillsWanted">Skills You Want to Learn</label>
                  <div className="input-wrapper">
                    <BookOpen size={18} />
                    <input id="skillsWanted" name="skillsWanted" type="text" placeholder="e.g. UI/UX, Data Science" value={form.skillsWanted} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : (
                mode === 'login' ? 'Sign In' :
                mode === 'register' ? 'Create Account' :
                mode === 'forgot' ? 'Send Reset Link' :
                'Update Password'
              )}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {(mode === 'login' || mode === 'register') && (
            <div className="auth-toggle">
              <p>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button type="button" onClick={toggleMode} className="toggle-link">
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <div className="auth-toggle">
              <p>
                Remember your password?
                <button type="button" onClick={() => setMode('login')} className="toggle-link">
                  Back to Sign In
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
