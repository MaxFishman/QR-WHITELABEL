import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Code, History, GitCompare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CodeExample, CodeExampleVersion } from '../types/database';
import CodeEditor from '../components/CodeEditor';
import CodeDiffViewer from '../components/CodeDiffViewer';

export default function CodeExamplesManager() {
  const navigate = useNavigate();
  const [examples, setExamples] = useState<CodeExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingExample, setEditingExample] = useState<CodeExample | null>(null);
  const [weekFilter, setWeekFilter] = useState<number | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<CodeExampleVersion[]>([]);
  const [selectedExample, setSelectedExample] = useState<CodeExample | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffOldVersion, setDiffOldVersion] = useState<CodeExampleVersion | null>(null);
  const [diffNewVersion, setDiffNewVersion] = useState<CodeExampleVersion | null>(null);
  const [diffLanguage, setDiffLanguage] = useState<'html' | 'css' | 'js'>('html');

  const [formData, setFormData] = useState({
    week_number: 1,
    title: '',
    description: '',
    html_code: '',
    css_code: '',
    js_code: '',
    is_starter: false
  });

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('code_examples')
      .select('*')
      .order('week_number', { ascending: true })
      .order('order_index', { ascending: true });

    if (data) {
      setExamples(data);
    }
    setLoading(false);
  };

  const handleSave = async (html: string, css: string, js: string) => {
    const dataToSave = {
      ...formData,
      html_code: html,
      css_code: css,
      js_code: js
    };

    if (editingExample) {
      const newVersionNumber = (editingExample.version_number || 1) + 1;

      await supabase
        .from('code_example_versions')
        .insert({
          code_example_id: editingExample.id,
          version_number: editingExample.version_number || 1,
          html_code: editingExample.html_code,
          css_code: editingExample.css_code,
          js_code: editingExample.js_code,
          change_summary: 'Version saved automatically',
          created_by: 'teacher'
        });

      await supabase
        .from('code_examples')
        .update({ ...dataToSave, version_number: newVersionNumber })
        .eq('id', editingExample.id);
    } else {
      await supabase.from('code_examples').insert(dataToSave);
    }

    setShowEditor(false);
    setEditingExample(null);
    resetForm();
    loadExamples();
  };

  const loadVersionHistory = async (example: CodeExample) => {
    setSelectedExample(example);
    const { data } = await supabase
      .from('code_example_versions')
      .select('*')
      .eq('code_example_id', example.id)
      .order('version_number', { ascending: false });

    if (data) {
      setVersions(data);
      setShowVersionHistory(true);
    }
  };

  const handleCompareVersions = (v1: CodeExampleVersion, v2: CodeExampleVersion, lang: 'html' | 'css' | 'js') => {
    setDiffOldVersion(v1);
    setDiffNewVersion(v2);
    setDiffLanguage(lang);
    setShowDiff(true);
  };

  const handleEdit = (example: CodeExample) => {
    setEditingExample(example);
    setFormData({
      week_number: example.week_number,
      title: example.title,
      description: example.description,
      html_code: example.html_code,
      css_code: example.css_code,
      js_code: example.js_code,
      is_starter: example.is_starter
    });
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this example?')) {
      await supabase.from('code_examples').delete().eq('id', id);
      loadExamples();
    }
  };

  const resetForm = () => {
    setFormData({
      week_number: 1,
      title: '',
      description: '',
      html_code: '',
      css_code: '',
      js_code: '',
      is_starter: false
    });
  };

  const filteredExamples = weekFilter
    ? examples.filter((ex) => ex.week_number === weekFilter)
    : examples;

  const weeks = Array.from(new Set(examples.map((ex) => ex.week_number))).sort((a, b) => a - b);

  if (showEditor) {
    return (
      <div className="h-screen flex flex-col bg-slate-900">
        <div className="bg-slate-800 p-4 border-b border-slate-700">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => {
                setShowEditor(false);
                setEditingExample(null);
                resetForm();
              }}
              className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Examples
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Week Number
                </label>
                <input
                  type="number"
                  value={formData.week_number}
                  onChange={(e) =>
                    setFormData({ ...formData, week_number: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="What does this example demonstrate?"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_starter"
                checked={formData.is_starter}
                onChange={(e) => setFormData({ ...formData, is_starter: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_starter" className="text-sm text-slate-300">
                Mark as starter template
              </label>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <CodeEditor
            initialHtml={formData.html_code}
            initialCss={formData.css_code}
            initialJs={formData.js_code}
            onSave={handleSave}
            autoRun={true}
          />
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Code Examples</h1>
            <p className="text-slate-600">Create and manage code examples for students</p>
          </div>

          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Example
          </button>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setWeekFilter(null)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              weekFilter === null
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Weeks
          </button>
          {weeks.map((week) => (
            <button
              key={week}
              onClick={() => setWeekFilter(week)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                weekFilter === week
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Week {week}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading examples...</p>
          </div>
        ) : filteredExamples.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl text-slate-600">No examples yet</p>
            <p className="text-slate-500 mt-2">Create your first code example to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExamples.map((example) => (
              <div
                key={example.id}
                className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-blue-600 font-semibold mb-1">
                      Week {example.week_number}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{example.title}</h3>
                  </div>
                  {example.is_starter && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      Starter
                    </span>
                  )}
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{example.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(example)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => loadVersionHistory(example)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                    title="Version History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(example.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showVersionHistory && selectedExample && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Version History</h3>
                  <p className="text-slate-600">{selectedExample.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowVersionHistory(false);
                    setVersions([]);
                    setSelectedExample(null);
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {versions.length === 0 ? (
                  <p className="text-center text-slate-500 py-12">No version history yet</p>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-blue-900">
                            Current Version (v{selectedExample.version_number})
                          </div>
                          <div className="text-sm text-blue-700">Latest changes</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleCompareVersions(
                            versions[0] || {
                              html_code: selectedExample.html_code,
                              css_code: selectedExample.css_code,
                              js_code: selectedExample.js_code
                            } as CodeExampleVersion,
                            {
                              html_code: selectedExample.html_code,
                              css_code: selectedExample.css_code,
                              js_code: selectedExample.js_code
                            } as CodeExampleVersion,
                            'html'
                          )}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          <GitCompare className="w-4 h-4 inline mr-1" />
                          Compare HTML
                        </button>
                        <button
                          onClick={() => handleCompareVersions(
                            versions[0] || {
                              html_code: selectedExample.html_code,
                              css_code: selectedExample.css_code,
                              js_code: selectedExample.js_code
                            } as CodeExampleVersion,
                            {
                              html_code: selectedExample.html_code,
                              css_code: selectedExample.css_code,
                              js_code: selectedExample.js_code
                            } as CodeExampleVersion,
                            'css'
                          )}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          <GitCompare className="w-4 h-4 inline mr-1" />
                          Compare CSS
                        </button>
                        <button
                          onClick={() => handleCompareVersions(
                            versions[0] || {
                              html_code: selectedExample.html_code,
                              css_code: selectedExample.css_code,
                              js_code: selectedExample.js_code
                            } as CodeExampleVersion,
                            {
                              html_code: selectedExample.html_code,
                              css_code: selectedExample.css_code,
                              js_code: selectedExample.js_code
                            } as CodeExampleVersion,
                            'js'
                          )}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          <GitCompare className="w-4 h-4 inline mr-1" />
                          Compare JS
                        </button>
                      </div>
                    </div>

                    {versions.map((version, index) => (
                      <div
                        key={version.id}
                        className="p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-slate-900">Version {version.version_number}</div>
                            <div className="text-sm text-slate-600">
                              {new Date(version.created_at).toLocaleString()}
                            </div>
                            {version.change_summary && (
                              <div className="text-sm text-slate-500 mt-1">{version.change_summary}</div>
                            )}
                          </div>
                        </div>
                        {index > 0 && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleCompareVersions(version, versions[index - 1], 'html')}
                              className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition"
                            >
                              <GitCompare className="w-4 h-4 inline mr-1" />
                              Compare HTML
                            </button>
                            <button
                              onClick={() => handleCompareVersions(version, versions[index - 1], 'css')}
                              className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition"
                            >
                              <GitCompare className="w-4 h-4 inline mr-1" />
                              Compare CSS
                            </button>
                            <button
                              onClick={() => handleCompareVersions(version, versions[index - 1], 'js')}
                              className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition"
                            >
                              <GitCompare className="w-4 h-4 inline mr-1" />
                              Compare JS
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showDiff && diffOldVersion && diffNewVersion && (
          <CodeDiffViewer
            oldCode={
              diffLanguage === 'html' ? diffOldVersion.html_code :
              diffLanguage === 'css' ? diffOldVersion.css_code :
              diffOldVersion.js_code
            }
            newCode={
              diffLanguage === 'html' ? diffNewVersion.html_code :
              diffLanguage === 'css' ? diffNewVersion.css_code :
              diffNewVersion.js_code
            }
            language={diffLanguage}
            onClose={() => setShowDiff(false)}
          />
        )}
      </div>
    </div>
  );
}
