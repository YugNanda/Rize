import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, GraduationCap, Building2, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerSchema } from '../../schemas/auth.schema';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import RizeLogo from '../../components/ui/RizeLogo';
import AuthThemeToggle from '../../components/ui/AuthThemeToggle';

const ROLES = [
  {
    value: 'student',
    icon: GraduationCap,
    title: 'Student',
    desc: 'Apply to drives & track offers',
    features: [
      'Unique aesthetic anime avatar assigned by default',
      'Browse verified campus recruitment drives',
      'Track real-time application & interview rounds',
    ],
  },
  {
    value: 'company',
    icon: Building2,
    title: 'Company',
    desc: 'Post drives & hire talent',
    features: [
      'Official company logo set as recruiter profile picture',
      'Launch customized placement drives & criteria',
      'Review verified candidates & extend offers',
    ],
  },
  {
    value: 'tpcell',
    icon: ShieldCheck,
    title: 'T&P Cell',
    desc: 'Placement Coordinator',
    features: [
      'Institutional clearance & student mark verification',
      'Approve company recruitment drives',
      'Issue college NOCs & enforce placement policies',
    ],
  },
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      const res = await authService.register(payload);
      login(res.data.user);
      toast.success('Welcome to Rize! Your account is ready.');
      const dashMap = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        admin: '/tpcell/dashboard',
        tpcell: '/tpcell/dashboard',
      };
      navigate(dashMap[res.data.user.role] || '/student/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", position: 'relative', padding: '1.5rem', overflowY: 'auto' }}>
      <style>{`
        /* ── Orb BG ── */
        .rg-orb1 { position:fixed;width:450px;height:450px;border-radius:50%;filter:blur(100px);top:-120px;right:-80px;pointer-events:none;animation:rg_drift 22s ease-in-out infinite alternate; }
        .rg-orb2 { position:fixed;width:350px;height:350px;border-radius:50%;filter:blur(90px);bottom:-80px;left:-60px;pointer-events:none;animation:rg_drift 18s ease-in-out infinite alternate;animation-delay:-7s; }
        @keyframes rg_drift { 0%{transform:translateY(0)}100%{transform:translateY(-28px)} }
        .rg-grid {
          position:fixed;inset:0;pointer-events:none;
          background-image:
            linear-gradient(var(--border-subtle) 1px,transparent 1px),
            linear-gradient(90deg,var(--border-subtle) 1px,transparent 1px);
          background-size:52px 52px;
          mask-image:radial-gradient(ellipse 80% 80% at 50% 20%,black 0%,transparent 80%);
          opacity:0.5;
        }

        /* ── Card ── */
        .rg-card {
          width:100%;max-width:480px;position:relative;z-index:1;
          transform:translateY(22px);opacity:0;
          transition:all 0.65s cubic-bezier(0.16,1,0.3,1);
        }
        .rg-card.vis { transform:translateY(0);opacity:1; }

        /* ── Role cards ── */
        .rg-role-grid { display:grid;grid-template-columns:repeat(3, 1fr);gap:0.5rem; }
        @media(max-width:560px){.rg-role-grid{grid-template-columns:1fr;}}
        .rg-role-btn {
          padding:0.875rem;border-radius:10px;border:1px solid var(--border);
          background:var(--bg-elevated);cursor:pointer;text-align:left;
          transition:all 0.2s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden;
        }
        .rg-role-btn:hover { border-color:var(--border-strong); }
        .rg-role-btn.sel { border-color:var(--accent);background:var(--accent-subtle);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 25%,transparent); }
        .rg-role-icon {
          width:30px;height:30px;border-radius:7px;background:var(--bg-overlay);
          display:flex;align-items:center;justify-content:center;margin-bottom:0.5rem;
          transition:background 0.2s;
        }
        .rg-role-btn.sel .rg-role-icon { background:color-mix(in srgb,var(--accent) 18%,transparent); }
        .rg-role-check {
          position:absolute;top:0.5rem;right:0.5rem;width:16px;height:16px;border-radius:50%;
          background:var(--accent);display:flex;align-items:center;justify-content:center;
          opacity:0;transform:scale(0.4);transition:all 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .rg-role-btn.sel .rg-role-check { opacity:1;transform:scale(1); }
        .rg-feat { max-height:0;overflow:hidden;transition:max-height 0.35s cubic-bezier(0.16,1,0.3,1),margin-top 0.3s; }
        .rg-feat.open { max-height:130px;margin-top:0.75rem; }

        /* ── Input ── */
        .rg-inp {
          width:100%;background:var(--bg-elevated);border:1px solid var(--border);
          border-radius:8px;padding:0.625rem 0.875rem;color:var(--text-primary);
          font-size:0.875rem;font-family:'Inter',sans-serif;outline:none;
          transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
        }
        .rg-inp::placeholder { color:var(--text-disabled); }
        .rg-inp:focus { border-color:var(--accent);background:var(--bg-overlay);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent); }
        .rg-inp.err { border-color:var(--danger); }

        /* ── 2-col ── */
        .rg-2col { display:grid;grid-template-columns:1fr 1fr;gap:0.875rem; }
        @media(max-width:520px){.rg-2col{grid-template-columns:1fr;}}

        /* ── Button ── */
        .rg-btn {
          width:100%;padding:0.6875rem 1.25rem;
          background:linear-gradient(135deg,var(--accent) 0%,var(--accent-hover) 100%);
          color:#fff;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;
          font-family:'Inter',sans-serif;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:0.5rem;
          position:relative;overflow:hidden;
          transition:opacity 0.2s,transform 0.15s,box-shadow 0.2s;
          box-shadow:0 4px 16px color-mix(in srgb,var(--accent) 30%,transparent);
        }
        .rg-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transition:left 0.5s;}
        .rg-btn:hover::before{left:100%;}
        .rg-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px color-mix(in srgb,var(--accent) 42%,transparent);}
        .rg-btn:active{transform:translateY(0);}
        .rg-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .rg-spin{animation:rg_spin 0.7s linear infinite;}
        @keyframes rg_spin{to{transform:rotate(360deg)}}

        /* ── Stagger ── */
        .rs{opacity:0;transform:translateY(10px);animation:rs_in 0.45s cubic-bezier(0.16,1,0.3,1) forwards;}
        @keyframes rs_in{to{opacity:1;transform:translateY(0);}}
      `}</style>

      {/* Background */}
      <div className="rg-orb1" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 15%, transparent), transparent)' }} />
      <div className="rg-orb2" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-hover) 10%, transparent), transparent)' }} />
      <div className="rg-grid" />

      {/* Theme toggle — top right */}
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.5rem', zIndex: 10 }}>
        <AuthThemeToggle />
      </div>

      <div className={`rg-card ${mounted ? 'vis' : ''}`}>
        {/* Logo */}
        <div className="rs" style={{ animationDelay: '0.05s', marginBottom: '1.875rem' }}>
          <RizeLogo size="sm" />
        </div>

        {/* Title */}
        <div className="rs" style={{ animationDelay: '0.12s', marginBottom: '1.625rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Create your account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Get started in under 2 minutes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Role selection */}
          <div className="rs" style={{ animationDelay: '0.2s' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>I am joining as</div>
            <div className="rg-role-grid">
              {ROLES.map(({ value, icon: Icon, title, desc }) => (
                <button key={value} type="button"
                  className={`rg-role-btn ${selectedRole === value ? 'sel' : ''}`}
                  onClick={() => setValue('role', value, { shouldValidate: true })}>
                  <div className="rg-role-check"><Check size={9} color="white" /></div>
                  <div className="rg-role-icon">
                    <Icon size={14} color={selectedRole === value ? 'var(--accent-hover)' : 'var(--text-muted)'} />
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
                </button>
              ))}
            </div>
            {/* Animated features */}
            <div className={`rg-feat ${selectedRole ? 'open' : ''}`}>
              {ROLES.find(r => r.value === selectedRole)?.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 0' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            {errors.role && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}>{errors.role.message}</span>}
          </div>

          {/* Name + Email */}
          <div className="rg-2col rs" style={{ animationDelay: '0.28s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Full name</label>
              <input id="name" type="text" placeholder="John Doe" autoComplete="name"
                className={`rg-inp${errors.name ? ' err' : ''}`} {...register('name')} />
              {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.name.message}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email address</label>
              <input id="email" type="email" placeholder="you@company.com" autoComplete="email"
                className={`rg-inp${errors.email ? ' err' : ''}`} {...register('email')} />
              {errors.email && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.email.message}</span>}
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="rg-2col rs" style={{ animationDelay: '0.34s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 chars"
                  className={`rg-inp${errors.password ? ' err' : ''}`} style={{ paddingRight: '2.5rem' }} {...register('password')} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 0.7rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.password.message}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Confirm password</label>
              <input id="confirmPassword" type="password" placeholder="Re-enter"
                className={`rg-inp${errors.confirmPassword ? ' err' : ''}`} {...register('confirmPassword')} />
              {errors.confirmPassword && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.confirmPassword.message}</span>}
            </div>
          </div>

          {/* Terms */}
          <p className="rs" style={{ animationDelay: '0.4s', fontSize: '0.75rem', color: 'var(--text-disabled)', margin: 0 }}>
            By creating an account you agree to our{' '}
            <span style={{ color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' '}and{' '}
            <span style={{ color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>

          {/* Submit */}
          <div className="rs" style={{ animationDelay: '0.45s' }}>
            <button type="submit" className="rg-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <><svg className="rg-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity=".25"/>
                  <path fill="white" opacity=".75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Creating account...</>
              ) : (<>Get started <ArrowRight size={14} /></>)}
            </button>
          </div>
        </form>

        {/* Sign in link */}
        <p className="rs" style={{ animationDelay: '0.52s', marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
