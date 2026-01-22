import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Video, Link as LinkIcon, BookOpen, Search, Filter, Plus, Edit, Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CourseResource } from '../types/database';

const RESOURCE_TYPES = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'link', label: 'Link', icon: LinkIcon },
  { value: 'reading', label: 'Reading', icon: BookOpen },
  { value: 'other', label: 'Other', icon: FileText },
];

export default function ResourceLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weekFilter, setWeekFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    resource_type: 'pdf' as string,
    week_number: 1,
    file_url: '',
    is_link: false,
    file: null as File | null,
  });

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, weekFilter, typeFilter]);

  const loadResources = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('course_resources')
      .select('*')
      .order('week_number', { ascending: true })
      .order('order_index', { ascending: true });

    if (data) {
      setResources(data);
    }
    setLoading(false);
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (weekFilter !== null) {
      filtered = filtered.filter(r => r.week_number === weekFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.resource_type === typeFilter);
    }

    setFilteredResources(filtered);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${uploadForm.week_number}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('course-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!uploadForm.title.trim()) return;

    setUploading(true);

    try {
      let fileUrl = uploadForm.file_url;

      if (uploadForm.file && !uploadForm.is_link) {
        fileUrl = await uploadFile(uploadForm.file);
      }

      const { error } = await supabase
        .from('course_resources')
        .insert({
          title: uploadForm.title,
          description: uploadForm.description,
          resource_type: uploadForm.resource_type,
          week_number: uploadForm.week_number,
          file_url: fileUrl,
          file_size: uploadForm.file?.size || 0,
          uploaded_by: user?.id || null,
          is_public: true,
        });

      if (!error) {
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          resource_type: 'pdf',
          week_number: 1,
          file_url: '',
          is_link: false,
          file: null,
        });
        loadResources();
      }
    } catch (error) {
      console.error('Error uploading:', error);
    }

    setUploading(false);
  };

  const deleteResource = async (id: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    const { error } = await supabase
      .from('course_resources')
      .delete()
      .eq('id', id);

    if (!error) {
      if (fileUrl.includes('course-files')) {
        const path = fileUrl.split('course-files/')[1];
        await supabase.storage.from('course-files').remove([path]);
      }
      loadResources();
    }
  };

  const getResourceIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find(t => t.value === type);
    return resourceType?.icon || FileText;
  };

  const groupedResources = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.week_number]) {
      acc[resource.week_number] = [];
    }
    acc[resource.week_number].push(resource);
    return acc;
  }, {} as Record<number, CourseResource[]>);

  const weeks = Object.keys(groupedResources)
    .map(Number)
    .sort((a, b) => a - b);

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
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Resource Library</h1>
              <p className="text-slate-600">Manage course materials, videos, and resources</p>
            </div>
            {user && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Upload Resource
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={weekFilter === null ? 'all' : weekFilter}
              onChange={(e) => setWeekFilter(e.target.value === 'all' ? null : Number(e.target.value))}
              className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Weeks</option>
              {Array.from({ length: 16 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              {RESOURCE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading resources...</div>
          </div>
        ) : weeks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No resources found</h3>
            <p className="text-slate-600 mb-6">Upload your first resource to get started</p>
          </div>
        ) : (
          <div className="space-y-8">
            {weeks.map(week => (
              <div key={week} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">Week {week}</h2>
                  <p className="text-blue-100">{groupedResources[week].length} resources</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedResources[week].map(resource => {
                      const Icon = getResourceIcon(resource.resource_type);
                      return (
                        <div
                          key={resource.id}
                          className="border-2 border-slate-200 rounded-lg p-4 hover:border-blue-500 transition group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                              <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1 truncate">
                                {resource.title}
                              </h3>
                              {resource.description && (
                                <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                  {resource.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <a
                                  href={resource.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </a>
                                {user && (
                                  <button
                                    onClick={() => deleteResource(resource.id, resource.file_url)}
                                    className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Upload Resource</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="e.g., Week 1 Lecture Slides"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Brief description of the resource"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Week Number
                    </label>
                    <input
                      type="number"
                      value={uploadForm.week_number}
                      onChange={(e) => setUploadForm({ ...uploadForm, week_number: parseInt(e.target.value) })}
                      min="1"
                      max="16"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Resource Type
                    </label>
                    <select
                      value={uploadForm.resource_type}
                      onChange={(e) => setUploadForm({ ...uploadForm, resource_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      {RESOURCE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setUploadForm({ ...uploadForm, is_link: false })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                      !uploadForm.is_link
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload File
                  </button>
                  <button
                    onClick={() => setUploadForm({ ...uploadForm, is_link: true })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                      uploadForm.is_link
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Add Link
                  </button>
                </div>

                {uploadForm.is_link ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      External Link URL
                    </label>
                    <input
                      type="url"
                      value={uploadForm.file_url}
                      onChange={(e) => setUploadForm({ ...uploadForm, file_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Upload File
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    {uploadForm.file && (
                      <p className="text-sm text-slate-600 mt-2">
                        Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading || !uploadForm.title.trim() || (!uploadForm.is_link && !uploadForm.file) || (uploadForm.is_link && !uploadForm.file_url)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
