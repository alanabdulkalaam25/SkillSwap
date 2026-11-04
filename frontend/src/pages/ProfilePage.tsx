import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { 
  UserProfile, 
  Skill, 
  ProficiencyLevel, 
  PriorityLevel 
} from '../types';
import { 
  GraduationCap, 
  Mail, 
  Hash, 
  Sparkles, 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  X, 
  Search,
  Award,
  Layers,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

const PROFICIENCY_CONFIG: Record<ProficiencyLevel, { label: string; color: string; bg: string; border: string }> = {
  BEGINNER: { label: 'Beginner', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' },
  INTERMEDIATE: { label: 'Intermediate', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  ADVANCED: { label: 'Advanced', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  EXPERT: { label: 'Expert', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: 'Low Priority', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  MEDIUM: { label: 'Medium Priority', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  HIGH: { label: 'High Priority', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Applied Mathematics & Computing',
  'Management & Business Studies',
  'Design & Architecture',
];

export const ProfilePage: React.FC = () => {
  const { token, updateCurrentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [catalogSkills, setCatalogSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Edit State
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editSemester, setEditSemester] = useState<number>(1);
  const [isSavingBio, setIsSavingBio] = useState<boolean>(false);

  // Add Offered Skill State
  const [offeredSearch, setOfferedSearch] = useState<string>('');
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<Skill | null>(null);
  const [offeredProficiency, setOfferedProficiency] = useState<ProficiencyLevel>('INTERMEDIATE');
  const [offeredDescription, setOfferedDescription] = useState<string>('');
  const [isAddingOffered, setIsAddingOffered] = useState<boolean>(false);

  // Add Wanted Skill State
  const [wantedSearch, setWantedSearch] = useState<string>('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState<Skill | null>(null);
  const [wantedPriority, setWantedPriority] = useState<PriorityLevel>('MEDIUM');
  const [wantedNotes, setWantedNotes] = useState<string>('');
  const [isAddingWanted, setIsAddingWanted] = useState<boolean>(false);

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Fetch initial profile & catalog
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setIsLoading(true);

      try {
        const [profileRes, catalogRes] = await Promise.all([
          fetch('/api/profile/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/skills'),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success && profileData.profile) {
            setProfile(profileData.profile);
            setEditName(profileData.profile.name);
            setEditBio(profileData.profile.bio || '');
            setEditDepartment(profileData.profile.department);
            setEditSemester(profileData.profile.semester);
          }
        }

        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();
          if (catalogData.success && catalogData.skills) {
            setCatalogSkills(catalogData.skills);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        notify('error', 'Failed to synchronize profile data with server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handle Save Profile Bio & Academic Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingBio(true);

    try {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          department: editDepartment,
          semester: Number(editSemester),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.profile) {
        setProfile(data.profile);
        updateCurrentUser({
          name: data.profile.name,
          bio: data.profile.bio,
          department: data.profile.department,
          semester: data.profile.semester,
        });
        setIsEditingBio(false);
        notify('success', 'Profile and academic information updated successfully!');
      } else {
        notify('error', data.error || 'Failed to update profile details.');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error updating profile.');
    } finally {
      setIsSavingBio(false);
    }
  };

  // Handle Add Offered Skill
  const handleAddOfferedSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const skillName = selectedOfferedSkill ? selectedOfferedSkill.name : offeredSearch.trim();
    if (!skillName) {
      notify('error', 'Please choose or type a skill to teach.');
      return;
    }

    setIsAddingOffered(true);
    try {
      const res = await fetch('/api/profile/skills/offered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillId: selectedOfferedSkill?.id,
          skillName: !selectedOfferedSkill ? skillName : undefined,
          proficiency: offeredProficiency,
          description: offeredDescription.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.offeredSkill) {
        // Refresh profile
        setProfile((prev) => {
          if (!prev) return null;
          const filtered = prev.offeredSkills.filter((s) => s.skillId !== data.offeredSkill.skillId);
          return {
            ...prev,
            offeredSkills: [data.offeredSkill, ...filtered],
          };
        });
        setOfferedSearch('');
        setSelectedOfferedSkill(null);
        setOfferedDescription('');
        notify('success', data.message || `Added ${skillName} to your skills!`);
      } else {
        notify('error', data.error || 'Failed to add offered skill.');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error adding skill.');
    } finally {
      setIsAddingOffered(false);
    }
  };

  // Handle Delete Offered Skill
  const handleDeleteOfferedSkill = async (id: string, skillName: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/skills/offered/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            offeredSkills: prev.offeredSkills.filter((s) => s.id !== id),
          };
        });
        notify('success', `Removed ${skillName} from your offered skills.`);
      } else {
        notify('error', data.error || 'Failed to delete skill.');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error removing skill.');
    }
  };

  // Handle Add Wanted Skill
  const handleAddWantedSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const skillName = selectedWantedSkill ? selectedWantedSkill.name : wantedSearch.trim();
    if (!skillName) {
      notify('error', 'Please choose or type a skill you want to learn.');
      return;
    }

    setIsAddingWanted(true);
    try {
      const res = await fetch('/api/profile/skills/wanted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillId: selectedWantedSkill?.id,
          skillName: !selectedWantedSkill ? skillName : undefined,
          priority: wantedPriority,
          notes: wantedNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.wantedSkill) {
        setProfile((prev) => {
          if (!prev) return null;
          const filtered = prev.wantedSkills.filter((s) => s.skillId !== data.wantedSkill.skillId);
          return {
            ...prev,
            wantedSkills: [data.wantedSkill, ...filtered],
          };
        });
        setWantedSearch('');
        setSelectedWantedSkill(null);
        setWantedNotes('');
        notify('success', data.message || `Added ${skillName} to wanted skills!`);
      } else {
        notify('error', data.error || 'Failed to add wanted skill.');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error adding wanted skill.');
    } finally {
      setIsAddingWanted(false);
    }
  };

  // Handle Delete Wanted Skill
  const handleDeleteWantedSkill = async (id: string, skillName: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/skills/wanted/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            wantedSkills: prev.wantedSkills.filter((s) => s.id !== id),
          };
        });
        notify('success', `Removed ${skillName} from your wanted skills.`);
      } else {
        notify('error', data.error || 'Failed to delete wanted skill.');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error removing wanted skill.');
    }
  };

  // Filter skills for autocomplete
  const offeredFiltered = catalogSkills.filter((s) => {
    const query = offeredSearch.toLowerCase().trim();
    if (!query) return false;
    const alreadyOffered = profile?.offeredSkills.some((os) => os.skillId === s.id);
    return !alreadyOffered && (s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query));
  });

  const wantedFiltered = catalogSkills.filter((s) => {
    const query = wantedSearch.toLowerCase().trim();
    if (!query) return false;
    const alreadyWanted = profile?.wantedSkills.some((ws) => ws.skillId === s.id);
    return !alreadyWanted && (s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query));
  });

  // Calculate Profile Completion Score
  const hasBio = Boolean(profile?.bio && profile.bio.trim().length > 10);
  const offeredCount = profile?.offeredSkills.length || 0;
  const wantedCount = profile?.wantedSkills.length || 0;
  let completionScore = 20; // base for institutional verification
  if (hasBio) completionScore += 25;
  if (offeredCount >= 1) completionScore += 30;
  if (wantedCount >= 1) completionScore += 25;

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-4 text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">Loading Student Profile & Catalog...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      {/* Floating Feedback Alert */}
      {feedback && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-4 ring-white/10 shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{profile.name}</h1>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                  </span>
                </div>
                <p className="text-sm text-indigo-200/90 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-indigo-300" />
                    {profile.department} • Semester {profile.semester}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-xs text-indigo-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {profile.rollNumber}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-xs">
                    <Mail className="w-3.5 h-3.5 text-indigo-300" />
                    {profile.email}
                  </span>
                </p>
              </div>
            </div>

            {/* Profile Completion Indicator */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-64 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-indigo-200">Exchange Readiness</span>
                <span className="text-white font-bold">{completionScore}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    completionScore >= 75 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <p className="text-[11px] text-indigo-200/80">
                {completionScore >= 75
                  ? '✨ Profile optimized for peer matching!'
                  : 'Add skills to unlock smart peer exchange recommendations.'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section: Left = Bio & Academic Card | Right = Skills Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Bio & Academic Info Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                    Student Details & Bio
                  </h3>
                </div>
                {!isEditingBio && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {!isEditingBio ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Student Bio / About
                    </label>
                    {profile.bio && profile.bio.trim() ? (
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                        {profile.bio}
                      </p>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        No bio added yet. Tell fellow campus peers about your projects, technical interests, or what you enjoy building.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50/60 text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-slate-400" /> Department
                      </span>
                      <span className="font-semibold text-slate-800 text-right">{profile.department}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50/60 text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-slate-400" /> Current Semester
                      </span>
                      <span className="font-semibold text-slate-800">Semester {profile.semester}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50/60 text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-slate-400" /> Roll Number
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{profile.rollNumber}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50/60 text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" /> College Email
                      </span>
                      <span className="font-semibold text-slate-800">{profile.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700">Student Bio</label>
                      <span className="text-[10px] text-slate-400 font-mono">{editBio.length}/600</span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={600}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Share your technical interests, favorite tech stack, or what kind of peer skill exchanges you are looking for..."
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Department
                    </label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Semester (1 to 10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      required
                      value={editSemester}
                      onChange={(e) => setEditSemester(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingBio}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingBio ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBio(false)}
                      className="inline-flex items-center justify-center text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Summary Pill Card */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Exchange Portfolio Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white rounded-2xl border border-indigo-100/80 shadow-xs">
                  <div className="text-2xl font-black text-indigo-600">{profile.offeredSkills.length}</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Skills I Can Teach</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-violet-100/80 shadow-xs">
                  <div className="text-2xl font-black text-violet-600">{profile.wantedSkills.length}</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Skills I Want</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Skills I Can Teach & Skills I Want To Learn */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION 1: Skills I Can Teach (Offered Skills) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Skills I Can Teach (Offered Skills)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Select technologies, frameworks, or subjects you can help your college peers learn.
                  </p>
                </div>
                <span className="inline-flex self-start sm:self-auto items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {profile.offeredSkills.length} Active
                </span>
              </div>

              {/* Add Offered Skill Form */}
              <form onSubmit={handleAddOfferedSkill} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Skill Search / Dropdown */}
                  <div className="md:col-span-2 relative">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Search Master Catalog or Type Custom Skill
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. React, Python, Figma, MATLAB..."
                        value={selectedOfferedSkill ? selectedOfferedSkill.name : offeredSearch}
                        onChange={(e) => {
                          setSelectedOfferedSkill(null);
                          setOfferedSearch(e.target.value);
                        }}
                        className="w-full text-xs pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      {(offeredSearch || selectedOfferedSkill) && (
                        <button
                          type="button"
                          onClick={() => {
                            setOfferedSearch('');
                            setSelectedOfferedSkill(null);
                          }}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Suggestions */}
                    {offeredSearch && !selectedOfferedSkill && offeredFiltered.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                        {offeredFiltered.map((skill) => (
                          <div
                            key={skill.id}
                            onClick={() => {
                              setSelectedOfferedSkill(skill);
                              setOfferedSearch(skill.name);
                            }}
                            className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-none"
                          >
                            <span className="font-semibold text-slate-800">{skill.name}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {skill.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Proficiency Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Proficiency Level
                    </label>
                    <select
                      value={offeredProficiency}
                      onChange={(e) => setOfferedProficiency(e.target.value as ProficiencyLevel)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="BEGINNER">Beginner (Fundamentals)</option>
                      <option value="INTERMEDIATE">Intermediate (Hands-on)</option>
                      <option value="ADVANCED">Advanced (Project Proven)</option>
                      <option value="EXPERT">Expert (Deep Expertise)</option>
                    </select>
                  </div>
                </div>

                {/* Description input */}
                <div>
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Optional: What can you help teach? (e.g. Can guide through React hooks and Vite setup)"
                    value={offeredDescription}
                    onChange={(e) => setOfferedDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingOffered || (!selectedOfferedSkill && !offeredSearch.trim())}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingOffered ? 'Adding...' : 'Add Offered Skill'}</span>
                  </button>
                </div>
              </form>

              {/* Offered Skills Badges / Cards */}
              {profile.offeredSkills.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No skills offered yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Add at least one skill you can teach so classmates can find you and propose a mutual skill exchange.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.offeredSkills.map((item) => {
                    const prof = PROFICIENCY_CONFIG[item.proficiency];
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                                {item.skill.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                {item.skill.category}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteOfferedSkill(item.id, item.skill.name)}
                              title="Remove skill"
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="inline-flex items-center space-x-1.5">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${prof.color} ${prof.bg} ${prof.border}`}
                            >
                              {prof.label}
                            </span>
                          </div>

                          {item.description && (
                            <p className="text-xs text-slate-600 italic line-clamp-2">
                              "{item.description}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: Skills I Want to Learn (Wanted Skills) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Skills I Want to Learn (Wanted Skills)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Select technologies or domains you are eager to pick up from peers across departments.
                  </p>
                </div>
                <span className="inline-flex self-start sm:self-auto items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {profile.wantedSkills.length} Active
                </span>
              </div>

              {/* Add Wanted Skill Form */}
              <form onSubmit={handleAddWantedSkill} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Skill Search / Dropdown */}
                  <div className="md:col-span-2 relative">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Search Master Catalog or Type Custom Skill
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning, UI/UX Design, Docker..."
                        value={selectedWantedSkill ? selectedWantedSkill.name : wantedSearch}
                        onChange={(e) => {
                          setSelectedWantedSkill(null);
                          setWantedSearch(e.target.value);
                        }}
                        className="w-full text-xs pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      {(wantedSearch || selectedWantedSkill) && (
                        <button
                          type="button"
                          onClick={() => {
                            setWantedSearch('');
                            setSelectedWantedSkill(null);
                          }}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Suggestions */}
                    {wantedSearch && !selectedWantedSkill && wantedFiltered.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                        {wantedFiltered.map((skill) => (
                          <div
                            key={skill.id}
                            onClick={() => {
                              setSelectedWantedSkill(skill);
                              setWantedSearch(skill.name);
                            }}
                            className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-none"
                          >
                            <span className="font-semibold text-slate-800">{skill.name}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {skill.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Learning Priority
                    </label>
                    <select
                      value={wantedPriority}
                      onChange={(e) => setWantedPriority(e.target.value as PriorityLevel)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="HIGH">High Priority (Urgent / Core)</option>
                      <option value="MEDIUM">Medium Priority (Semester Goal)</option>
                      <option value="LOW">Low Priority (Curious / Later)</option>
                    </select>
                  </div>
                </div>

                {/* Notes input */}
                <div>
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Optional: What is your learning goal? (e.g. Want to learn for minor project viva)"
                    value={wantedNotes}
                    onChange={(e) => setWantedNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingWanted || (!selectedWantedSkill && !wantedSearch.trim())}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingWanted ? 'Adding...' : 'Add Wanted Skill'}</span>
                  </button>
                </div>
              </form>

              {/* Wanted Skills Badges / Cards */}
              {profile.wantedSkills.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No skills requested yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    List subjects or technologies you want to master so peers with complementary skills can connect with you.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.wantedSkills.map((item) => {
                    const prio = PRIORITY_CONFIG[item.priority];
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                                {item.skill.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                {item.skill.category}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteWantedSkill(item.id, item.skill.name)}
                              title="Remove skill"
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="inline-flex items-center space-x-1.5">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${prio.color} ${prio.bg} ${prio.border}`}
                            >
                              {prio.label}
                            </span>
                          </div>

                          {item.notes && (
                            <p className="text-xs text-slate-600 italic line-clamp-2">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
