import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserPreferences } from '../types/database';

const THEME_OPTIONS = [
  { value: 'vs-dark', label: 'Dark' },
  { value: 'vs', label: 'Light' },
  { value: 'hc-black', label: 'High Contrast Dark' }
];

const FONT_SIZE_OPTIONS = [10, 12, 14, 16, 18, 20, 22, 24];
const TAB_SIZE_OPTIONS = [2, 4, 8];
const AUTO_SAVE_INTERVALS = [
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 300, label: '5 minutes' }
];

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    editor_theme: 'vs-dark',
    font_size: 14,
    tab_size: 2,
    word_wrap: true,
    line_numbers: true,
    auto_save: false,
    auto_save_interval: 30
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_email', user.email)
        .maybeSingle();

      if (data) {
        setPreferences(data);
      }
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!userEmail) return;

    setSaving(true);

    const dataToSave = {
      user_email: userEmail,
      ...preferences,
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_email', userEmail)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_preferences')
        .update(dataToSave)
        .eq('user_email', userEmail);
    } else {
      await supabase
        .from('user_preferences')
        .insert(dataToSave);
    }

    setSaving(false);
  };

  const handleReset = () => {
    setPreferences({
      editor_theme: 'vs-dark',
      font_size: 14,
      tab_size: 2,
      word_wrap: true,
      line_numbers: true,
      auto_save: false,
      auto_save_interval: 30
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Editor Settings</h1>
          <p className="text-slate-600">Customize your code editor experience</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" />
              Appearance
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Editor Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setPreferences({ ...preferences, editor_theme: theme.value })}
                      className={`p-4 rounded-lg border-2 transition ${
                        preferences.editor_theme === theme.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-medium">{theme.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Font Size: {preferences.font_size}px
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="24"
                    step="2"
                    value={preferences.font_size}
                    onChange={(e) => setPreferences({ ...preferences, font_size: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <select
                    value={preferences.font_size}
                    onChange={(e) => setPreferences({ ...preferences, font_size: parseInt(e.target.value) })}
                    className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {FONT_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 p-4 bg-slate-900 rounded-lg">
                  <code
                    className="text-slate-100"
                    style={{ fontSize: `${preferences.font_size}px` }}
                  >
                    const example = 'Preview of font size';
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Tab Size
                </label>
                <div className="flex gap-3">
                  {TAB_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      onClick={() => setPreferences({ ...preferences, tab_size: size })}
                      className={`px-6 py-3 rounded-lg border-2 transition font-medium ${
                        preferences.tab_size === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {size} spaces
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-100 pt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Editor Behavior</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <div className="font-semibold text-slate-900">Show Line Numbers</div>
                  <div className="text-sm text-slate-600">Display line numbers in the editor</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.line_numbers}
                  onChange={(e) => setPreferences({ ...preferences, line_numbers: e.target.checked })}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <div className="font-semibold text-slate-900">Word Wrap</div>
                  <div className="text-sm text-slate-600">Wrap long lines to fit in the editor</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.word_wrap}
                  onChange={(e) => setPreferences({ ...preferences, word_wrap: e.target.checked })}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <div className="font-semibold text-slate-900">Auto Save</div>
                  <div className="text-sm text-slate-600">Automatically save your work periodically</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.auto_save}
                  onChange={(e) => setPreferences({ ...preferences, auto_save: e.target.checked })}
                  className="w-5 h-5"
                />
              </label>

              {preferences.auto_save && (
                <div className="ml-4 pl-4 border-l-4 border-blue-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Auto Save Interval
                  </label>
                  <select
                    value={preferences.auto_save_interval}
                    onChange={(e) => setPreferences({ ...preferences, auto_save_interval: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {AUTO_SAVE_INTERVALS.map((interval) => (
                      <option key={interval.value} value={interval.value}>
                        {interval.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t-2 border-slate-100">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            These settings will be applied to the Code Playground and Code Examples editor. Changes take effect immediately after saving.
          </p>
        </div>
      </div>
    </div>
  );
}
