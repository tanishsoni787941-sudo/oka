import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { INITIAL_LESSONS, Lesson } from '../data/lessons';
import { Video, Save, Loader2, CheckCircle, AlertCircle, ChevronLeft, LogOut, Users, Settings, ShieldAlert, Trash2, Ban, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

type AdminTab = 'content' | 'users';

export default function Admin() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Lessons
        const lessonsSnapshot = await getDocs(collection(db, 'lessons'));
        if (lessonsSnapshot.empty) {
          const initialData = [...INITIAL_LESSONS];
          for (const lesson of initialData) {
            await setDoc(doc(db, 'lessons', lesson.id), lesson);
          }
          setLessons(initialData);
        } else {
          const fetchedLessons = lessonsSnapshot.docs.map(doc => doc.data() as Lesson);
          fetchedLessons.sort((a, b) => a.order - b.order);
          setLessons(fetchedLessons);
        }

        // Fetch Users
        const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('created_at', 'desc')));
        const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setUsers(fetchedUsers);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUrlChange = (id: string, newUrl: string) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, videoUrl: newUrl } : l));
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    setSaving(true);
    setMessage(null);
    try {
      await updateDoc(doc(db, 'lessons', lesson.id), {
        videoUrl: lesson.videoUrl
      });
      setMessage({ type: 'success', text: `Updated ${lesson.title} video link successfully!` });
    } catch (error) {
      console.error("Error updating lesson:", error);
      setMessage({ type: 'error', text: "Failed to update video link." });
    } finally {
      setSaving(false);
    }
  };

  const toggleUserBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        is_blocked: !currentStatus
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: !currentStatus } : u));
      setMessage({ type: 'success', text: `User ${!currentStatus ? 'blocked' : 'unblocked'} successfully.` });
    } catch (error) {
      console.error("Error toggling user block:", error);
      setMessage({ type: 'error', text: "Failed to update user status." });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      setMessage({ type: 'success', text: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage({ type: 'error', text: "Failed to delete user." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Access Denied</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-2">
              Admin <span className="text-purple-600">Dashboard</span>
            </h1>
            <p className="text-stone-600 dark:text-stone-400">Manage course content and users</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/"
              className="px-5 py-2.5 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Course
            </Link>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-stone-900 dark:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 dark:hover:bg-stone-700 transition-all shadow-lg shadow-stone-200 dark:shadow-none"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8 bg-white dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 w-fit">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'content' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' 
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Video className="h-4 w-4" />
            Content Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'users' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' 
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Users className="h-4 w-4" />
            User Management
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            {message.text}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'content' ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {lessons.map((lesson) => (
                <div key={lesson.id} className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md mb-2 inline-block">
                        Lesson {lesson.order}
                      </span>
                      <h2 className="text-xl font-bold text-stone-900 dark:text-white">{lesson.title}</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Google Drive Video URL (Preview Link)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => handleUrlChange(lesson.id, e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../preview"
                          className="flex-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                        />
                        <button
                          onClick={() => handleSaveLesson(lesson)}
                          disabled={saving}
                          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200 dark:shadow-none"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Changes
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">English PDF</p>
                        <p className="text-xs text-stone-600 dark:text-stone-400 truncate">{lesson.pdfEnglish}</p>
                      </div>
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Hindi PDF</p>
                        <p className="text-xs text-stone-600 dark:text-stone-400 truncate">{lesson.pdfHindi}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Student</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">ID / Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Progress</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold">
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900 dark:text-white">{u.full_name}</p>
                              <p className="text-xs text-stone-500 dark:text-stone-500 capitalize">{u.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{u.student_id}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-500">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-600" 
                                style={{ width: `${u.progress_percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{u.progress_percentage || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.is_blocked ? (
                            <span className="text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">Blocked</span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleUserBlock(u.id, u.is_blocked)}
                              title={u.is_blocked ? "Unblock User" : "Block User"}
                              className={`p-2 rounded-lg transition-all ${
                                u.is_blocked 
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100' 
                                  : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                              }`}
                            >
                              {u.is_blocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              title="Delete User"
                              className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
