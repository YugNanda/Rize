import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { driveService } from '../../services/dataService';

const DEPARTMENTS = ['CS', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'Maths', 'Physics', 'MBA'];

const fieldStyle = { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' };

const Field = ({ label, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}</label>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
    <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: '1.125rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{title}</h2>
    {children}
  </div>
);

const EMPTY = {
  title: '', jobRole: '', jobType: 'full-time', location: '', description: '',
  'package.min': '', 'package.max': '',
  applicationDeadline: '', driveDate: '',
  status: 'draft',
  'eligibility.minCGPA': '', 'eligibility.maxBacklogs': '0',
  'eligibility.min10Percentage': '', 'eligibility.min12Percentage': '',
  allowedDepartments: [], requiredSkills: [],
};

const toLocalDate = (d) => { if (!d) return ''; return new Date(d).toISOString().slice(0, 10); };

export default function DriveForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    driveService.getById(id).then(res => {
      const d = res.data.data.drive;
      setForm({
        title: d.title, jobRole: d.jobRole, jobType: d.jobType, location: d.location, description: d.description, status: d.status,
        'package.min': d.package?.min || '', 'package.max': d.package?.max || '',
        applicationDeadline: toLocalDate(d.applicationDeadline), driveDate: toLocalDate(d.driveDate),
        'eligibility.minCGPA': d.eligibility?.minCGPA || '',
        'eligibility.maxBacklogs': d.eligibility?.maxBacklogs ?? 0,
        'eligibility.min10Percentage': d.eligibility?.min10Percentage || '',
        'eligibility.min12Percentage': d.eligibility?.min12Percentage || '',
        allowedDepartments: d.eligibility?.allowedDepartments || [],
        requiredSkills: d.eligibility?.requiredSkills || [],
      });
      setLoading(false);
    }).catch(() => { toast.error('Drive not found.'); navigate('/company/drives'); });
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDept = (dept) => {
    setForm(f => ({ ...f, allowedDepartments: f.allowedDepartments.includes(dept) ? f.allowedDepartments.filter(d => d !== dept) : [...f.allowedDepartments, dept] }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, s] }));
    setSkillInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.jobRole || !form.applicationDeadline) return toast.error('Fill required fields.');
    setSaving(true);
    try {
      const payload = {
        title: form.title, jobRole: form.jobRole, jobType: form.jobType, location: form.location, description: form.description, status: form.status,
        package: { min: Number(form['package.min']) || 0, max: Number(form['package.max']) || 0 },
        applicationDeadline: form.applicationDeadline,
        driveDate: form.driveDate || undefined,
        eligibility: {
          minCGPA: Number(form['eligibility.minCGPA']) || 0,
          maxBacklogs: Number(form['eligibility.maxBacklogs']) ?? 0,
          min10Percentage: Number(form['eligibility.min10Percentage']) || 0,
          min12Percentage: Number(form['eligibility.min12Percentage']) || 0,
          allowedDepartments: form.allowedDepartments,
          requiredSkills: form.requiredSkills,
        },
      };
      if (isEdit) {
        await driveService.update(id, payload);
        window.dispatchEvent(new Event('rize:drive_updated'));
        toast.success('Drive updated successfully.');
      } else {
        await driveService.create(payload);
        window.dispatchEvent(new Event('rize:drive_created'));
        toast.success('Drive submitted! Forwarded to College T&P Cell for approval.', { duration: 5000 });
      }
      navigate('/company/drives');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem', fontFamily: "'Inter',sans-serif" }}>
      <style>{`.df:focus{border-color:var(--accent)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 14%,transparent)} @keyframes spin{to{transform:rotate(360deg)}} select.df option{background:var(--bg-elevated)}`}</style>

      <button onClick={() => navigate('/company/drives')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.5rem', padding: 0, fontFamily: "'Inter',sans-serif" }}>
        <ArrowLeft size={16} /> Back to drives
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {isEdit ? 'Edit Drive' : 'New Placement Drive'}
        </h1>
        <button onClick={handleSubmit} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Drive'}
        </button>
      </div>

      {/* Governance Banner */}
      <div style={{
        padding: '0.875rem 1.125rem',
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 10,
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <ShieldAlert size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          <strong>Institutional T&P Cell Governance:</strong> Newly created drives are submitted for <strong>T&P Cell Review</strong>. Once approved, the drive will be published live to eligible students with an instant notification.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Section title="Basic Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
            <Field label="Drive Title" required>
              <input className="df" style={fieldStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., SDE-1 — Payments Platform" />
            </Field>
            <Field label="Job Role" required>
              <input className="df" style={fieldStyle} value={form.jobRole} onChange={e => set('jobRole', e.target.value)} placeholder="e.g., Software Development Engineer" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
            <Field label="Job Type">
              <select className="df" style={fieldStyle} value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                {['full-time', 'internship', 'part-time', 'contract'].map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="df" style={fieldStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Pending T&P Approval (Draft)</option>
                <option value="open">Open (Direct Publish)</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
            <Field label="Location">
              <input className="df" style={fieldStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g., Bengaluru / Hybrid" />
            </Field>
          </div>
          <Field label="Job Description">
            <textarea className="df" style={{ ...fieldStyle, minHeight: 140, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed job description, responsibilities, compensation breakdown..." />
          </Field>
        </Section>

        <Section title="Package & Dates">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.875rem' }}>
            <Field label="Min CTC (LPA)">
              <input className="df" style={fieldStyle} type="number" value={form['package.min']} onChange={e => set('package.min', e.target.value)} placeholder="e.g., 18" />
            </Field>
            <Field label="Max CTC (LPA)">
              <input className="df" style={fieldStyle} type="number" value={form['package.max']} onChange={e => set('package.max', e.target.value)} placeholder="e.g., 28" />
            </Field>
            <Field label="Application Deadline" required>
              <input className="df" style={fieldStyle} type="date" value={form.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)} />
            </Field>
            <Field label="Drive Date">
              <input className="df" style={fieldStyle} type="date" value={form.driveDate} onChange={e => set('driveDate', e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Eligibility Criteria">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
            <Field label="Min CGPA">
              <input className="df" style={fieldStyle} type="number" step="0.1" value={form['eligibility.minCGPA']} onChange={e => set('eligibility.minCGPA', e.target.value)} placeholder="e.g., 7.5" />
            </Field>
            <Field label="Max Backlogs">
              <input className="df" style={fieldStyle} type="number" value={form['eligibility.maxBacklogs']} onChange={e => set('eligibility.maxBacklogs', e.target.value)} />
            </Field>
            <Field label="Min 10th %">
              <input className="df" style={fieldStyle} type="number" value={form['eligibility.min10Percentage']} onChange={e => set('eligibility.min10Percentage', e.target.value)} placeholder="e.g., 75" />
            </Field>
            <Field label="Min 12th %">
              <input className="df" style={fieldStyle} type="number" value={form['eligibility.min12Percentage']} onChange={e => set('eligibility.min12Percentage', e.target.value)} placeholder="e.g., 75" />
            </Field>
          </div>

          <Field label="Allowed Departments (leave empty for all)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
              {DEPARTMENTS.map(d => (
                <button type="button" key={d} onClick={() => toggleDept(d)}
                  style={{ padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 500, border: `1px solid ${form.allowedDepartments.includes(d) ? 'var(--accent)' : 'var(--border)'}`, background: form.allowedDepartments.includes(d) ? 'var(--accent-subtle)' : 'transparent', color: form.allowedDepartments.includes(d) ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                  {d}
                </button>
              ))}
            </div>
          </Field>

          <div style={{ marginTop: '1rem' }}>
            <Field label="Required Skills">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input className="df" style={{ ...fieldStyle, flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Type and press Enter" />
                <button type="button" onClick={addSkill} style={{ padding: '0.5rem 0.875rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {form.requiredSkills.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid color-mix(in srgb,var(--accent) 25%,transparent)', borderRadius: 999, fontSize: '0.8125rem' }}>
                    {s} <button type="button" onClick={() => setForm(f => ({ ...f, requiredSkills: f.requiredSkills.filter(r => r !== s) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, lineHeight: 1, fontSize: '0.875rem' }}>×</button>
                  </span>
                ))}
              </div>
            </Field>
          </div>
        </Section>
      </form>
    </div>
  );
}
