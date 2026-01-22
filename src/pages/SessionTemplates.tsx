import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Copy, Star, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SessionTemplate, CodeExample } from '../types/database';

export default function SessionTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SessionTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topics: [] as string[],
    activities: '',
    code_examples_to_include: [] as string[],
    is_default: false
  });

  const [topicInput, setTopicInput] = useState('');

  useEffect(() => {
    loadTemplates();
    loadCodeExamples();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('session_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTemplates(data);
    }
    setLoading(false);
  };

  const loadCodeExamples = async () => {
    const { data } = await supabase
      .from('code_examples')
      .select('*')
      .order('week_number', { ascending: true });

    if (data) {
      setCodeExamples(data);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const dataToSave = {
      ...formData,
      updated_at: new Date().toISOString()
    };

    if (editingTemplate) {
      await supabase
        .from('session_templates')
        .update(dataToSave)
        .eq('id', editingTemplate.id);
    } else {
      await supabase.from('session_templates').insert(dataToSave);
    }

    setShowEditor(false);
    setEditingTemplate(null);
    resetForm();
    loadTemplates();
  };

  const handleEdit = (template: SessionTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      topics: template.topics,
      activities: template.activities,
      code_examples_to_include: template.code_examples_to_include,
      is_default: template.is_default
    });
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await supabase.from('session_templates').delete().eq('id', id);
      loadTemplates();
    }
  };

  const handleDuplicate = async (template: SessionTemplate) => {
    const duplicateData = {
      name: `${template.name} (Copy)`,
      description: template.description,
      topics: template.topics,
      activities: template.activities,
      code_examples_to_include: template.code_examples_to_include,
      is_default: false
    };

    await supabase.from('session_templates').insert(duplicateData);
    loadTemplates();
  };

  const handleToggleDefault = async (template: SessionTemplate) => {
    if (!template.is_default) {
      await supabase
        .from('session_templates')
        .update({ is_default: false })
        .neq('id', template.id);
    }

    await supabase
      .from('session_templates')
      .update({ is_default: !template.is_default })
      .eq('id', template.id);

    loadTemplates();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      topics: [],
      activities: '',
      code_examples_to_include: [],
      is_default: false
    });
    setTopicInput('');
  };

  const addTopic = () => {
    if (topicInput.trim()) {
      setFormData({ ...formData, topics: [...formData.topics, topicInput.trim()] });
      setTopicInput('');
    }
  };

  const removeTopic = (index: number) => {
    const newTopics = formData.topics.filter((_, i) => i !== index);
    setFormData({ ...formData, topics: newTopics });
  };

  const toggleCodeExample = (exampleId: string) => {
    const includes = formData.code_examples_to_include.includes(exampleId);
    const newExamples = includes
      ? formData.code_examples_to_include.filter(id => id !== exampleId)
      : [...formData.code_examples_to_include, exampleId];
    setFormData({ ...formData, code_examples_to_include: newExamples });
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <button
            onClick={() => {
              setShowEditor(false);
              setEditingTemplate(null);
              resetForm();
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Templates
          </button>

          <h1 className="text-4xl font-bold text-slate-900 mb-8">
            {editingTemplate ? 'Edit Template' : 'New Template'}
          </h1>

          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Standard Lecture, Workshop, Lab Session"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="What is this template used for?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Topics to Cover
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                  className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Add a topic"
                />
                <button
                  onClick={addTopic}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.topics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    <span>{topic}</span>
                    <button
                      onClick={() => removeTopic(index)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Activities
              </label>
              <textarea
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={4}
                placeholder="Describe the activities for this session type"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Code Examples to Include
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-slate-200 rounded-lg p-4">
                {codeExamples.map((example) => (
                  <label
                    key={example.id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.code_examples_to_include.includes(example.id)}
                      onChange={() => toggleCodeExample(example.id)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{example.title}</div>
                      <div className="text-sm text-slate-600">Week {example.week_number}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  Set as default template
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTemplate ? 'Update' : 'Create'} Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/teacher')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Session Templates</h1>
            <p className="text-slate-600">Create reusable templates for recurring class structures</p>
          </div>

          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Template
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl text-slate-600">No templates yet</p>
            <p className="text-slate-500 mt-2">Create your first session template to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {template.name}
                    {template.is_default && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </h3>
                  <button
                    onClick={() => handleToggleDefault(template)}
                    className="p-1 text-slate-400 hover:text-yellow-500 transition"
                    title={template.is_default ? 'Remove as default' : 'Set as default'}
                  >
                    <Star className={`w-5 h-5 ${template.is_default ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </button>
                </div>

                <p className="text-slate-600 text-sm mb-4">{template.description}</p>

                {template.topics.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">TOPICS</div>
                    <div className="flex flex-wrap gap-1">
                      {template.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {template.code_examples_to_include.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-500">
                      {template.code_examples_to_include.length} code example(s) included
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
