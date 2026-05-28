import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saved, setSaved] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-bold text-2xl">{user.username[0].toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-semibold text-xl text-gray-900">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="input-field" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea className="input-field" rows={3} value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{saved ? '✓ Saved!' : 'Save Changes'}</button>
            <button type="button" onClick={() => { logout(); navigate('/'); }} className="btn-danger">Sign Out</button>
          </div>
        </form>
      </div>
    </div>
  );
}
