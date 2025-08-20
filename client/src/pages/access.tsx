import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Lock } from 'lucide-react';

export default function AccessPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your authorized email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/access', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('elisa_token', result.token);
        localStorage.setItem('elisa_user', JSON.stringify(result.user));
        
        toast({
          title: "Access Granted",
          description: result.message,
          variant: "default",
        });

        // Redirect to home
        window.location.href = '/';
      } else {
        throw new Error(result.message || 'Access denied');
      }
      
    } catch (error: any) {
      console.error('Access error:', error);
      
      toast({
        title: "Access Denied",
        description: error.message || "Unauthorized access attempt. Violation logged and subject to $1 billion fine enforcement.",
        variant: "destructive",
      });
      
      // Clear any existing tokens
      localStorage.removeItem('elisa_token');
      localStorage.removeItem('elisa_user');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 border-2 border-purple-500 mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            ELISA Quantum AI Council
          </h1>
          
          <p className="text-gray-400 text-sm">
            Authorized Personnel Only
          </p>
          
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <div className="flex items-center text-red-400 text-xs">
              <Lock className="w-4 h-4 mr-2" />
              <span className="font-mono">
                PROTECTED SYSTEM - $1,000,000,000 FINE ENFORCEMENT
              </span>
            </div>
          </div>
        </div>

        {/* Access Form */}
        <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleAccess} className="space-y-6">
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-400 mb-2">
                Authorized Email Address
              </label>
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter authorized email"
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Only authorized ELISA council members can access this system
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying Access...
                </div>
              ) : (
                'Request Access'
              )}
            </button>
            
          </form>
          
          <div className="mt-6 pt-4 border-t border-purple-500/30">
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Authorized: ervin210@icloud.com</div>
              <div>• Authorized: radosavlevici.ervin@gmail.com</div>
              <div>• Authorized: radice21011@gmail.com</div>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <div>© 2025 Ervin Remus Radosavlevici - All Rights Reserved</div>
          <div className="mt-1">Protected under international copyright and trade secret law</div>
        </div>
        
      </div>
    </div>
  );
}