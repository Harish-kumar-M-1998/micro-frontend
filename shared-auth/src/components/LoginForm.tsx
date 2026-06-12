import { FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { login, clearAuthError } from '../store/slices/authSlice';
import { monitoring } from '../monitoring';

interface LoginFormProps {
  /** Optional className for styling from host */
  className?: string;
  /** Render prop for UI components from shared-ui */
  renderInput?: (props: {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    required?: boolean;
  }) => React.ReactNode;
  renderButton?: (props: {
    children: React.ReactNode;
    isLoading: boolean;
    type: 'submit';
  }) => React.ReactNode;
}

/**
 * Authentication login form - can be used standalone or embedded in host.
 */
export function LoginForm({ className = '', renderInput, renderButton }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      monitoring.track({ name: 'user_login', properties: { email } });
      navigate(from, { replace: true });
    }
  };

  const defaultInput = (props: {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    required?: boolean;
  }) => (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium">{props.label}</label>
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        required={props.required}
        className="w-full rounded-lg border px-3 py-2"
      />
      {props.error && <p className="mt-1 text-sm text-red-600">{props.error}</p>}
    </div>
  );

  const defaultButton = (props: { children: React.ReactNode; isLoading: boolean; type: 'submit' }) => (
    <button
      type={props.type}
      disabled={props.isLoading}
      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
    >
      {props.isLoading ? 'Signing in...' : props.children}
    </button>
  );

  const InputComponent = renderInput ?? defaultInput;
  const ButtonComponent = renderButton ?? defaultButton;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <InputComponent
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <InputComponent
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
      />
      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <ButtonComponent isLoading={isLoading} type="submit">
        Sign In
      </ButtonComponent>
    </form>
  );
}
