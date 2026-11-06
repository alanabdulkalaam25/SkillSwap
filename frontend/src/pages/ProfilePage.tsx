import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Hash,
  Layers,
  Mail,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileSkeleton } from '../components/LoadingSkeleton';
import { UserProfile, Skill, ProficiencyLevel, PriorityLevel } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge, type BadgeProps } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { cn } from '../lib/utils';

type BadgeVariant = BadgeProps['variant'];

const PROFICIENCY_CONFIG: Record<ProficiencyLevel, { label: string; variant: BadgeVariant }> = {
  BEGINNER: { label: 'Beginner', variant: 'muted' },
  INTERMEDIATE: { label: 'Intermediate', variant: 'secondary' },
  ADVANCED: { label: 'Advanced', variant: 'default' },
  EXPERT: { label: 'Expert', variant: 'success' },
};

const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; variant: BadgeVariant }> = {
  LOW: { label: 'Low priority', variant: 'muted' },
  MEDIUM: { label: 'Medium priority', variant: 'warning' },
  HIGH: { label: 'High priority', variant: 'destructive' },
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editSemester, setEditSemester] = useState(1);
  const [isSavingBio, setIsSavingBio] = useState(false);

  const [offeredDialogOpen, setOfferedDialogOpen] = useState(false);
  const [offeredSearch, setOfferedSearch] = useState('');
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<Skill | null>(null);
  const [offeredProficiency, setOfferedProficiency] = useState<ProficiencyLevel>('INTERMEDIATE');
  const [offeredDescription, setOfferedDescription] = useState('');
  const [isAddingOffered, setIsAddingOffered] = useState(false);

  const [wantedDialogOpen, setWantedDialogOpen] = useState(false);
  const [wantedSearch, setWantedSearch] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState<Skill | null>(null);
  const [wantedPriority, setWantedPriority] = useState<PriorityLevel>('MEDIUM');
  const [wantedNotes, setWantedNotes] = useState('');
  const [isAddingWanted, setIsAddingWanted] = useState(false);

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        const [profileRes, catalogRes] = await Promise.all([
          fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/skills'),
        ]);

        const profileData = await profileRes.json();
        if (!profileRes.ok || !profileData.success || !profileData.profile) {
          throw new Error(profileData.error || 'Could not load your student profile.');
        }
        setProfile(profileData.profile);
        setEditName(profileData.profile.name);
        setEditBio(profileData.profile.bio || '');
        setEditDepartment(profileData.profile.department);
        setEditSemester(profileData.profile.semester);

        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();
          if (catalogData.success && catalogData.skills) setCatalogSkills(catalogData.skills);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to synchronize profile data with server.';
        setLoadError(message);
        notify('error', message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [token, loadAttempt]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setIsSavingBio(true);

    try {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        setIsEditingDetails(false);
        notify('success', 'Profile updated.');
      } else {
        notify('error', data.error || 'Failed to update profile details.');
      }
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Network error updating profile.');
    } finally {
      setIsSavingBio(false);
    }
  };

  const resetOfferedDialog = () => {
    setOfferedSearch('');
    setSelectedOfferedSkill(null);
    setOfferedDescription('');
    setOfferedProficiency('INTERMEDIATE');
  };

  const resetWantedDialog = () => {
    setWantedSearch('');
    setSelectedWantedSkill(null);
    setWantedNotes('');
    setWantedPriority('MEDIUM');
  };

  const handleAddOfferedSkill = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const skillName = selectedOfferedSkill ? selectedOfferedSkill.name : offeredSearch.trim();
    if (!skillName) {
      notify('error', 'Choose or type a skill to teach.');
      return;
    }

    setIsAddingOffered(true);
    try {
      const res = await fetch('/api/profile/skills/offered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          skillId: selectedOfferedSkill?.id,
          skillName: !selectedOfferedSkill ? skillName : undefined,
          proficiency: offeredProficiency,
          description: offeredDescription.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.offeredSkill) {
        setProfile((prev) => {
          if (!prev) return null;
          const filtered = prev.offeredSkills.filter((item) => item.skillId !== data.offeredSkill.skillId);
          return { ...prev, offeredSkills: [data.offeredSkill, ...filtered] };
        });
        resetOfferedDialog();
        setOfferedDialogOpen(false);
        notify('success', data.message || `Added ${skillName} to your skills.`);
      } else {
        notify('error', data.error || 'Failed to add offered skill.');
      }
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Network error adding skill.');
    } finally {
      setIsAddingOffered(false);
    }
  };

  const handleDeleteOfferedSkill = async (id: string, skillName: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/skills/offered/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev) => (prev ? { ...prev, offeredSkills: prev.offeredSkills.filter((item) => item.id !== id) } : null));
        notify('success', `Removed ${skillName}.`);
      } else {
        notify('error', data.error || 'Failed to delete skill.');
      }
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Network error removing skill.');
    }
  };

  const handleAddWantedSkill = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const skillName = selectedWantedSkill ? selectedWantedSkill.name : wantedSearch.trim();
    if (!skillName) {
      notify('error', 'Choose or type a skill you want to learn.');
      return;
    }

    setIsAddingWanted(true);
    try {
      const res = await fetch('/api/profile/skills/wanted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
          const filtered = prev.wantedSkills.filter((item) => item.skillId !== data.wantedSkill.skillId);
          return { ...prev, wantedSkills: [data.wantedSkill, ...filtered] };
        });
        resetWantedDialog();
        setWantedDialogOpen(false);
        notify('success', data.message || `Added ${skillName} to wanted skills.`);
      } else {
        notify('error', data.error || 'Failed to add wanted skill.');
      }
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Network error adding wanted skill.');
    } finally {
      setIsAddingWanted(false);
    }
  };

  const handleDeleteWantedSkill = async (id: string, skillName: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/skills/wanted/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev) => (prev ? { ...prev, wantedSkills: prev.wantedSkills.filter((item) => item.id !== id) } : null));
        notify('success', `Removed ${skillName}.`);
      } else {
        notify('error', data.error || 'Failed to delete wanted skill.');
      }
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Network error removing wanted skill.');
    }
  };

  const offeredFiltered = catalogSkills.filter((skill) => {
    const query = offeredSearch.toLowerCase().trim();
    if (!query) return false;
    const alreadyOffered = profile?.offeredSkills.some((item) => item.skillId === skill.id);
    return !alreadyOffered && (skill.name.toLowerCase().includes(query) || skill.category.toLowerCase().includes(query));
  });

  const wantedFiltered = catalogSkills.filter((skill) => {
    const query = wantedSearch.toLowerCase().trim();
    if (!query) return false;
    const alreadyWanted = profile?.wantedSkills.some((item) => item.skillId === skill.id);
    return !alreadyWanted && (skill.name.toLowerCase().includes(query) || skill.category.toLowerCase().includes(query));
  });

  const hasBio = Boolean(profile?.bio && profile.bio.trim().length > 10);
  const offeredCount = profile?.offeredSkills.length || 0;
  const wantedCount = profile?.wantedSkills.length || 0;
  let completionScore = 20;
  if (hasBio) completionScore += 25;
  if (offeredCount >= 1) completionScore += 30;
  if (wantedCount >= 1) completionScore += 25;

  if (isLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-destructive">
          <AlertCircle className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-heading-md font-semibold text-foreground">Profile unavailable</h1>
        <p className="mt-2 text-body-sm text-muted-foreground">{loadError || 'We could not load your profile right now.'}</p>
        <Button onClick={() => setLoadAttempt((value) => value + 1)} className="mt-5">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="fixed bottom-24 right-4 z-50 animate-in sm:right-6 lg:bottom-6">
          <Alert variant={feedback.type === 'success' ? 'success' : 'destructive'} className="w-full max-w-sm shadow-soft-lg">
            <AlertDescription className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
              <span className="text-caption font-medium">{feedback.message}</span>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-body font-semibold text-secondary-foreground">
            {profile.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-display-sm font-semibold text-foreground">{profile.name}</h1>
              <Badge variant="outline" className="gap-1.5 py-1 font-normal text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
                Verified
              </Badge>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-muted-foreground">
              <span>{profile.department}</span>
              <span className="text-border">·</span>
              <span>Semester {profile.semester}</span>
              <span className="text-border">·</span>
              <span className="font-mono text-caption">{profile.rollNumber}</span>
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-2 sm:w-56">
          <div className="flex items-center justify-between text-caption">
            <span className="text-muted-foreground">Profile readiness</span>
            <span className={cn('font-mono text-caption-sm', completionScore === 100 ? 'text-success' : 'text-foreground')}>
              {completionScore}%
            </span>
          </div>
          <Progress value={completionScore} className="h-1.5" />
          <p className="text-caption-sm leading-relaxed text-muted-foreground">
            A complete profile helps the right peers find you.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        {/* ---------- Left rail ---------- */}
        <div className="space-y-4 xl:sticky xl:top-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
              <CardTitle>Student details</CardTitle>
              {!isEditingDetails && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingDetails(true)} className="gap-1.5 px-2">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-4">
              {!isEditingDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-caption-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">About</p>
                    {profile.bio && profile.bio.trim() ? (
                      <p className="mt-2 text-caption leading-relaxed text-muted-foreground">{profile.bio}</p>
                    ) : (
                      <p className="mt-2 rounded-lg border border-dashed border-border p-3 text-caption leading-relaxed text-muted-foreground">
                        No bio yet. Add a sentence about your interests so peers know what you are working on.
                      </p>
                    )}
                  </div>

                  <Separator />

                  <dl className="space-y-3 text-caption">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" /> Department
                      </dt>
                      <dd className="max-w-[60%] text-right font-medium text-foreground">{profile.department}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" /> Semester
                      </dt>
                      <dd className="font-medium text-foreground">{profile.semester}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" /> Roll number
                      </dt>
                      <dd className="font-mono text-caption-sm font-medium text-foreground">{profile.rollNumber}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </dt>
                      <dd className="max-w-[60%] truncate text-right font-medium text-foreground">{profile.email}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full name</Label>
                    <Input id="edit-name" required value={editName} onChange={(event) => setEditName(event.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-bio">Bio</Label>
                      <span className="text-caption-sm text-muted-foreground">{editBio.length}/600</span>
                    </div>
                    <Textarea
                      id="edit-bio"
                      rows={4}
                      maxLength={600}
                      value={editBio}
                      onChange={(event) => setEditBio(event.target.value)}
                      placeholder="What are you learning, building, or happy to help with?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Select value={editDepartment} onValueChange={setEditDepartment}>
                      <SelectTrigger id="edit-department">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-semester">Semester</Label>
                    <Input
                      id="edit-semester"
                      type="number"
                      min={1}
                      max={10}
                      required
                      value={editSemester}
                      onChange={(event) => setEditSemester(Number(event.target.value))}
                    />
                  </div>

                  <div className="flex items-center gap-2 border-t border-border pt-4">
                    <Button type="submit" size="sm" disabled={isSavingBio} className="flex-1 gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      {isSavingBio ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingDetails(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-caption font-medium text-foreground">Portfolio</p>
              <div className="mt-3 grid grid-cols-2 divide-x divide-border rounded-lg border border-border">
                <div className="p-3 text-center">
                  <p className="text-heading-lg font-semibold text-foreground">{offeredCount}</p>
                  <p className="mt-0.5 text-caption-sm text-muted-foreground">Can teach</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-heading-lg font-semibold text-foreground">{wantedCount}</p>
                  <p className="mt-0.5 text-caption-sm text-muted-foreground">Want to learn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ---------- Skills ---------- */}
        <div className="min-w-0 space-y-4">
          {/* Offered */}
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-border pb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Skills I can teach</CardTitle>
                </div>
                <p className="mt-1 text-caption text-muted-foreground">
                  Things you can genuinely help a classmate with.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="muted" className="hidden font-normal sm:inline-flex">
                  {offeredCount}
                </Badge>
                <Button size="sm" onClick={() => setOfferedDialogOpen(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {offeredCount === 0 ? (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-10 text-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <h3 className="mt-3 text-caption font-medium text-foreground">No skills listed yet</h3>
                  <p className="mt-1 max-w-sm text-caption leading-relaxed text-muted-foreground">
                    Add at least one skill you can teach so peers can find you and propose an exchange.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setOfferedDialogOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Add your first skill
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {profile.offeredSkills.map((item) => {
                    const config = PROFICIENCY_CONFIG[item.proficiency];
                    return (
                      <div key={item.id} className="group flex items-start justify-between gap-2 rounded-lg border border-border bg-background p-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-caption font-medium text-foreground">{item.skill.name}</p>
                          <p className="mt-0.5 truncate text-caption-sm text-muted-foreground">{item.skill.category}</p>
                          {item.description && (
                            <p className="mt-1.5 line-clamp-2 text-caption-sm leading-relaxed text-muted-foreground">{item.description}</p>
                          )}
                          <Badge variant={config.variant} className="mt-2 font-normal">
                            {config.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground opacity-70 hover:bg-destructive-muted hover:text-destructive group-hover:opacity-100"
                          onClick={() => void handleDeleteOfferedSkill(item.id, item.skill.name)}
                          title={`Remove ${item.skill.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wanted */}
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-border pb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Skills I want to learn</CardTitle>
                </div>
                <p className="mt-1 text-caption text-muted-foreground">
                  Goals peers can help you make progress on.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="muted" className="hidden font-normal sm:inline-flex">
                  {wantedCount}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => setWantedDialogOpen(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {wantedCount === 0 ? (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-10 text-center">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <h3 className="mt-3 text-caption font-medium text-foreground">No learning goals yet</h3>
                  <p className="mt-1 max-w-sm text-caption leading-relaxed text-muted-foreground">
                    List the skills you want to pick up so peers with complementary strengths can reach out.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setWantedDialogOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Add a learning goal
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {profile.wantedSkills.map((item) => {
                    const config = PRIORITY_CONFIG[item.priority];
                    return (
                      <div key={item.id} className="group flex items-start justify-between gap-2 rounded-lg border border-border bg-background p-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-caption font-medium text-foreground">{item.skill.name}</p>
                          <p className="mt-0.5 truncate text-caption-sm text-muted-foreground">{item.skill.category}</p>
                          {item.notes && (
                            <p className="mt-1.5 line-clamp-2 text-caption-sm leading-relaxed text-muted-foreground">{item.notes}</p>
                          )}
                          <Badge variant={config.variant} className="mt-2 font-normal">
                            {config.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground opacity-70 hover:bg-destructive-muted hover:text-destructive group-hover:opacity-100"
                          onClick={() => void handleDeleteWantedSkill(item.id, item.skill.name)}
                          title={`Remove ${item.skill.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---------- Add offered skill dialog ---------- */}
      <Dialog
        open={offeredDialogOpen}
        onOpenChange={(open) => {
          setOfferedDialogOpen(open);
          if (!open) resetOfferedDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a skill you can teach</DialogTitle>
            <DialogDescription>
              Pick from the campus catalog or add a custom skill. Be honest about your level.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOfferedSkill} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offered-skill">Skill</Label>

              {selectedOfferedSkill ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-caption font-medium text-foreground">{selectedOfferedSkill.name}</p>
                    <p className="truncate text-caption-sm text-muted-foreground">{selectedOfferedSkill.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfferedSkill(null);
                      setOfferedSearch('');
                    }}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear selected skill"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="offered-skill"
                    autoComplete="off"
                    placeholder="Search or type a skill…"
                    value={offeredSearch}
                    onChange={(event) => setOfferedSearch(event.target.value)}
                    className="pl-9"
                  />
                  {offeredSearch && offeredFiltered.length > 0 && (
                    <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-soft-lg">
                      {offeredFiltered.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => {
                            setSelectedOfferedSkill(skill);
                            setOfferedSearch(skill.name);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-caption transition-colors hover:bg-accent"
                        >
                          <span className="truncate text-foreground">{skill.name}</span>
                          <span className="shrink-0 text-caption-sm text-muted-foreground">{skill.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {offeredSearch && offeredFiltered.length === 0 && (
                    <p className="mt-1.5 text-caption-sm text-muted-foreground">
                      No catalog match — this will be added as a custom skill.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="offered-level">Proficiency</Label>
              <Select value={offeredProficiency} onValueChange={(value) => setOfferedProficiency(value as ProficiencyLevel)}>
                <SelectTrigger id="offered-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner — fundamentals</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate — hands-on</SelectItem>
                  <SelectItem value="ADVANCED">Advanced — project proven</SelectItem>
                  <SelectItem value="EXPERT">Expert — deep expertise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offered-description">What can you help with? (optional)</Label>
              <Input
                id="offered-description"
                maxLength={300}
                placeholder="e.g. React hooks and a clean Vite setup"
                value={offeredDescription}
                onChange={(event) => setOfferedDescription(event.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOfferedDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingOffered || (!selectedOfferedSkill && !offeredSearch.trim())}>
                {isAddingOffered ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Plus className="h-3.5 w-3.5" />}
                Add skill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------- Add wanted skill dialog ---------- */}
      <Dialog
        open={wantedDialogOpen}
        onOpenChange={(open) => {
          setWantedDialogOpen(open);
          if (!open) resetWantedDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a skill you want to learn</DialogTitle>
            <DialogDescription>
              Set a priority so peers know which of your goals matter most right now.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddWantedSkill} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wanted-skill">Skill</Label>

              {selectedWantedSkill ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-caption font-medium text-foreground">{selectedWantedSkill.name}</p>
                    <p className="truncate text-caption-sm text-muted-foreground">{selectedWantedSkill.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWantedSkill(null);
                      setWantedSearch('');
                    }}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear selected skill"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="wanted-skill"
                    autoComplete="off"
                    placeholder="Search or type a skill…"
                    value={wantedSearch}
                    onChange={(event) => setWantedSearch(event.target.value)}
                    className="pl-9"
                  />
                  {wantedSearch && wantedFiltered.length > 0 && (
                    <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-soft-lg">
                      {wantedFiltered.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => {
                            setSelectedWantedSkill(skill);
                            setWantedSearch(skill.name);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-caption transition-colors hover:bg-accent"
                        >
                          <span className="truncate text-foreground">{skill.name}</span>
                          <span className="shrink-0 text-caption-sm text-muted-foreground">{skill.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {wantedSearch && wantedFiltered.length === 0 && (
                    <p className="mt-1.5 text-caption-sm text-muted-foreground">
                      No catalog match — this will be added as a custom skill.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wanted-priority">Priority</Label>
              <Select value={wantedPriority} onValueChange={(value) => setWantedPriority(value as PriorityLevel)}>
                <SelectTrigger id="wanted-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High — urgent or core</SelectItem>
                  <SelectItem value="MEDIUM">Medium — this semester</SelectItem>
                  <SelectItem value="LOW">Low — curious for later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wanted-notes">Why do you want to learn it? (optional)</Label>
              <Input
                id="wanted-notes"
                maxLength={300}
                placeholder="e.g. Needed for my minor project viva"
                value={wantedNotes}
                onChange={(event) => setWantedNotes(event.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setWantedDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingWanted || (!selectedWantedSkill && !wantedSearch.trim())}>
                {isAddingWanted ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Plus className="h-3.5 w-3.5" />}
                Add skill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
