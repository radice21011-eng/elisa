
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, Brain, Zap, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'active' | 'inactive' | 'training' | 'deployed';
  description: string;
  parameters: number;
  accuracy: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export function AIModelsManager() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'classification',
    version: '1.0.0',
    status: 'inactive',
    description: '',
    parameters: 1000000,
    accuracy: 0
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/ai-models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error('Failed to fetch AI models:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI models",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingModel ? `/api/ai-models/${editingModel.id}` : '/api/ai-models';
      const method = editingModel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `AI model ${editingModel ? 'updated' : 'created'} successfully`
        });
        
        fetchModels();
        setShowCreateDialog(false);
        setEditingModel(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save AI model:', error);
      toast({
        title: "Error",
        description: "Failed to save AI model",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI model?')) return;
    
    try {
      const response = await fetch(`/api/ai-models/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "AI model deleted successfully"
        });
        fetchModels();
      }
    } catch (error) {
      console.error('Failed to delete AI model:', error);
      toast({
        title: "Error",
        description: "Failed to delete AI model",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'classification',
      version: '1.0.0',
      status: 'inactive',
      description: '',
      parameters: 1000000,
      accuracy: 0
    });
  };

  const startEdit = (model: AIModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      type: model.type,
      version: model.version,
      status: model.status,
      description: model.description,
      parameters: model.parameters,
      accuracy: model.accuracy
    });
    setShowCreateDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      training: 'destructive',
      deployed: 'default'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Brain className="w-4 h-4" />;
      case 'regression': return <Zap className="w-4 h-4" />;
      case 'reinforcement': return <Shield className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div>Loading AI models...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Models Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor your quantum AI models
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingModel(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingModel ? 'Edit' : 'Create'} AI Model</DialogTitle>
              <DialogDescription>
                {editingModel ? 'Update the AI model configuration' : 'Create a new quantum AI model'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Model Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="reinforcement">Reinforcement Learning</SelectItem>
                    <SelectItem value="generative">Generative AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="parameters">Parameters</Label>
                <Input
                  id="parameters"
                  type="number"
                  value={formData.parameters}
                  onChange={(e) => setFormData({ ...formData, parameters: parseInt(e.target.value) })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="accuracy">Accuracy (%)</Label>
                <Input
                  id="accuracy"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.accuracy}
                  onChange={(e) => setFormData({ ...formData, accuracy: parseFloat(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingModel ? 'Update' : 'Create'} Model
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Models ({models.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getModelIcon(model.type)}
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {model.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{model.type}</TableCell>
                  <TableCell>{model.version}</TableCell>
                  <TableCell>{getStatusBadge(model.status)}</TableCell>
                  <TableCell>{model.parameters.toLocaleString()}</TableCell>
                  <TableCell>{model.accuracy}%</TableCell>
                  <TableCell>{new Date(model.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(model)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(model.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {models.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No AI models found. Create your first model to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
