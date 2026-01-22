import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Code, Save, User, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CodeExample } from '../types/database';
import CodeEditor from '../components/CodeEditor';

export default function CodePlayground() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exampleId = searchParams.get('example');

  const [examples, setExamples] = useState<CodeExample[]>([]);
  const [selectedExample, setSelectedExample] = useState<CodeExample | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [weekFilter, setWeekFilter] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const [code, setCode] = useState({
    html: '<h1>Hello World!</h1>\n<p>Start coding here...</p>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n}',
    js: '// JavaScript goes here\nconsole.log("Welcome to the code playground!");'
  });

  const [saveForm, setSaveForm] = useState({
    name: '',
    email: '',
    title: ''
  });

  useEffect(() => {
    loadExamples();
  }, []);

  useEffect(() => {
    if (exampleId && examples.length > 0) {
      const example = examples.find((ex) => ex.id === exampleId);
      if (example) {
        loadExample(example);
      }
    }
  }, [exampleId, examples]);

  const loadExamples = async () => {
    const { data } = await supabase
      .from('code_examples')
      .select('*')
      .order('week_number', { ascending: true })
      .order('order_index', { ascending: true });

    if (data) {
      setExamples(data);
    }
  };

  const loadExample = (example: CodeExample) => {
    setSelectedExample(example);
    setCode({
      html: example.html_code,
      css: example.css_code,
      js: example.js_code
    });
    setShowExamples(false);
  };

  const handleSaveCode = async (html: string, css: string, js: string) => {
    setCode({ html, css, js });
    setShowSaveDialog(true);
  };

  const submitSave = async () => {
    if (!saveForm.name || !saveForm.email || !saveForm.title) {
      alert('Please fill in all fields');
      return;
    }

    await supabase.from('student_code_saves').insert({
      student_name: saveForm.name,
      student_email: saveForm.email,
      title: saveForm.title,
      html_code: code.html,
      css_code: code.css,
      js_code: code.js,
      forked_from: selectedExample?.id || null
    });

    setShowSaveDialog(false);
    setSaveForm({ name: '', email: '', title: '' });
    alert('Your code has been saved!');
  };

  const startFresh = () => {
    setSelectedExample(null);
    setCode({
      html: '<h1>Hello World!</h1>\n<p>Start coding here...</p>',
      css: 'body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n}',
      js: '// JavaScript goes here\nconsole.log("Welcome to the code playground!");'
    });
    setShowExamples(false);
  };

  const filteredExamples = weekFilter
    ? examples.filter((ex) => ex.week_number === weekFilter)
    : examples;

  const weeks = Array.from(new Set(examples.map((ex) => ex.week_number))).sort((a, b) => a - b);

  if (showExamples) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Code Playground</h1>
            <p className="text-slate-600">
              Practice HTML, CSS, and JavaScript with live previews
            </p>
          </div>

          <div className="mb-8">
            <button
              onClick={startFresh}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Start Fresh Project
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

          {filteredExamples.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl text-slate-600">No examples available yet</p>
              <p className="text-slate-500 mt-2">Check back later for code examples</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExamples.map((example) => (
                <div
                  key={example.id}
                  className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 hover:border-blue-300 transition cursor-pointer"
                  onClick={() => loadExample(example)}
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

                  <p className="text-slate-600 text-sm mb-4">{example.description}</p>

                  <div className="text-blue-600 font-medium text-sm hover:text-blue-700">
                    Open in Editor →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <button
            onClick={() => setShowExamples(true)}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Examples
          </button>
          {selectedExample && (
            <div>
              <span className="text-sm text-blue-400">Week {selectedExample.week_number}</span>
              <h2 className="text-xl font-bold text-white">{selectedExample.title}</h2>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <CodeEditor
          initialHtml={code.html}
          initialCss={code.css}
          initialJs={code.js}
          onSave={handleSaveCode}
          onReset={
            selectedExample
              ? () =>
                  setCode({
                    html: selectedExample.html_code,
                    css: selectedExample.css_code,
                    js: selectedExample.js_code
                  })
              : undefined
          }
          autoRun={true}
        />
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Save Your Code</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={saveForm.name}
                    onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={saveForm.email}
                    onChange={(e) => setSaveForm({ ...saveForm, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={saveForm.title}
                  onChange={(e) => setSaveForm({ ...saveForm, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="My Awesome Project"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitSave}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
