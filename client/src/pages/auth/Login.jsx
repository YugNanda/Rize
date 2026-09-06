import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, KeyRound, X, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema } from '../../schemas/auth.schema';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import RizeLogo from '../../components/ui/RizeLogo';
import AuthThemeToggle from '../../components/ui/AuthThemeToggle';
import { useThemeStore } from '../../store/themeStore';

/* ── Animated counter ── */
const Counter = ({ end, duration = 2200, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const METRICS = [
  { value: 12400, suffix: '+', label: 'Students placed' },
  { value: 340,   suffix: '+', label: 'Partner companies' },
  { value: 98,    suffix: '%', label: 'Offer acceptance rate' },
];

const MOTIVATIONAL_QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Dreams don't work unless you do.", author: "John C. Maxwell" },
  { text: "Self-discipline begins with the mastery of your thoughts. If you don't control what you think, you can't control what you do.", author: "Napoleon Hill" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
];

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: 'stu@123',
    },
  });

  // Role selector for easy login
  const [selectedRole, setSelectedRole] = useState('student');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (role === 'student') {
      setValue('password', 'stu@123');
    } else if (role === 'company') {
      setValue('password', 'comp@123');
    } else {
      setValue('password', 'tp@123');
    }
  };

  // ─── Forgot Password Modal States ───
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'code'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);

  const openForgotModal = () => {
    const currentEmail = watch('email') || '';
    setForgotEmail(currentEmail);
    setForgotStep('email');
    setForgotCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowForgotModal(true);
  };

  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }
    setForgotSubmitting(true);
    try {
      const res = await authService.forgotPassword(forgotEmail.trim());
      // USER SPECIFIC REQUIREMENT: JS alert popup tell the 6-digit code
      window.alert(`Your Rize 6-digit password reset code is: ${res.data.code}`);
      setForgotStep('code');
      toast.success('Verification code generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate reset code.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!forgotCode.trim() || forgotCode.trim().length !== 6) {
      toast.error('Please enter the valid 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setForgotSubmitting(true);
    try {
      await authService.resetPassword(forgotEmail.trim(), forgotCode.trim(), newPassword);
      toast.success('Password reset successfully! Please sign in with your new password.');
      setValue('email', forgotEmail.trim());
      setValue('password', newPassword);
      setShowForgotModal(false);
      setForgotCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await authService.login(data);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const from = location.state?.from?.pathname;
      const dashMap = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        admin: '/tpcell/dashboard',
        tpcell: '/tpcell/dashboard',
      };
      navigate(from || dashMap[res.data.user.role] || '/student/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  // Theme-specific brand panel tint
  const panelBg = theme === 'dark'
    ? 'linear-gradient(160deg, #0D0D14 0%, #090912 100%)'
    : theme === 'solarized'
    ? 'linear-gradient(160deg, #EDE4CE 0%, #E5DAC0 100%)'
    : 'linear-gradient(160deg, #F0F0F8 0%, #E8E8F4 100%)';

  const orbColor1 = theme === 'solarized' ? 'rgba(38,139,210,0.15)' : 'rgba(99,102,241,0.14)';
  const orbColor2 = theme === 'solarized' ? 'rgba(133,153,0,0.10)'  : 'rgba(99,102,241,0.08)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      <style>{`
        /* ── Orbs ── */
        .lo1 { position:absolute;width:480px;height:480px;border-radius:50%;filter:blur(90px);opacity:1;top:-140px;left:-100px;animation:lo_drift 20s ease-in-out infinite alternate; }
        .lo2 { position:absolute;width:380px;height:380px;border-radius:50%;filter:blur(80px);opacity:1;bottom:-80px;right:-60px;animation:lo_drift 26s ease-in-out infinite alternate;animation-delay:-10s; }
        @keyframes lo_drift { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-36px) scale(1.04)} }

        /* ── Grid ── */
        .lo-grid {
          position:absolute;inset:0;pointer-events:none;
          background-image:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
          opacity: 0.6;
        }

        /* ── Brand panel ── */
        .lo-brand {
          position:relative; width:46%; display:flex; flex-direction:column;
          justify-content:space-between; padding:2.75rem;
          border-right:1px solid var(--border); overflow:hidden;
        }
        @media(max-width:1024px){.lo-brand{display:none;}}

        /* ── Form panel ── */
        .lo-form-panel {
          flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:2.5rem; position:relative; overflow:hidden;
        }
        .lo-form-panel::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 55% 45% at 50% 0%, var(--accent-subtle) 0%, transparent 70%);
        }

        /* ── Hero ── */
        .lo-hero { font-size:2.5rem; font-weight:800; letter-spacing:-0.03em; color:var(--text-primary); line-height:1.1; margin:0; }
        .lo-accent { background:linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* ── Metrics ── */
        .lo-metric { padding:1rem 1.125rem; background:var(--bg-elevated); border:1px solid var(--border); border-radius:10px; margin-bottom:0.5rem; transition:border-color 0.2s; }
        .lo-metric:hover { border-color:var(--border-strong); }
        .lo-metric-val { font-size:1.75rem; font-weight:700; letter-spacing:-0.03em; color:var(--text-primary); }
        .lo-metric-lbl { font-size:0.75rem; color:var(--text-muted); margin-top:1px; }

        /* ── Form card ── */
        .lo-card-form { width:100%;max-width:390px;transform:translateY(20px);opacity:0;transition:all 0.6s cubic-bezier(0.16,1,0.3,1); }
        .lo-card-form.vis { transform:translateY(0);opacity:1; }

        /* ── Inputs ── */
        .lo-inp {
          width:100%; background:var(--bg-elevated); border:1px solid var(--border);
          border-radius:8px; padding:0.625rem 0.875rem; color:var(--text-primary);
          font-size:0.875rem; font-family:'Inter',sans-serif; outline:none;
          transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
        }
        .lo-inp::placeholder { color:var(--text-disabled); }
        .lo-inp:focus { border-color:var(--accent); background:var(--bg-overlay); box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent); }
        .lo-inp.err { border-color:var(--danger); }
        .lo-inp.err:focus { box-shadow:0 0 0 3px color-mix(in srgb,var(--danger) 18%,transparent); }

        /* ── Submit button ── */
        .lo-btn {
          width:100%; padding:0.6875rem 1.25rem;
          background:linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          color:#fff; border:none; border-radius:8px;
          font-size:0.875rem; font-weight:600; font-family:'Inter',sans-serif;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem;
          position:relative; overflow:hidden;
          transition:opacity 0.2s,transform 0.15s,box-shadow 0.2s;
          box-shadow:0 4px 16px color-mix(in srgb,var(--accent) 35%,transparent);
        }
        .lo-btn::before { content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transition:left 0.5s; }
        .lo-btn:hover::before { left:100%; }
        .lo-btn:hover { transform:translateY(-1px); box-shadow:0 6px 24px color-mix(in srgb,var(--accent) 45%,transparent); }
        .lo-btn:active { transform:translateY(0); }
        .lo-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }

        /* ── Stagger in ── */
        .ls { opacity:0;transform:translateY(10px);animation:ls_in 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes ls_in { to{opacity:1;transform:translateY(0);} }

        /* ── Outline btn ── */
        .lo-outline-btn {
          display:block;width:100%;padding:0.625rem;border:1px solid var(--border);border-radius:8px;
          text-align:center;font-size:0.875rem;font-weight:500;color:var(--text-muted);
          text-decoration:none;font-family:'Inter',sans-serif;
          transition:border-color 0.2s,color 0.2s,background 0.2s;
          background:transparent;
        }
        .lo-outline-btn:hover { border-color:var(--accent);color:var(--text-primary);background:var(--accent-subtle); }

        /* ── Spin ── */
        .lo-spin { animation:lo_spin 0.7s linear infinite; }
        @keyframes lo_spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ═══ LEFT BRAND PANEL ═══ */}
      <div className="lo-brand" style={{ background: panelBg }}>
        {/* Orbs */}
        <div className="lo1" style={{ background: `radial-gradient(circle, ${orbColor1}, transparent)` }} />
        <div className="lo2" style={{ background: `radial-gradient(circle, ${orbColor2}, transparent)` }} />
        <div className="lo-grid" />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RizeLogo size="md" />
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="lo-hero">
            The platform that<br />
            <span className="lo-accent">places futures.</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.875rem', lineHeight: 1.65, maxWidth: 320 }}>
            Intelligent placement management trusted by top institutions and Fortune 500 companies.
          </p>

          {/* Metrics */}
          <div style={{ marginTop: '2rem' }}>
            {METRICS.map(({ value, suffix, label }) => (
              <div key={label} className="lo-metric">
                <div className="lo-metric-val"><Counter end={value} suffix={suffix} /></div>
                <div className="lo-metric-lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational discipline & success quote (refreshes each time) */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: '2rem' }}>
          <div style={{
            padding: '0.875rem 1.125rem',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            marginBottom: '1rem',
            maxWidth: 380,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <p style={{
              fontSize: '0.8125rem',
              lineHeight: 1.55,
              color: 'var(--text-secondary)',
              margin: 0,
              fontStyle: 'italic',
              fontWeight: 500,
            }}>
              "{quote.text}"
            </p>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent)',
              marginTop: '0.4rem',
              marginBottom: 0,
              letterSpacing: '0.01em',
            }}>
              — {quote.author}
            </p>
          </div>

          <p style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', margin: 0 }}>
            © 2026 Rize · Enterprise Placement Platform
          </p>
        </div>
      </div>

      {/* ═══ RIGHT FORM PANEL ═══ */}
      <div className="lo-form-panel">
        {/* Top-right: theme toggle */}
        <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem' }}>
          <AuthThemeToggle />
        </div>

        {/* Mobile logo */}
        <div style={{ position: 'absolute', top: '1.25rem', left: '1.5rem' }} className="lo-mobile-logo">
          <RizeLogo size="sm" />
        </div>
        <style>{`.lo-mobile-logo{display:none;}@media(max-width:1024px){.lo-mobile-logo{display:flex;}}`}</style>

        <div className={`lo-card-form ${mounted ? 'vis' : ''}`}>
          {/* Heading */}
          <div className="ls" style={{ animationDelay: '0.08s', marginBottom: '1.875rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Sign in</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Access your placement dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Role selector tabs */}
            <div className="ls" style={{ animationDelay: '0.12s' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sign in as
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.625rem 0.25rem',
                    borderRadius: 10,
                    border: `1.5px solid ${selectedRole === 'student' ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedRole === 'student' ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    color: selectedRole === 'student' ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  <GraduationCap size={15} />
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('company')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.625rem 0.25rem',
                    borderRadius: 10,
                    border: `1.5px solid ${selectedRole === 'company' ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedRole === 'company' ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    color: selectedRole === 'company' ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  <Building2 size={15} />
                  Company
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('tpcell')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.625rem 0.25rem',
                    borderRadius: 10,
                    border: `1.5px solid ${selectedRole === 'tpcell' ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedRole === 'tpcell' ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    color: selectedRole === 'tpcell' ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  <ShieldCheck size={15} />
                  T&P Cell
                </button>
              </div>

              {/* Password hint */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.625rem', padding: '0.375rem 0.625rem', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Default password: <strong style={{ color: 'var(--accent)' }}>
                    {selectedRole === 'student' ? 'stu@123' : selectedRole === 'company' ? 'comp@123' : 'tp@123'}
                  </strong>
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
                  Just enter your email ID
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="ls" style={{ animationDelay: '0.18s', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {selectedRole === 'student' ? 'Student Email address' : selectedRole === 'company' ? 'Company Email address' : 'T&P Cell Email address'}
              </label>
              <input id="email" type="email"
                placeholder={selectedRole === 'student' ? 'e.g. yug@student.rize.in' : selectedRole === 'company' ? 'e.g. fundingpips@rize.in' : 'e.g. tpcell@rize.in'}
                autoComplete="email"
                className={`lo-inp${errors.email ? ' err' : ''}`} {...register('email')} />
              {errors.email && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="ls" style={{ animationDelay: '0.26s', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  className={`lo-inp${errors.password ? ' err' : ''}`} style={{ paddingRight: '2.75rem' }} {...register('password')} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.password.message}</span>}
            </div>

            {/* Submit */}
            <div className="ls" style={{ animationDelay: '0.34s', marginTop: '0.25rem' }}>
              <button type="submit" className="lo-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><svg className="lo-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity=".25"/>
                    <path fill="white" opacity=".75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Signing in...</>
                ) : (<>Continue <ArrowRight size={15} /></>)}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="ls" style={{ animationDelay: '0.4s', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', whiteSpace: 'nowrap' }}>New to Rize?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Register link */}
          <div className="ls" style={{ animationDelay: '0.46s' }}>
            <Link to="/register" className="lo-outline-btn">Create an account</Link>
          </div>

          {/* Security badge */}
          <div className="ls" style={{ animationDelay: '0.54s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '1.5rem', fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
            256-bit SSL encrypted · SOC 2 compliant
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForgotModal(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'var(--accent-subtle)',
                  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}
              >
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {forgotStep === 'email' ? 'Forgot Password?' : 'Reset Password'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {forgotStep === 'email'
                    ? 'Enter your email to receive your 6-digit verification code.'
                    : `Enter verification code & new password for ${forgotEmail}`}
                </p>
              </div>
            </div>

            {forgotStep === 'email' ? (
              <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Your registered email address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="lo-inp"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="lo-btn"
                  style={{ marginTop: '0.5rem' }}
                >
                  {forgotSubmitting ? (
                    'Generating 6-digit code...'
                  ) : (
                    <>
                      Get 6-Digit Code <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 6-digit code input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    className="lo-inp"
                    style={{ letterSpacing: '0.25em', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
                    autoFocus
                  />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Check your pop-up alert for the 6-digit code.
                  </span>
                </div>

                {/* New password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="lo-inp"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowForgotPass(p => !p)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        padding: '0 0.75rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-disabled)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showForgotPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type={showForgotPass ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="lo-inp"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    style={{
                      padding: '0.625rem 1rem',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="lo-btn"
                    style={{ flex: 1 }}
                  >
                    {forgotSubmitting ? 'Resetting...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
