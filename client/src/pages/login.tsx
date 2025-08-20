import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Shield, AlertTriangle, Eye, EyeOff, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      setLocation('/');
    } else {
      setError(result.error || 'Authentication failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center animate-float">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-pink-400 mb-2 animate-glow">ELISA Quantum AI Council</h1>
          <p className="text-purple-300 text-sm">Advanced AI Governance System</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/90 backdrop-blur-lg border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-cyan-400 mr-2" />
            <h2 className="text-xl font-semibold text-cyan-400">Secure Access Portal</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Authorized Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ervin210@icloud.com"
                className="w-full bg-gray-900/80 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-pink-400 focus:outline-none transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Access Code
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter secure access code"
                  className="w-full bg-gray-900/80 border-2 border-purple-500/50 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-pink-400 focus:outline-none transition-colors"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-pink-400 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Access System
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="text-xs text-gray-400 space-y-1">
              <p>This system is protected under 100-year NDA provisions.</p>
              <p>Only authorized personnel may access this system.</p>
              <div className="text-red-400 font-semibold mt-3 p-2 border border-red-500/30 rounded">
                © 2025 Ervin Remus Radosavlevici - All Rights Reserved
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>All access attempts are monitored and logged.</p>
            <p>Unauthorized access is prosecuted to the full extent of the law.</p>
          </div>
        </div>
      </div>
    </div>
  );
}