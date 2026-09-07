import { useState, useEffect, useRef } from 'react';
import { Save, Upload, User, BookOpen, Award, Code, Phone, Loader2, CheckCircle, Sparkles, Check, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import RizeLogo from '../../components/ui/RizeLogo';
import { AESTHETIC_STUDENT_AVATARS } from '../../components/ui/UserAvatar';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';

const DEPARTMENTS = ['CS', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'Maths', 'Physics', 'MBA', 'Other'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Go', 'TypeScript',
  'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis',
  'Machine Learning', 'Data Science', 'System Design', 'REST APIs', 'GraphQL',
  'Spring Boot', 'Django', 'Flutter', 'Android', 'iOS', 'Kotlin', 'Swift',
  'TensorFlow', 'PyTorch', 'SQL', 'Linux', 'Git', 'Algorithms', 'Data Structures',
];

const Section = ({ icon: Icon, title, children }) => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="var(--accent)" />
      </div>
      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
    {children}
    {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>}
  </div>
);

const inp = {
  width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text-primary)',
  fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", outline: 'none',
};

export default function StudentProfile() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const resumeRef = useRef();

  useEffect(() => {
    studentService.getProfile().then(res => {
      const s = res.data.data.student;
      setProfile(s);
      setForm({
        rollNo: s.rollNo || '',
        registrationNo: s.registrationNo || '',
        department: s.department || '',
        batch: s.batch || '',
        semester: s.semester || '',
        phone: s.phone || '',
        cgpa: s.cgpa || '',
        backlogs: s.backlogs ?? 0,
        activeBacklogs: s.activeBacklogs ?? 0,
        tenthPercentage: s.tenthPercentage || '',
        twelfthPercentage: s.twelfthPercentage || '',
        skills: s.skills || [],
      });
    }).catch(() => toast.error('Failed to load profile.'));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills?.includes(s)) {
      set('skills', [...(form.skills || []), s]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => set('skills', form.skills.filter(s => s !== skill));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, cgpa: Number(form.cgpa) || null, semester: Number(form.semester) || null, backlogs: Number(form.backlogs) || 0, activeBacklogs: Number(form.activeBacklogs) || 0, tenthPercentage: Number(form.tenthPercentage) || null, twelfthPercentage: Number(form.twelfthPercentage) || null };
      await studentService.updateProfile(payload);
      toast.success('Profile updated!');
    } catch { toast.error('Save failed.'); } finally { setSaving(false); }
  };

  const handleSelectAvatar = async (avatarUrl) => {
    setUpdatingAvatar(true);
    try {
      setProfile(p => ({ ...p, profilePhotoUrl: avatarUrl }));
      setUser({ ...user, avatar: avatarUrl, profilePhotoUrl: avatarUrl });
      await studentService.updateProfile({ profilePhotoUrl: avatarUrl });
      toast.success('Aesthetic avatar updated! ✨');
    } catch {
      toast.error('Failed to update avatar.');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Only PDF files allowed.');
    setResumeUploading(true);
    try {
      const res = await studentService.uploadResume(file);
      setProfile(res.data.data.student);
      toast.success('Resume uploaded!');
    } catch { toast.error('Resume upload failed.'); } finally { setResumeUploading(false); }
  };

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const statusColor = { not_placed: 'var(--text-muted)', placed: 'var(--success)', offer_received: 'var(--warning)', opted_out: 'var(--danger)' };
  const statusLabel = { not_placed: 'Actively Seeking', placed: 'Placed', offer_received: 'Offer Received', opted_out: 'Opted Out' };
  const currentAvatar = profile.profilePhotoUrl || user?.avatar || '/avatars/yug.png';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .inp-f:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent); } select.inp-f option { background: var(--bg-elevated); color: var(--text-primary); }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Student Profile</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>Manage your campus placement portfolio and student identity</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor[profile.placementStatus], background: `color-mix(in srgb,${statusColor[profile.placementStatus]} 12%,transparent)`, padding: '0.25rem 0.75rem', borderRadius: 999, border: `1px solid color-mix(in srgb,${statusColor[profile.placementStatus]} 30%,transparent)` }}>
            {statusLabel[profile.placementStatus]}
          </span>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Student Identity Card with Aesthetic Anime Avatar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Circular Anime Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: 92, height: 92, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent)', background: 'var(--bg-elevated)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img
                src={currentAvatar}
                alt={user?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              title="Change aesthetic avatar"
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: '2px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
            >
              <Sparkles size={13} />
            </button>
          </div>

          {/* Student Info */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {user?.name}
              </h2>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 999, background: 'color-mix(in srgb,var(--accent) 15%,transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb,var(--accent) 30%,transparent)' }}>
                Registered Student
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem' }}>{user?.email}</p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ background: 'var(--bg-elevated)', padding: '0.25rem 0.625rem', borderRadius: 6, border: '1px solid var(--border)' }}>
                Roll: <strong style={{ color: 'var(--text-primary)' }}>{profile.rollNo || 'CS2021001'}</strong>
              </span>
              <span style={{ background: 'var(--bg-elevated)', padding: '0.25rem 0.625rem', borderRadius: 6, border: '1px solid var(--border)' }}>
                Dept: <strong style={{ color: 'var(--text-primary)' }}>{profile.department || 'CS'}</strong>
              </span>
              <span style={{ background: 'var(--bg-elevated)', padding: '0.25rem 0.625rem', borderRadius: 6, border: '1px solid var(--border)' }}>
                Batch: <strong style={{ color: 'var(--text-primary)' }}>{profile.batch || '2021-2025'}</strong>
              </span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: 0 }}
              >
                <Sparkles size={14} />
                {showAvatarPicker ? 'Hide Avatar Gallery' : 'Switch Aesthetic Anime Avatar'}
              </button>
            </div>
          </div>
        </div>

        {/* Anime Avatar Gallery */}
        {showAvatarPicker && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Choose Your Unique Aesthetic Avatar
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Handcrafted retro anime sketches matching your campus placement profile
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '0.75rem' }}>
              {AESTHETIC_STUDENT_AVATARS.map((av) => {
                const isSelected = currentAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.url)}
                    disabled={updatingAvatar}
                    style={{
                      position: 'relative',
                      borderRadius: 14,
                      border: isSelected ? '2.5px solid var(--accent)' : '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      padding: 4,
                      cursor: 'pointer',
                      aspectRatio: '1',
                      boxShadow: isSelected ? '0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)' : 'none',
                      transition: 'transform 0.15s, border-color 0.15s',
                    }}
                    title={av.name}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }}
                    />
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resume card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: profile.resumeUrl ? 'color-mix(in srgb,var(--success) 12%,transparent)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            {profile.resumeUrl ? <CheckCircle size={18} color="var(--success)" /> : <Upload size={18} color="var(--text-muted)" />}
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {profile.resumeUrl ? (profile.resumeFileName || 'Resume uploaded') : 'No resume uploaded'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>PDF · Max 5MB · Required to apply to drives</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {profile.resumeUrl && (
            <button
              onClick={() => setShowResumePreview(true)}
              style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', cursor: 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Eye size={13} /> Preview Resume
            </button>
          )}
          <button onClick={() => resumeRef.current?.click()} disabled={resumeUploading}
            style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', gap: '0.375rem', opacity: resumeUploading ? 0.7 : 1 }}>
            {resumeUploading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={13} />}
            {resumeUploading ? 'Uploading...' : (profile.resumeUrl ? 'Replace' : 'Upload PDF')}
          </button>
          <input ref={resumeRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
        </div>
      </div>

      {/* Academic */}
      <Section icon={BookOpen} title="Academic Details">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.875rem' }}>
          {[['Roll Number', 'rollNo'], ['Registration No.', 'registrationNo'], ['Phone', 'phone'], ['Batch (e.g. 2021-2025)', 'batch']].map(([label, key]) => (
            <Field key={key} label={label}>
              <input className="inp-f" style={inp} value={form[key] || ''} onChange={e => set(key, e.target.value)} placeholder={label} />
            </Field>
          ))}
          <Field label="Department">
            <select className="inp-f" style={inp} value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Semester">
            <select className="inp-f" style={inp} value={form.semester} onChange={e => set('semester', e.target.value)}>
              <option value="">Select semester</option>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Academic scores */}
      <Section icon={Award} title="Academic Scores">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.875rem' }}>
          {[['CGPA (out of 10)', 'cgpa', '0-10'], ['Total Backlogs', 'backlogs', '0'], ['Active Backlogs', 'activeBacklogs', '0'], ['10th %', 'tenthPercentage', '0-100'], ['12th %', 'twelfthPercentage', '0-100']].map(([label, key, placeholder]) => (
            <Field key={key} label={label}>
              <input className="inp-f" style={inp} type="number" value={form[key] ?? ''} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
            </Field>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section icon={Code} title="Technical Skills">
        {/* Selected skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem', minHeight: 36 }}>
          {(form.skills || []).map(skill => (
            <span key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid color-mix(in srgb,var(--accent) 30%,transparent)', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 500 }}>
              {skill}
              <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, lineHeight: 1, fontSize: '1rem' }}>×</button>
            </span>
          ))}
          {!form.skills?.length && <span style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)' }}>No skills added yet</span>}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input className="inp-f" style={{ ...inp, flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)}
            placeholder="Type a skill and press Enter"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} />
          <button onClick={() => addSkill(skillInput)}
            style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
            Add
          </button>
        </div>

        {/* Suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {SKILL_SUGGESTIONS.filter(s => !form.skills?.includes(s)).slice(0, 16).map(s => (
            <button key={s} onClick={() => addSkill(s)}
              style={{ padding: '0.1875rem 0.625rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 999, fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              + {s}
            </button>
          ))}
        </div>
      </Section>

      {/* PDF Resume Preview Modal */}
      <PdfPreviewModal
        isOpen={showResumePreview}
        onClose={() => setShowResumePreview(false)}
        pdfUrl={profile?.resumeUrl}
        candidateName={user?.name}
        title="My Uploaded Resume"
      />
    </div>
  );
}
