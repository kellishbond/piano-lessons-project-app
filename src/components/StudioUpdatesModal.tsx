import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Bell,
  Sparkles,
  PlusCircle,
  Megaphone,
  CheckCircle2,
  Calendar,
  Tag,
  X,
  Send,
  BookOpen,
  Music,
  Flame
} from 'lucide-react';

interface StudioUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UpdateItem {
  id: string;
  title: string;
  category: 'Curriculum' | 'Studio Feature' | 'Practice Tip' | 'Announcement' | string;
  authorName: string;
  authorRole: string;
  content: string;
  tag?: string;
  createdAt: string;
}

export const StudioUpdatesModal: React.FC<StudioUpdatesModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewForm, setShowNewForm] = useState<boolean>(false);

  // New update form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Studio Feature');
  const [tag, setTag] = useState('Update');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    try {
      const data = await api.getUpdates();
      setUpdates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUpdates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setSubmitError('Please fill out both the title and content.');
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await api.createUpdate({
        title: title.trim(),
        category,
        content: content.trim(),
        tag: tag.trim() || undefined,
      });
      setTitle('');
      setContent('');
      setShowNewForm(false);
      await fetchUpdates();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to publish update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Curriculum':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Studio Feature':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Practice Tip':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      default:
        return 'bg-purple-100 text-purple-900 border-purple-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Studio Updates & Notes
              </h3>
              <p className="text-xs text-stone-500">
                Latest announcements, pedagogical guidance, and system releases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action subbar */}
        <div className="px-6 py-2.5 bg-stone-100/60 border-b border-stone-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-600">
            {updates.length} Updates Available
          </span>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-amber-800" />
            {showNewForm ? 'View Updates' : 'Add New Update'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {showNewForm ? (
            <form onSubmit={handlePostUpdate} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-700" />
                <span>Posting as <strong>{user?.name || 'Studio Member'}</strong> ({user?.role || 'Student'})</span>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Update Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Milestone Badges or Fingering Tip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 font-medium"
                  >
                    <option value="Studio Feature">Studio Feature</option>
                    <option value="Curriculum">Curriculum</option>
                    <option value="Practice Tip">Practice Tip</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Tag Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Release v2.1 or Technique"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Update Content & Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the update, pedagogical insights, or new features available to learners..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 text-sm font-medium"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Publishing...' : 'Publish Update'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-stone-400 text-xs">Loading studio updates...</div>
              ) : updates.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">No updates posted yet.</div>
              ) : (
                updates.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        {item.tag && (
                          <span className="text-[10px] font-semibold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                            #{item.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>Posted by <strong className="text-stone-700">{item.authorName}</strong> ({item.authorRole})</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
