import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Eye, EyeOff, Crown, Lock } from 'lucide-react';

export default function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white p-6">
      <div className="max-w-md w-full bg-black/90 backdrop-blur-lg border-2 border-pink-500 rounded-2xl p-8 shadow-2xl animate-pulse-glow">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center animate-float">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-pink-400 mb-2 animate-glow">ELISA Council Access</h1>
          <p className="text-purple-300">Quantum AI Security Portal</p>
          <p className="text-xs text-gray-400 mt-2">© 2025 Ervin Remus Radosavlevici</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border-2 border-red-400 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-400 font-semibold">Access Denied</span>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-cyan-400 text-sm font-semibold mb-2">
                Authorized Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@elisa-council.ai"
                className="w-full bg-gray-900/80 border-2 border-purple-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-400 text-sm font-semibold mb-2">
                Security Passphrase:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Quantum security key..."
                  className="w-full bg-gray-900/80 border-2 border-purple-500 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
              loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-pink-500/50 animate-pulse-glow'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Authenticating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Lock className="w-5 h-5 mr-2" />
                Access ELISA Council
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="text-xs text-gray-400 space-y-1">
            <p>Authorized personnel only</p>
            <p>All access attempts are logged and monitored</p>
            <p className="text-pink-400 font-semibold">100-Year NDA Protection Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}