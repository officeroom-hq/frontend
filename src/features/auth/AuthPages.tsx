import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/field';
import { FormAlert } from '../../components/ui/states';
import { isEmail, requiredText } from '../../lib/validation';
import { AuthShell } from './AuthShell';

type Errors = Partial<Record<string, string>>;

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!isEmail(email)) next.email = 'Enter a valid email address.';
    const pw = requiredText(password, 'Password');
    if (pw) next.password = pw;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFormError(undefined);
    try {
      await api.signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(errorMessage(err, 'Sign in failed. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to Officeroom."
      footer={<>New to Officeroom? <Link to="/register" className="font-medium text-blue-700 hover:underline">Create an account</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-3">
        {formError && <FormAlert>{formError}</FormAlert>}
        <Input label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@company.ng" />
        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[11px] font-medium text-blue-700 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={busy} className="w-full">Sign in</Button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ fullName: '', businessName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    const n = requiredText(fields.fullName, 'Full name');
    if (n) next.fullName = n;
    const b = requiredText(fields.businessName, 'Business name');
    if (b) next.businessName = b;
    if (!isEmail(fields.email)) next.email = 'Enter a valid email address.';
    if (fields.password.length < 8) next.password = 'Use at least 8 characters.';
    if (fields.confirm !== fields.password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFormError(undefined);
    try {
      await api.register({ fullName: fields.fullName, email: fields.email, password: fields.password, businessName: fields.businessName });
      navigate('/setup');
    } catch (err) {
      setFormError(errorMessage(err, 'Could not create the account. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your business workspace in about five minutes."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-blue-700 hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-3">
        {formError && <FormAlert>{formError}</FormAlert>}
        <Input label="Full name" autoComplete="name" value={fields.fullName} onChange={set('fullName')} error={errors.fullName} placeholder="Chinedu Okafor" />
        <Input label="Business name" value={fields.businessName} onChange={set('businessName')} error={errors.businessName} placeholder="Adeola Spices & Foods Ltd" />
        <Input label="Work email" type="email" autoComplete="email" value={fields.email} onChange={set('email')} error={errors.email} placeholder="you@company.ng" />
        <Input label="Password" type="password" autoComplete="new-password" value={fields.password} onChange={set('password')} error={errors.password} hint="At least 8 characters." />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={fields.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" loading={busy} className="w-full">Create account</Button>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await api.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, 'Could not send the reset link. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We will email you a link to choose a new password."
      footer={<Link to="/login" className="font-medium text-blue-700 hover:underline">Back to sign in</Link>}
    >
      {sent ? (
        <FormAlert tone="success">If an account exists for {email}, a reset link is on its way.</FormAlert>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-3">
          {error && <FormAlert>{error}</FormAlert>}
          <Input label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ng" />
          <Button type="submit" loading={busy} className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
