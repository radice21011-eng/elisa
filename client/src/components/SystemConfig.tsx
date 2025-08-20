
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { useAuth } from '../hooks/useAuth';

interface SystemConfigItem {
  id: string;
  name: string;
  description: string;
  value: string | boolean | number;
  type: 'text' | 'boolean' | 'number' | 'select';
  options?: string[];
  category: string;
}

export function SystemConfig() {
  const { user, token } = useAuth();
  const [configs, setConfigs] = useState<SystemConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultConfigs: SystemConfigItem[] = [
    {
      id: 'system_name',
      name: 'System Name',
      description: 'Display name for the ELISA Quantum AI Council system',
      value: 'ELISA Quantum AI Council',
      type: 'text',
      category: 'General'
    },
    {
      id: 'admin_notifications',
      name: 'Admin Notifications',
      description: 'Enable real-time notifications for administrators',
      value: true,
      type: 'boolean',
      category: 'Notifications'
    },
    {
      id: 'security_level',
      name: 'Security Level',
      description: 'System security configuration level',
      value: 'maximum',
      type: 'select',
      options: ['standard', 'high', 'maximum'],
      category: 'Security'
    },
    {
      id: 'ai_model_limit',
      name: 'AI Model Limit',
      description: 'Maximum number of AI models per user',
      value: 10,
      type: 'number',
      category: 'AI Models'
    },
    {
      id: 'auto_backup',
      name: 'Automatic Backup',
      description: 'Enable automatic system backups',
      value: true,
      type: 'boolean',
      category: 'Backup'
    },
    {
      id: 'quantum_processing',
      name: 'Quantum Processing Mode',
      description: 'Enable quantum processing capabilities',
      value: true,
      type: 'boolean',
      category: 'AI Models'
    },
    {
      id: 'theme_mode',
      name: 'Default Theme',
      description: 'Default theme for new users',
      value: 'dark',
      type: 'select',
      options: ['light', 'dark', 'auto'],
      category: 'Interface'
    }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const mergedConfigs = defaultConfigs.map(defaultConfig => {
          const serverConfig = data.find((c: any) => c.key === defaultConfig.id);
          return {
            ...defaultConfig,
            value: serverConfig ? serverConfig.value : defaultConfig.value
          };
        });
        setConfigs(mergedConfigs);
      } else {
        setConfigs(defaultConfigs);
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error);
      setConfigs(defaultConfigs);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (configId: string, value: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: configId,
          value: value
        })
      });

      if (response.ok) {
        setConfigs(prev => prev.map(config => 
          config.id === configId ? { ...config, value } : config
        ));
      }
    } catch (error) {
      console.error('Failed to update config:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderConfigInput = (config: SystemConfigItem) => {
    switch (config.type) {
      case 'boolean':
        return (
          <Switch
            checked={config.value as boolean}
            onCheckedChange={(checked) => updateConfig(config.id, checked)}
            disabled={saving}
          />
        );
      case 'select':
        return (
          <Select
            value={config.value as string}
            onValueChange={(value) => updateConfig(config.id, value)}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={config.value as number}
            onChange={(e) => updateConfig(config.id, parseInt(e.target.value))}
            disabled={saving}
          />
        );
      default:
        return (
          <Input
            value={config.value as string}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            disabled={saving}
          />
        );
    }
  };

  const categories = [...new Set(configs.map(c => c.category))];

  if (loading) {
    return <div>Loading system configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Configuration</h2>
        <p className="text-muted-foreground">
          Configure ELISA Quantum AI Council system settings using user-friendly names.
        </p>
      </div>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category} Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configs
              .filter(config => config.category === category)
              .map((config, index, array) => (
                <div key={config.id}>
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={config.id} className="text-sm font-medium">
                        {config.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                    <div className="min-w-[200px]">
                      {renderConfigInput(config)}
                    </div>
                  </div>
                  {index < array.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
