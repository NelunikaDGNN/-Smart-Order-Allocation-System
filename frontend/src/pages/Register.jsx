import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import PasswordRules from '../components/register/PasswordRules.jsx';
import { isPasswordValid } from '../utils/password';


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (field) => (e) => {
    if (field === 'password') setPasswordError('');
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const markTouched = (field) => () =>
  setTouched((t) => ({
    ...t,
    [field]: form[field].trim().length > 0,
  }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const passwordValid = isPasswordValid(form.password);
  const confirmValid = form.password && form.password === form.confirmPassword;
  const nameValid = form.fullName.trim().length >= 2;

  const showRules = passwordFocused
    ? true
    : touched.password && form.password.length > 0 && !passwordValid;

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    markTouched('password')();
    if (form.password.length > 0 && !passwordValid) {
      setPasswordError('Password does not meet all requirements.');
    }
  };

  React.useEffect(() => {
    if (!passwordValid && form.confirmPassword) {
      setForm((f) => ({ ...f, confirmPassword: '' }));
    }
    // eslint-disable-next-line
  }, [passwordValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true, confirmPassword: true, fullName: true });

    if (!nameValid) {
      setError('Please enter your full name.');
      return;
    }
    if (!emailValid) {
      setError('Enter a valid email address.');
      return;
    }
    if (!passwordValid) {
      setPasswordError('Password does not meet all requirements.');
      setError('Please fix the errors above.');
      return;
    }
    if (!confirmValid) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(form.email.trim(), form.password, form.fullName.trim());
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Create an account</h1>
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            value={form.fullName}
            onChange={setField('fullName')}
            onBlur={markTouched('fullName')}
            error={touched.fullName && !nameValid ? 'Please enter your full name.' : ''}
            required
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            onBlur={markTouched('email')}
            error={touched.email && !emailValid ? 'Enter a valid email address.' : ''}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={setField('password')}
              onFocus={() => {
                setPasswordFocused(true);
                setPasswordError('');
              }}
              onBlur={handlePasswordBlur}
              error={passwordError}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-[26px] p-1 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              showRules ? 'opacity-100 max-h-40 mt-1 mb-3' : 'opacity-0 max-h-0'
            }`}
          >
            <PasswordRules password={form.password} />
          </div>

         
          <div
            className={`relative transition-opacity duration-200 ${
              passwordValid ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <Input
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              onBlur={markTouched('confirmPassword')}
              error={
                touched.confirmPassword && confirmValid === false && form.confirmPassword
                  ? 'Passwords do not match.'
                  : ''
              }
              disabled={!passwordValid}      
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-[26px] p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              tabIndex={-1}
              disabled={!passwordValid}      // NEW
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}