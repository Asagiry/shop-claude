import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.login, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
            <input className="input-field" type="text" value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="input-field" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">Forgot password?</Link>
            <Link to="/register" className="text-primary-600 hover:text-primary-700">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
