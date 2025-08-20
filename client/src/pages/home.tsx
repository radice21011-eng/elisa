import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import RealTimeMetrics from "@/components/RealTimeMetrics";
import AdminPanel from "@/components/AdminPanel";
import { Crown, Activity, Settings, LogOut, Wifi, WifiOff, AlertTriangle } from "lucide-react";

export default function HomePage() {
  const { user, logout, isELISAOwner, hasRole } = useAuth();
  const { isConnected, connectionStatus, lastMessage } = useWebSocket();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (!user || !isELISAOwner()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-black/90 backdrop-blur-lg border-2 border-red-500 rounded-2xl p-8 text-center animate-pulse-glow">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">ACCESS DENIED</h2>
          <p className="text-red-300 mb-4">ELISA Quantum AI Council - Authorized Personnel Only</p>
          <div className="text-sm text-gray-300 space-y-2">
            <p>This system is protected under 100-year NDA provisions.</p>
            <p>Unauthorized access attempts are logged and prosecuted.</p>
            <div className="text-xs text-red-400 font-semibold border border-red-500 rounded p-2 mt-4">
              © 2025 Ervin Remus Radosavlevici - All Rights Reserved
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      {/* Header */}
      <div className="border-b-2 border-purple-500 bg-black/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center animate-float">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-pink-400 animate-glow">ELISA Quantum AI Council</h1>
                <p className="text-purple-300">Advanced AI Governance & Real-Time Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* WebSocket Status */}
              <div className={`flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                isConnected 
                  ? 'bg-green-900/50 border border-green-500 text-green-400' 
                  : 'bg-red-900/50 border border-red-500 text-red-400'
              }`}>
                {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {connectionStatus.toUpperCase()}
              </div>

              {/* User Info */}
              <div className="text-right">
                <div className="text-sm font-semibold text-pink-400">{user.email}</div>
                <div className="text-xs text-purple-300 capitalize">{user.role}</div>
              </div>

              {/* Admin Button */}
              {(hasRole('admin') || hasRole('superadmin')) && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* System Status Bar */}
        <div className="mb-8 p-4 bg-black/60 backdrop-blur-lg border border-purple-500/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-400 font-semibold">System Operational</span>
              </div>
              <div className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              {lastMessage && (
                <div className="text-cyan-400 text-sm">
                  Latest: {lastMessage.type} at {new Date(lastMessage.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              © 2025 Ervin Remus Radosavlevici - ELISA Quantum AI Council
            </div>
          </div>
        </div>

        {/* Real-Time Metrics Dashboard */}
        <RealTimeMetrics />

        {/* Copyright & Legal Notice */}
        <div className="mt-12 p-6 bg-black/80 border-2 border-purple-500/50 rounded-xl text-center">
          <div className="text-purple-400 font-bold text-lg mb-2">
            ELISA Quantum AI Council System
          </div>
          <div className="text-gray-400 text-sm space-y-1">
            <p>© 2025 Ervin Remus Radosavlevici - All Rights Reserved</p>
            <p>Protected under 100-year NDA • Unauthorized access prohibited</p>
            <p>Real-time monitoring active • All activities logged and audited</p>
          </div>
          <div className="mt-4 text-xs text-purple-300 bg-purple-900/30 rounded p-2">
            This system contains proprietary quantum AI algorithms and is subject to international copyright protection.
          </div>
        </div>
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}