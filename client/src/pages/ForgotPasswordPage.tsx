import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      if (data.token) {
        setToken(data.token);
        setStep('reset');
      }
    } catch (err: any) {
      setError(err.error || 'Failed');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword });
      setStep('done');
    } catch (err: any) {
      setError(err.error || 'Failed to reset password');
    }
  };

  if (step === 'done') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
          <p className="text-gray-500 mb-6">You can now sign in with your new password.</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-2">{step === 'request' ? 'Enter your email to get a reset token' : 'Enter the token and your new password'}</p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="card p-8 space-y-5">
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {message && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">{message}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="w-full btn-primary py-3">Request Reset Token</button>
            <Link to="/login" className="block text-center text-sm text-primary-600 hover:text-primary-700">Back to Login</Link>
          </form>
        ) : (
          <form onSubmit={handleReset} className="card p-8 space-y-5">
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
              <input className="input-field font-mono text-sm" value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input className="input-field" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="w-full btn-primary py-3">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
