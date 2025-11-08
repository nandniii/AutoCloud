import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RuleManager() {
  const [rules, setRules] = useState([]);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    storageType: 'localStorage',
    pattern: '',
    action: 'delete',
    condition: 'older-than',
    value: '',
    enabled: true,
  });

  // Load rules from localStorage on mount
  useEffect(() => {
    const savedRules = localStorage.getItem('cleanupRules');
    const savedAutomation = localStorage.getItem('automationEnabled');
    if (savedRules) setRules(JSON.parse(savedRules));
    if (savedAutomation !== null) setAutomationEnabled(JSON.parse(savedAutomation));
  }, []);

  // Save rules
  useEffect(() => {
    if (rules.length > 0) {
      localStorage.setItem('cleanupRules', JSON.stringify(rules));
    }
  }, [rules]);

  // Save automation state
  useEffect(() => {
    localStorage.setItem('automationEnabled', JSON.stringify(automationEnabled));
  }, [automationEnabled]);

  const handleAddRule = () => {
    if (!formData.name || !formData.pattern || !formData.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newRule = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    setRules([...rules, newRule]);
    resetForm();
    toast.success('Rule added successfully');
  };

  const handleUpdateRule = () => {
    if (!formData.name || !formData.pattern || !formData.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    setRules(rules.map(rule => rule.id === editingId ? { ...rule, ...formData } : rule));
    resetForm();
    toast.success('Rule updated successfully');
  };

  const handleDeleteRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.success('Rule deleted');
  };

  const handleEditRule = (rule) => {
    setEditingId(rule.id);
    setFormData(rule);
    setShowAddForm(true);
  };

  const toggleRuleEnabled = (id) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      storageType: 'localStorage',
      pattern: '',
      action: 'delete',
      condition: 'older-than',
      value: '',
      enabled: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getConditionLabel = (condition) => {
    const labels = {
      'older-than': 'Older than',
      'larger-than': 'Larger than',
      'contains': 'Contains',
      'matches': 'Matches pattern',
    };
    return labels[condition] || condition;
  };

  return (
    <div className="space-y-6">
      {/* Automation Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automation Status</CardTitle>
              <CardDescription>Enable or disable automatic storage cleanup</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={automationEnabled ? 'default' : 'secondary'}>
                {automationEnabled ? 'Active' : 'Paused'}
              </Badge>
              <Switch checked={automationEnabled} onCheckedChange={setAutomationEnabled} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Rule Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="size-4 mr-2" /> Add New Rule
        </Button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Rule' : 'Add New Rule'}</CardTitle>
            <CardDescription>Configure your storage cleanup rule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rule name */}
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Select
                value={formData.name}
                onValueChange={(value) => setFormData({ ...formData, name: value })}
              >
                <SelectTrigger id="name">
                  <SelectValue placeholder="Select a rule name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clear old session data">Clear old session data</SelectItem>
                  <SelectItem value="Remove temporary files">Remove temporary files</SelectItem>
                  <SelectItem value="Clean cache data">Clean cache data</SelectItem>
                  <SelectItem value="Delete expired tokens">Delete expired tokens</SelectItem>
                  <SelectItem value="Archive old user data">Archive old user data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Storage Type + Action */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storageType">Storage Type</Label>
                <Select
                  value={formData.storageType}
                  onValueChange={(value) => setFormData({ ...formData, storageType: value })}
                >
                  <SelectTrigger id="storageType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="localStorage">Local Storage</SelectItem>
                    <SelectItem value="sessionStorage">Session Storage</SelectItem>
                    <SelectItem value="cookies">Cookies</SelectItem>
                    <SelectItem value="indexedDB">IndexedDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select
                  value={formData.action}
                  onValueChange={(value) => setFormData({ ...formData, action: value })}
                >
                  <SelectTrigger id="action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="expire">Mark as Expired</SelectItem>
                    <SelectItem value="archive">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pattern + Condition */}
            <div className="space-y-2">
              <Label htmlFor="pattern">Key Pattern</Label>
              <Input
                id="pattern"
                placeholder="e.g., user_*, temp_*"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="older-than">Older than</SelectItem>
                    <SelectItem value="larger-than">Larger than</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="matches">Matches pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  placeholder={
                    formData.condition === 'older-than'
                      ? 'e.g., 30 days'
                      : formData.condition === 'larger-than'
                      ? 'e.g., 1MB'
                      : 'e.g., text or pattern'
                  }
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
            </div>

            {/* Enable Rule */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
                <Label htmlFor="enabled">Enable this rule</Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={editingId ? handleUpdateRule : handleAddRule} className="flex-1">
                <Save className="size-4 mr-2" />
                {editingId ? 'Update Rule' : 'Save Rule'}
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="size-4 mr-2" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
          <CardDescription>
            {rules.length === 0
              ? 'No rules configured yet'
              : `${rules.filter((r) => r.enabled).length} of ${rules.length} rules active`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No rules created yet. Add your first rule to get started.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-slate-900">{rule.name}</h4>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div><span className="text-slate-500">Storage:</span> {rule.storageType}</div>
                      <div><span className="text-slate-500">Action:</span> {rule.action}</div>
                      <div><span className="text-slate-500">Pattern:</span> {rule.pattern}</div>
                      <div><span className="text-slate-500">{getConditionLabel(rule.condition)}:</span> {rule.value}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRuleEnabled(rule.id)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                    <Edit2 className="size-4 mr-2" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteRule(rule.id)}>
                    <Trash2 className="size-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
