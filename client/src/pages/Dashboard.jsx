import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  LayoutDashboard, Compass, User, Wallet, Bell, PlayCircle,
  LogOut, TrendingUp, Clock, BookOpen, ChevronRight, Star, Award, Tag, Users
} from 'lucide-react';
import { api, getUser } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const navigate = useNavigate();
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Fetch latest profile from server
    const fetchProfile = async () => {
      try {
        const result = await api.getProfile();
        if (result.user) {
          setUser(result.user);
          // Fetch dynamic recommendations based on user wanted skills
          fetchRecommendations(result.user);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    fetchSessions();

    // GSAP entry animation
    gsap.fromTo(headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );

    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.15 + i * 0.1, ease: 'power3.out' }
      );
    });
  }, []);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const result = await api.getMySessions();
      if (result && result.sessions) {
        const upcoming = result.sessions.filter(s => s.status === 'confirmed' || s.status === 'active');
        setSessions(upcoming);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchRecommendations = async (currentUser) => {
    try {
      setLoadingRecommendations(true);
      const wantedSkills = Array.isArray(currentUser?.skillsWanted)
        ? currentUser.skillsWanted
        : String(currentUser?.skillsWanted || '').split(',').map(s => s.trim()).filter(Boolean);

      // 1. Fetch Mentors (using search endpoint with limit 100)
      const mentorsRes = await api.searchUsers({ limit: 100 });
      const allMentors = mentorsRes.users || [];
      
      // Filter out self and find overlap with current user's skillsWanted
      let matchedMentors = allMentors.filter(m => {
        if (m.id === currentUser?.id) return false;
        const offered = Array.isArray(m.skillsOffered)
          ? m.skillsOffered
          : String(m.skillsOffered || '').split(',').map(s => s.trim()).filter(Boolean);
        return offered.some(skill => wantedSkills.some(w => w.toLowerCase() === skill.toLowerCase()));
      });

      // Fallback: If no matches, show other top mentors
      if (matchedMentors.length === 0) {
        matchedMentors = allMentors.filter(m => m.id !== currentUser?.id);
      }
      setRecommendedMentors(matchedMentors.slice(0, 3));

      // 2. Fetch Communities
      const communitiesRes = await api.getCommunities();
      const allComm = communitiesRes.communities || [];

      let matchedComm = allComm.filter(comm => {
        const nameLower = (comm.name || '').toLowerCase();
        const descLower = (comm.description || '').toLowerCase();
        return wantedSkills.some(w => nameLower.includes(w.toLowerCase()) || descLower.includes(w.toLowerCase()));
      });

      // Fallback: If no matches, show the most popular communities
      if (matchedComm.length === 0) {
        matchedComm = [...allComm].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
      }
      setRecommendedCommunities(matchedComm.slice(0, 3));

    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <>
        {/* Header */}
        <header className="dashboard-header" ref={headerRef}>
          <div className="welcome-text">
            <h1>Welcome back, {firstName}</h1>
            <p>{user?.email}</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn notification-btn" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>
            <div className="avatar-circle" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              {getInitials(user?.fullName)}
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">

          {/* Credit Balance Card */}
          <section className="credit-card dash-card highlight-border" ref={el => (cardsRef.current[0] = el)}>
            <div className="card-header">
              <h3>Available Credits</h3>
              <Wallet size={22} />
            </div>
            <div className="credit-amount">
              <span className="amount">{(user?.wallet?.balance || user?.credits || 0).toLocaleString()}</span>
              <span className="currency">SC</span>
            </div>
            <div className="credit-meta">
              <span className="credit-change positive"><TrendingUp size={14} /> Account Balance</span>
            </div>
            <button className="btn-primary full-width mt-4" onClick={() => navigate('/store')}>Spend Credits</button>
          </section>

          {/* Upcoming Sessions */}
          <section className="sessions-card dash-card" ref={el => (cardsRef.current[1] = el)}>
            <div className="card-header">
              <h3>Upcoming Sessions</h3>
              <Clock size={20} />
            </div>
            <div className="session-list">
              {loadingSessions ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="session-empty-state" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--gray-100)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No upcoming sessions scheduled.</p>
                  <button className="btn-outline" style={{ marginTop: '0.75rem', padding: '0.3rem 0.8rem', fontSize: '0.75rem' }} onClick={() => navigate('/explore')}>Find a Mentor</button>
                </div>
              ) : (
                sessions.map((s) => {
                  const isLearner = user?.id === s.learnerId;
                  const partnerName = isLearner ? s.mentor?.fullName : s.learner?.fullName;
                  const roleLabel = isLearner ? 'Mentor' : 'Learner';
                  const formattedTime = new Date(s.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
                  
                  return (
                    <div key={s.id} className="session-item" style={{ transition: 'all 0.2s ease' }}>
                      <div className="session-icon"><PlayCircle size={20} /></div>
                      <div className="session-details">
                        <h4>{s.topic}</h4>
                        <p>with {partnerName || 'User'} ({roleLabel}) · {formattedTime}</p>
                      </div>
                      <button className="btn-outline" onClick={() => navigate(`/session/${s.id}`)}>
                        {s.status === 'active' ? 'Active' : 'Join'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* User's Skills Card */}
          <section className="skills-card dash-card col-span-2" ref={el => (cardsRef.current[2] = el)}>
            <div className="card-header">
              <h3>Your Skills</h3>
              <Tag size={20} />
            </div>
            <div className="skills-row">
              <div className="skills-column">
                <h4 className="skills-label">Skills You Teach</h4>
                <div className="skill-tags">
                  {user?.skillsOffered?.length > 0
                    ? user.skillsOffered.map((s, i) => (
                        <span key={i} className="skill-tag teach">{s}</span>
                      ))
                    : <span className="skill-empty">No skills added yet</span>
                  }
                </div>
              </div>
              <div className="skills-divider"></div>
              <div className="skills-column">
                <h4 className="skills-label">Skills You're Learning</h4>
                <div className="skill-tags">
                  {user?.skillsWanted?.length > 0
                    ? user.skillsWanted.map((s, i) => (
                        <span key={i} className="skill-tag learn">{s}</span>
                      ))
                    : <span className="skill-empty">No skills added yet</span>
                  }
                </div>
              </div>
            </div>
          </section>

          {/* Recommended Sections */}
          <section className="recommendations-card dash-card col-span-2" ref={el => (cardsRef.current[3] = el)}>
            <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--kuro)', fontWeight: '800' }}>Recommended for You</h3>
            </div>

            {/* Sub-division 1: Mentors */}
            <div className="recommendation-subdivision" style={{ marginBottom: '2.5rem' }}>
              <div className="subdivision-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700' }}>Mentors matching your wanted skills</h4>
                <Link to="/explore" className="view-all-link">Find more mentors <ChevronRight size={14} /></Link>
              </div>
              
              {loadingRecommendations ? (
                <div style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading recommendations...</div>
              ) : recommendedMentors.length === 0 ? (
                <div className="rec-empty-state" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--gray-100)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    No mentors match your wanted skills yet. Add more wanted skills in your profile!
                  </p>
                  <button className="btn-outline" style={{ marginTop: '0.75rem', padding: '0.35rem 1rem' }} onClick={() => navigate('/profile')}>Edit Wanted Skills</button>
                </div>
              ) : (
                <div className="recommendations-grid">
                  {recommendedMentors.map((m) => (
                    <div key={m.id} className="rec-card" onClick={() => navigate(`/user/${m.id}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.25s ease' }}>
                      <div className="rec-image" style={{ background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', position: 'relative' }}>
                        {m.profilePicture ? (
                          <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}${m.profilePicture}`} alt={m.fullName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--shiro)' }} />
                        ) : (
                          <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}>{getInitials(m.fullName)}</div>
                        )}
                        {m.isVerified && (
                          <span className="rec-badge" style={{ position: 'absolute', top: '8px', right: '8px', padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: 'var(--kuro)', color: 'var(--shiro)', fontWeight: '700', borderRadius: '100px' }}>
                            PRO
                          </span>
                        )}
                      </div>
                      <div className="rec-info" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.92rem', marginBottom: '0.2rem', fontWeight: '600' }}>{m.fullName}</h4>
                        <p className="rec-mentor" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.bio || 'Active Mentor'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'var(--gray-100)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                            {m.credits || 0} SC
                          </span>
                          <span className="rec-rating" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}>
                            <Star size={12} fill="currentColor" style={{ color: 'gold' }} /> {m.averageRating ? m.averageRating.toFixed(1) : '5.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-division 2: Communities */}
            <div className="recommendation-subdivision">
              <div className="subdivision-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700' }}>Communities for your wanted skills</h4>
                <Link to="/community" className="view-all-link">Browse all communities <ChevronRight size={14} /></Link>
              </div>

              {loadingRecommendations ? (
                <div style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading recommendations...</div>
              ) : recommendedCommunities.length === 0 ? (
                <div className="rec-empty-state" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--gray-100)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    No communities match your wanted skills yet. Explore our community catalog!
                  </p>
                  <button className="btn-outline" style={{ marginTop: '0.75rem', padding: '0.35rem 1rem' }} onClick={() => navigate('/community')}>Explore Communities</button>
                </div>
              ) : (
                <div className="recommendations-grid">
                  {recommendedCommunities.map((comm) => (
                    <div key={comm.id} className="rec-card" onClick={() => navigate(`/community/${comm.id}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.25s ease' }}>
                      <div className="rec-image" style={{ background: 'var(--kuro)', color: 'var(--shiro)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                        <Award size={26} />
                      </div>
                      <div className="rec-info" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.92rem', marginBottom: '0.25rem', fontWeight: '600' }}>{comm.name}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '34px', lineHeight: '1.3' }}>
                          {comm.description || 'No description available.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={12} /> {comm.memberCount || 0} Members
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--kuro)' }}>Join →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
    </>
  );
};

export default Dashboard;
