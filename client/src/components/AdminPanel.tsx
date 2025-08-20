import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Save, Download, Users, Database, Shield, Eye, AlertTriangle } from 'lucide-react';
import { Config, AuditLog, AIModel } from '@shared/schema';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('config');
  
  if (!hasRole('admin') && !hasRole('superadmin')) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-red-900/80 border-2 border-red-500 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-400 mb-2">Access Denied</h3>
          <p className="text-red-300">Admin privileges required</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-gradient-to-br from-gray-900/95 to-purple-900/95 border-2 border-purple-500 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-black/80 border-b-2 border-purple-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-purple-400">ELISA Admin Control Panel</h2>
                <p className="text-purple-300">System Configuration & Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black/60 border-b border-purple-500/50 px-6">
          <div className="flex space-x-4">
            {[
              { id: 'config', label: 'System Config', icon: Settings },
              { id: 'models', label: 'AI Models', icon: Database },
              { id: 'audit', label: 'Audit Logs', icon: Eye },
              { id: 'export', label: 'Data Export', icon: Download },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-purple-400'
                    : 'text-gray-400 border-transparent hover:text-purple-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'config' && <SystemConfigTab />}
          {activeTab === 'models' && <AIModelsTab />}
          {activeTab === 'audit' && <AuditLogsTab />}
          {activeTab === 'export' && <DataExportTab />}
        </div>
      </div>
    </div>
  );
}

function SystemConfigTab() {
  const { data: config = [], isLoading } = useQuery({
    queryKey: ['/api/admin/config']
  });

  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: ''
  });

  const updateConfigMutation = useMutation({
    mutationFn: (configData: any) => apiRequest('/api/admin/config', {
      method: 'POST',
      body: configData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      setNewConfig({ key: '', value: '', description: '' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-purple-400 mb-4">System Configuration</h3>
      
      {/* Add New Config */}
      <div className="bg-black/60 border border-purple-500/50 rounded-xl p-4">
        <h4 className="font-semibold text-purple-300 mb-3">Add Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Configuration Key"
            value={newConfig.key}
            onChange={(e) => setNewConfig(prev => ({ ...prev, key: e.target.value }))}
            className="bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="text"
            placeholder="Value"
            value={newConfig.value}
            onChange={(e) => setNewConfig(prev => ({ ...prev, value: e.target.value }))}
            className="bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="text"
            placeholder="Description"
            value={newConfig.description}
            onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
            className="bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <button
          onClick={() => updateConfigMutation.mutate(newConfig)}
          disabled={!newConfig.key || !newConfig.value || updateConfigMutation.isPending}
          className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Current Config */}
      <div className="space-y-3">
        {(config as Config[])?.map((item: Config) => (
          <div key={item.id} className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h5 className="font-bold text-cyan-400">{item.key}</h5>
                <p className="text-white font-mono bg-gray-800/50 rounded px-2 py-1 mt-1">{item.value}</p>
                {item.description && (
                  <p className="text-gray-400 text-sm mt-2">{item.description}</p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {new Date(item.updatedAt!).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIModelsTab() {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['/api/ai-models']
  });

  const [newModel, setNewModel] = useState({
    name: '',
    version: '',
    status: 'active',
    compliance: '',
    security: ''
  });

  const createModelMutation = useMutation({
    mutationFn: (modelData: any) => apiRequest('/api/ai-models', {
      method: 'POST',
      body: modelData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-models'] });
      setNewModel({ name: '', version: '', status: 'active', compliance: '', security: '' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-purple-400 mb-4">AI Models Management</h3>
      
      {/* Add New Model */}
      <div className="bg-black/60 border border-purple-500/50 rounded-xl p-4">
        <h4 className="font-semibold text-purple-300 mb-3">Add AI Model</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Model Name"
            value={newModel.name}
            onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="text"
            placeholder="Version"
            value={newModel.version}
            onChange={(e) => setNewModel(prev => ({ ...prev, version: e.target.value }))}
            className="bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="text"
            placeholder="Compliance Level"
            value={newModel.compliance}
            onChange={(e) => setNewModel(prev => ({ ...prev, compliance: e.target.value }))}
            className="bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
          />
          <input
            type="text"
            placeholder="Security Level"
            value={newModel.security}
            onChange={(e) => setNewModel(prev => ({ ...prev, security: e.target.value }))}
            className="bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <button
          onClick={() => createModelMutation.mutate(newModel)}
          disabled={!newModel.name || !newModel.version || createModelMutation.isPending}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {createModelMutation.isPending ? 'Creating...' : 'Create Model'}
        </button>
      </div>

      {/* Models List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(models) ? models.map((model: AIModel) => (
          <div key={model.id} className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h5 className="font-bold text-cyan-400">{model.name}</h5>
              <span className={`px-2 py-1 rounded text-xs ${
                model.status === 'active' ? 'bg-green-600' : 
                model.status === 'inactive' ? 'bg-red-600' : 'bg-yellow-600'
              }`}>
                {model.status.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Version:</span> <span className="text-white">{model.version}</span></div>
              <div><span className="text-gray-400">Compliance:</span> <span className="text-white">{model.compliance}</span></div>
              <div><span className="text-gray-400">Security:</span> <span className="text-white">{model.security}</span></div>
              <div><span className="text-gray-400">Created:</span> <span className="text-white">{new Date(model.createdAt!).toLocaleDateString()}</span></div>
            </div>
          </div>
        )) : []}
      </div>
    </div>
  );
}

function AuditLogsTab() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['/api/audit-logs']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Recent Audit Logs</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {Array.isArray(logs) ? logs.map((log: AuditLog) => (
          <div key={log.id} className="bg-black/40 border border-purple-500/30 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 rounded text-xs mr-2 ${
                    log.action.includes('LOGIN') ? 'bg-green-600' :
                    log.action.includes('DELETE') ? 'bg-red-600' :
                    log.action.includes('UPDATE') ? 'bg-yellow-600' : 'bg-blue-600'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-gray-400 text-sm">{log.resource}</span>
                </div>
                {log.details && (
                  <pre className="text-xs bg-gray-900/50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.details as any, null, 2)}
                  </pre>
                )}
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div>{new Date(log.timestamp!).toLocaleString()}</div>
                <div>User: {log.userId?.slice(0, 8)}...</div>
              </div>
            </div>
          </div>
        )) : []}
      </div>
    </div>
  );
}

function DataExportTab() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportType, setExportType] = useState('metrics');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/export/${exportType}?format=${exportFormat}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elisa_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elisa-${exportType}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Data Export</h3>
      
      <div className="bg-black/60 border border-purple-500/50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-purple-300 font-semibold mb-2">Export Type:</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
            >
              <option value="metrics">System Metrics</option>
              <option value="audit-logs">Audit Logs</option>
              <option value="ai-models">AI Models</option>
              <option value="system-report">Complete System Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-purple-300 font-semibold mb-2">Format:</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="w-full bg-gray-900/80 border border-purple-500 rounded-lg px-3 py-2 text-white"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg flex items-center justify-center font-semibold"
        >
          <Download className="w-5 h-5 mr-2" />
          {loading ? 'Exporting...' : `Export ${exportType.replace('-', ' ').toUpperCase()}`}
        </button>

        <div className="mt-4 text-sm text-gray-400">
          <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-400" />
          Exports are rate-limited and logged for security purposes.
        </div>
      </div>
    </div>
  );
}