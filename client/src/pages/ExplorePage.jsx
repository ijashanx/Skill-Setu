import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Star, TrendingUp, Clock,
  MapPin, CheckCircle, ChevronDown, SlidersHorizontal
} from 'lucide-react';
import './ExplorePage.css';

const CustomSelect = ({ value, onChange, options, label, width = '100px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="custom-select-container" style={{ width }}>
      <button 
        className="btn-outline filter-btn custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {selectedOption.label === 'All' || selectedOption.label === 'Level' ? label : selectedOption.label}
        <ChevronDown size={14} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="custom-select-overlay" onClick={() => setIsOpen(false)} />
          <ul className="custom-select-options">
            {options.map((opt) => (
              <li 
                key={opt.value}
                className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

const ExplorePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedLevel, setSelectedLevel] = useState('All');

  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('All');
    setMinRating(0);
    setMaxPrice(1000);
    setSelectedLevel('All');
  };

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for UI presentation categories
  const categories = ['All', 'Programming', 'Design', 'Marketing', 'Business', 'Languages'];
  
  // Dynamically calculate trending skills from all loaded mentors
  const trendingSkills = React.useMemo(() => {
    const counts = {};
    mentors.forEach(m => {
      const offered = Array.isArray(m.skillsOffered)
        ? m.skillsOffered
        : String(m.skillsOffered || '').split(',').map(s => s.trim()).filter(Boolean);
      const wanted = Array.isArray(m.skillsWanted)
        ? m.skillsWanted
        : String(m.skillsWanted || '').split(',').map(s => s.trim()).filter(Boolean);
        
      offered.forEach(s => {
        const key = s.trim();
        if (key) counts[key] = (counts[key] || 0) + 1;
      });
      wanted.forEach(s => {
        const key = s.trim();
        if (key) counts[key] = (counts[key] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill]) => skill);

    return sorted.length > 0 ? sorted : ['React.js', 'Python', 'UI/UX Design', 'Data Science', 'SEO', 'AWS'];
  }, [mentors]);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${window.API_URL}/users/search?limit=100`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setMentors(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const categoryKeywords = {
    'Programming': ['react', 'python', 'java', 'js', 'javascript', 'c++', 'html', 'css', 'node', 'sql', 'mongo', 'git', 'software', 'docker', 'ruby', 'go', 'programming', 'web', 'app', 'aws', 'cloud', 'devops', 'backend', 'frontend', 'fullstack'],
    'Design': ['ui', 'ux', 'design', 'figma', 'illustrator', 'photoshop', 'graphic', 'sketch', 'animation', 'creative', '3d', 'blender'],
    'Marketing': ['seo', 'marketing', 'social media', 'ads', 'growth', 'branding', 'campaign', 'analytics'],
    'Business': ['product', 'management', 'finance', 'strategy', 'entrepreneurship', 'sales', 'agile', 'scrum', 'business', 'startup'],
    'Languages': ['english', 'spanish', 'french', 'german', 'japanese', 'chinese', 'hindi', 'language', 'speak', 'writing']
  };

  const filteredMentors = mentors.filter(mentor => {
    // 1. Search Query Match (by name or skills)
    const searchLower = searchQuery.toLowerCase();
    
    // Safety check for skills (Sequelize getter returns array, but API might return string)
    const rawSkills = mentor.skillsOffered || [];
    const skillsArray = Array.isArray(rawSkills) ? rawSkills : String(rawSkills).split(',');
    
    const matchesSearch =
      (mentor.fullName || '').toLowerCase().includes(searchLower) ||
      (mentor.bio && mentor.bio.toLowerCase().includes(searchLower)) ||
      skillsArray.some(skill => String(skill).toLowerCase().includes(searchLower));

    // 2. Rating Match
    const matchesRating = (Number(mentor.averageRating) || 0) >= minRating;

    // 3. Category Match (activeTab)
    const matchesCategory = activeTab === 'All' || skillsArray.some(skill => {
      const sLower = String(skill).toLowerCase();
      const keywords = categoryKeywords[activeTab] || [];
      return keywords.some(kw => sLower.includes(kw));
    });

    // 4. Price/Credits Match (maxPrice)
    const matchesCredits = maxPrice === 1000 || (Number(mentor.credits) || 0) <= maxPrice;

    // 5. Level Match (selectedLevel)
    const matchesLevel = selectedLevel === 'All' || (() => {
      const lvl = Number(mentor.level) || 1;
      if (selectedLevel === 'Beginner') return lvl <= 2;
      if (selectedLevel === 'Intermediate') return lvl >= 3 && lvl <= 5;
      if (selectedLevel === 'Advanced') return lvl >= 6;
      return true;
    })();

    return matchesSearch && matchesRating && matchesCategory && matchesCredits && matchesLevel;
  });

  return (
    <>

        {/* Header Section */}
        <header className="explore-header">
          <div className="explore-title">
            <h1>Discover & Connect</h1>
            <p>Find the perfect mentor, learn new skills, or get your code reviewed.</p>
          </div>

          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search mentors, skills, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="btn-primary search-btn">Search</button>
          </div>
        </header>

        {/* Filters and Tabs */}
        <div className="explore-controls">
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-actions">
            <CustomSelect 
              label="Ratings"
              value={minRating}
              onChange={setMinRating}
              options={[
                { value: 0, label: 'Ratings' },
                { value: 4.5, label: '4.5 & up' },
                { value: 4.8, label: '4.8 & up' }
              ]}
              width="100px"
            />

            <CustomSelect 
              label="Credits"
              value={maxPrice}
              onChange={setMaxPrice}
              options={[
                { value: 1000, label: 'Credits' },
                { value: 300, label: 'Under 300 SC' },
                { value: 400, label: 'Under 400 SC' }
              ]}
              width="100px"
            />

            <CustomSelect 
              label="Level"
              value={selectedLevel}
              onChange={setSelectedLevel}
              options={[
                { value: 'All', label: 'Level' },
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' }
              ]}
              width="100px"
            />

            <button 
              className="btn-outline filter-btn icon-only" 
              onClick={resetFilters}
              title="Reset Filters"
              style={{ width: '40px', height: '40px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Trending Section */}
        <section className="trending-section">
          <h3><TrendingUp size={18} /> Trending Skills</h3>
          <div className="trending-tags">
            {trendingSkills.map(skill => (
              <span key={skill} className="trending-tag" onClick={() => setSearchQuery(skill)} style={{ cursor: 'pointer' }}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="directory-section">
          <div className="directory-header">
            <h3>Recommended Mentors</h3>
            <span className="results-count">Showing {filteredMentors.length} results</span>
          </div>

          <div className="mentor-grid">
            {filteredMentors.length === 0 ? (
              <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No mentors found matching your criteria.</div>
            ) : (
              filteredMentors.map(mentor => (
                <div
                  key={mentor.id}
                  className="mentor-card"
                  onClick={() => navigate(`/user/${mentor.id}`)}
                >
                  <div className="mentor-card-header">
                    <div className="mentor-avatar">{(mentor.fullName?.[0] || '?').toUpperCase()}</div>
                    <div className="mentor-price">
                      <span className="price-val">{mentor.role === 'mentor' ? 'Paid' : 'Free'}</span>
                    </div>
                  </div>

                  <div className="mentor-card-body">
                    <h4 className="mentor-name">
                      {mentor.fullName} {mentor.isVerified && <CheckCircle size={14} className="verified-icon" />}
                      <span className="level-badge">Lvl {mentor.level || 1}</span>
                    </h4>
                    <p className="mentor-title">{mentor.bio || 'Active Member'}</p>

                    <div className="mentor-stats">
                      <span className="stat-rating">
                        <Star size={14} fill="currentColor" color="#F59E0B" />
                        {Number(mentor.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="stat-availability">
                         <Star size={14} /> Score: {mentor.reputationScore || 0}
                      </span>
                    </div>

                    <div className="mentor-skills">
                      {(mentor.skillsOffered ? String(mentor.skillsOffered).split(',') : []).slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-pill">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mentor-card-footer">
                    <button className="btn-outline full-width">View Profile</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

    </>
  );
};

export default ExplorePage;
