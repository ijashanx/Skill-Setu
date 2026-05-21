import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Mail, Phone, ExternalLink, Link as LinkIcon, Edit3, X, Star, Trash2 } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit State
  const [editForm, setEditForm] = useState({});
  const [profilePicFile, setProfilePicFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res.user);
      setEditForm(res.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', editForm.fullName || '');
      formData.append('bio', editForm.bio || '');
      formData.append('mobileNumber', editForm.mobileNumber || '');
      formData.append('githubLink', editForm.githubLink || '');
      formData.append('portfolioLink', editForm.portfolioLink || '');
      formData.append('leetcodeLink', editForm.leetcodeLink || '');
      formData.append('hackerrankLink', editForm.hackerrankLink || '');
      formData.append('linkedInLink', editForm.linkedInLink || '');
      formData.append('age', editForm.age || '');
      formData.append('gender', editForm.gender || '');
      formData.append('skillsOffered', editForm.skillsOffered || '');
      formData.append('skillsWanted', editForm.skillsWanted || '');

      if (profilePicFile) formData.append('profilePicture', profilePicFile);

      const res = await api.updateProfile(formData);
      setProfile({ ...profile, ...res.user });
      setIsEditing(false);
      setProfilePicFile(null);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Error updating profile');
    }
  };

  if (loading) return <div>Loading...</div>;

  const profileImageUrl = profile?.profilePicture 
    ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}${profile.profilePicture}` 
    : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

  return (
    <div className="p-0">
      <div className="single-profile-card">
        
        {/* Left Side: Bio & Details */}
        <div className="spc-left">
          <div className="spc-header-row">
            <div>
              <h1 className="spc-name">{profile?.fullName}</h1>
              <span className="spc-role">{profile?.role === 'mentor' ? 'Mentor' : 'Member'}</span>
            </div>
            <button onClick={() => setIsEditing(!isEditing)} className="spc-edit-btn" title="Edit Profile">
              {isEditing ? <X size={20}/> : <Edit3 size={20}/>}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="spc-edit-form">
              <div className="spc-form-grid">
                <div className="spc-form-group">
                  <label>Full Name</label>
                  <input type="text" value={editForm.fullName || ''} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required />
                </div>
                <div className="spc-form-group">
                  <label>Mobile Number</label>
                  <input type="text" value={editForm.mobileNumber || ''} onChange={e => setEditForm({...editForm, mobileNumber: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>Age</label>
                  <input type="number" value={editForm.age || ''} onChange={e => setEditForm({...editForm, age: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>Gender</label>
                  <select value={editForm.gender || ''} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="spc-form-group col-span-2">
                  <label>Bio</label>
                  <textarea rows="2" value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>Skills to Teach (comma separated)</label>
                  <input type="text" value={editForm.skillsOffered || ''} onChange={e => setEditForm({...editForm, skillsOffered: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>Skills to Learn (comma separated)</label>
                  <input type="text" value={editForm.skillsWanted || ''} onChange={e => setEditForm({...editForm, skillsWanted: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>LinkedIn Link</label>
                  <input type="url" value={editForm.linkedInLink || ''} onChange={e => setEditForm({...editForm, linkedInLink: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>GitHub Link</label>
                  <input type="url" value={editForm.githubLink || ''} onChange={e => setEditForm({...editForm, githubLink: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>LeetCode Link</label>
                  <input type="url" value={editForm.leetcodeLink || ''} onChange={e => setEditForm({...editForm, leetcodeLink: e.target.value})} />
                </div>
                <div className="spc-form-group">
                  <label>HackerRank Link</label>
                  <input type="url" value={editForm.hackerrankLink || ''} onChange={e => setEditForm({...editForm, hackerrankLink: e.target.value})} />
                </div>
                <div className="spc-form-group col-span-2">
                  <label>Portfolio Link</label>
                  <input type="url" value={editForm.portfolioLink || ''} onChange={e => setEditForm({...editForm, portfolioLink: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="spc-save-btn">Save Changes</button>
            </form>
          ) : (
            <div className="spc-details-grid">
              <div className="spc-item">
                <span>Email</span>
                <p>{profile?.email}</p>
              </div>
              <div className="spc-item">
                <span>Mobile Number</span>
                <p>{profile?.mobileNumber || 'Not provided'}</p>
              </div>
              <div className="spc-item">
                <span>Age</span>
                <p>{profile?.age || 'Not provided'}</p>
              </div>
              <div className="spc-item">
                <span>Gender</span>
                <p>{profile?.gender || 'Not provided'}</p>
              </div>
              
              <div className="spc-item col-span-2">
                <span>Bio</span>
                <p>{profile?.bio || 'Not provided'}</p>
              </div>

              <div className="spc-item">
                <span>Skills Offered</span>
                <p>{profile?.skillsOffered?.length > 0 ? profile.skillsOffered.join(', ') : 'None'}</p>
              </div>
              <div className="spc-item">
                <span>Skills Wanted</span>
                <p>{profile?.skillsWanted?.length > 0 ? profile.skillsWanted.join(', ') : 'None'}</p>
              </div>

              {/* Links Section Embedded in Bio */}
              <div className="spc-item col-span-2">
                <span>Professional Links</span>
                <div className="spc-links-row">
                  {profile?.linkedInLink && <a href={profile.linkedInLink} target="_blank" rel="noreferrer"><LinkIcon size={14}/> LinkedIn</a>}
                  {profile?.githubLink && <a href={profile.githubLink} target="_blank" rel="noreferrer"><LinkIcon size={14}/> GitHub</a>}
                  {profile?.leetcodeLink && <a href={profile.leetcodeLink} target="_blank" rel="noreferrer"><LinkIcon size={14}/> LeetCode</a>}
                  {profile?.hackerrankLink && <a href={profile.hackerrankLink} target="_blank" rel="noreferrer"><LinkIcon size={14}/> HackerRank</a>}
                  {profile?.portfolioLink && <a href={profile.portfolioLink} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Portfolio</a>}
                  {!profile?.linkedInLink && !profile?.githubLink && !profile?.leetcodeLink && !profile?.hackerrankLink && !profile?.portfolioLink && (
                    <p className="spc-muted">No links provided</p>
                  )}
                </div>
              </div>

              {/* Certificates & Achievements Embedded in Bio */}
              <div className="spc-item col-span-2">
                <span>Certificates & Achievements</span>
                <div className="spc-certs-row">
                   {profile?.certificates?.length > 0 ? (
                     profile.certificates.map(cert => (
                       <div key={cert.id} className="spc-mini-cert">
                         <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}${cert.imageUrl}`} alt={cert.title} />
                         <div>
                           <strong>{cert.title}</strong>
                           <small>{cert.issuer}</small>
                         </div>
                       </div>
                     ))
                   ) : (
                     <p className="spc-muted">No certificates uploaded</p>
                   )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right Side: Profile Image */}
        <div className="spc-right">
          <div className="spc-image-wrapper">
            <img src={profileImageUrl} alt="Profile" className="spc-image" />
            {isEditing && (
              <div className="spc-image-upload">
                <label>Change Picture</label>
                <input type="file" accept="image/*" onChange={(e) => setProfilePicFile(e.target.files[0])} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
