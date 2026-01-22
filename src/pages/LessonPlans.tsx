import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Edit2, X, BookOpen, Target, ListChecks, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LessonPlan } from '../types/database';

export default function LessonPlans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    week_number: 1,
    title: '',
    learning_objectives: [''],
    topics_covered: [''],
    activities: '',
    homework: '',
    required_readings: '',
    notes: '',
    duration_minutes: 90,
  });

  useEffect(() => {
    loadLessonPlans();
  }, []);

  const loadLessonPlans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lesson_plans')
      .select('*')
      .order('week_number', { ascending: true });

    if (data) {
      setLessonPlans(data);
    }
    setLoading(false);
  };

  const startEditing = (week: number) => {
    const existing = lessonPlans.find(lp => lp.week_number === week);
    if (existing) {
      setForm({
        week_number: existing.week_number,
        title: existing.title,
        learning_objectives: existing.learning_objectives.length > 0 ? existing.learning_objectives : [''],
        topics_covered: existing.topics_covered.length > 0 ? existing.topics_covered : [''],
        activities: existing.activities,
        homework: existing.homework,
        required_readings: existing.required_readings,
        notes: existing.notes,
        duration_minutes: existing.duration_minutes,
      });
    } else {
      setForm({
        week_number: week,
        title: '',
        learning_objectives: [''],
        topics_covered: [''],
        activities: '',
        homework: '',
        required_readings: '',
        notes: '',
        duration_minutes: 90,
      });
    }
    setEditingWeek(week);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    setSaving(true);

    const cleanedObjectives = form.learning_objectives.filter(obj => obj.trim() !== '');
    const cleanedTopics = form.topics_covered.filter(topic => topic.trim() !== '');

    const existing = lessonPlans.find(lp => lp.week_number === form.week_number);

    try {
      if (existing) {
        const { error } = await supabase
          .from('lesson_plans')
          .update({
            title: form.title,
            learning_objectives: cleanedObjectives,
            topics_covered: cleanedTopics,
            activities: form.activities,
            homework: form.homework,
            required_readings: form.required_readings,
            notes: form.notes,
            duration_minutes: form.duration_minutes,
          })
          .eq('week_number', form.week_number);

        if (!error) {
          setEditingWeek(null);
          loadLessonPlans();
        }
      } else {
        const { error } = await supabase
          .from('lesson_plans')
          .insert({
            week_number: form.week_number,
            title: form.title,
            learning_objectives: cleanedObjectives,
            topics_covered: cleanedTopics,
            activities: form.activities,
            homework: form.homework,
            required_readings: form.required_readings,
            notes: form.notes,
            duration_minutes: form.duration_minutes,
          });

        if (!error) {
          setEditingWeek(null);
          loadLessonPlans();
        }
      }
    } catch (error) {
      console.error('Error saving lesson plan:', error);
    }

    setSaving(false);
  };

  const addObjective = () => {
    setForm({ ...form, learning_objectives: [...form.learning_objectives, ''] });
  };

  const removeObjective = (index: number) => {
    const newObjectives = form.learning_objectives.filter((_, i) => i !== index);
    setForm({ ...form, learning_objectives: newObjectives.length > 0 ? newObjectives : [''] });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...form.learning_objectives];
    newObjectives[index] = value;
    setForm({ ...form, learning_objectives: newObjectives });
  };

  const addTopic = () => {
    setForm({ ...form, topics_covered: [...form.topics_covered, ''] });
  };

  const removeTopic = (index: number) => {
    const newTopics = form.topics_covered.filter((_, i) => i !== index);
    setForm({ ...form, topics_covered: newTopics.length > 0 ? newTopics : [''] });
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...form.topics_covered];
    newTopics[index] = value;
    setForm({ ...form, topics_covered: newTopics });
  };

  const weeks = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Lesson Plans</h1>
              <p className="text-slate-600">Plan learning objectives and activities for each week</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading lesson plans...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {weeks.map(week => {
              const lessonPlan = lessonPlans.find(lp => lp.week_number === week);
              const isEditing = editingWeek === week;

              return (
                <div key={week} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div
                    className={`px-6 py-4 flex items-center justify-between ${
                      lessonPlan
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                        : 'bg-gradient-to-r from-slate-400 to-slate-500'
                    }`}
                  >
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">Week {week}</h2>
                      {lessonPlan && !isEditing && (
                        <p className="text-blue-100">{lessonPlan.title}</p>
                      )}
                    </div>
                    {user && !isEditing && (
                      <button
                        onClick={() => startEditing(week)}
                        className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
                      >
                        {lessonPlan ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {lessonPlan ? 'Edit' : 'Create'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="p-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g., Introduction to HTML & CSS"
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <Target className="w-4 h-4 inline mr-1" />
                            Learning Objectives
                          </label>
                          {form.learning_objectives.map((objective, index) => (
                            <div key={index} className="flex items-start gap-2 mb-2">
                              <input
                                type="text"
                                value={objective}
                                onChange={(e) => updateObjective(index, e.target.value)}
                                placeholder={`Objective ${index + 1}`}
                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                              />
                              {form.learning_objectives.length > 1 && (
                                <button
                                  onClick={() => removeObjective(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addObjective}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            + Add Objective
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <ListChecks className="w-4 h-4 inline mr-1" />
                            Topics Covered
                          </label>
                          {form.topics_covered.map((topic, index) => (
                            <div key={index} className="flex items-start gap-2 mb-2">
                              <input
                                type="text"
                                value={topic}
                                onChange={(e) => updateTopic(index, e.target.value)}
                                placeholder={`Topic ${index + 1}`}
                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                              />
                              {form.topics_covered.length > 1 && (
                                <button
                                  onClick={() => removeTopic(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addTopic}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            + Add Topic
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            In-Class Activities
                          </label>
                          <textarea
                            value={form.activities}
                            onChange={(e) => setForm({ ...form, activities: e.target.value })}
                            rows={4}
                            placeholder="Describe class activities and exercises..."
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Homework Assignment
                          </label>
                          <textarea
                            value={form.homework}
                            onChange={(e) => setForm({ ...form, homework: e.target.value })}
                            rows={3}
                            placeholder="Describe homework or project assignments..."
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Required Readings
                          </label>
                          <textarea
                            value={form.required_readings}
                            onChange={(e) => setForm({ ...form, required_readings: e.target.value })}
                            rows={3}
                            placeholder="List readings or materials students should review..."
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Additional Notes
                          </label>
                          <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={2}
                            placeholder="Any additional notes for this lesson..."
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={form.duration_minutes}
                            onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                            min="30"
                            max="180"
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setEditingWeek(null)}
                          className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving || !form.title.trim()}
                          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Lesson Plan'}
                        </button>
                      </div>
                    </div>
                  ) : lessonPlan ? (
                    <div className="p-6">
                      {lessonPlan.learning_objectives.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Learning Objectives
                          </h3>
                          <ul className="list-disc list-inside text-slate-700 space-y-1">
                            {lessonPlan.learning_objectives.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {lessonPlan.topics_covered.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <ListChecks className="w-4 h-4" />
                            Topics Covered
                          </h3>
                          <ul className="list-disc list-inside text-slate-700 space-y-1">
                            {lessonPlan.topics_covered.map((topic, idx) => (
                              <li key={idx}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {lessonPlan.activities && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900 mb-2">Activities</h3>
                          <p className="text-slate-700 whitespace-pre-wrap">{lessonPlan.activities}</p>
                        </div>
                      )}

                      {lessonPlan.homework && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900 mb-2">Homework</h3>
                          <p className="text-slate-700 whitespace-pre-wrap">{lessonPlan.homework}</p>
                        </div>
                      )}

                      {lessonPlan.required_readings && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900 mb-2">Required Readings</h3>
                          <p className="text-slate-700 whitespace-pre-wrap">{lessonPlan.required_readings}</p>
                        </div>
                      )}

                      {lessonPlan.notes && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
                          <p className="text-slate-700 whitespace-pre-wrap">{lessonPlan.notes}</p>
                        </div>
                      )}

                      <div className="text-sm text-slate-500 mt-4">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Duration: {lessonPlan.duration_minutes} minutes
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      No lesson plan created yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
