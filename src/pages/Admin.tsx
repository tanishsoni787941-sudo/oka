import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { INITIAL_LESSONS, Lesson } from '../data/lessons';
import { Video, Save, Loader2, CheckCircle, AlertCircle, ChevronLeft, LogOut, Users, Settings, ShieldAlert, Trash2, Ban, UserCheck, UserPlus, X, MessageSquare, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

type AdminTab = 'content' | 'users' | 'messages';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: number;
  read: boolean;
}

export default function Admin() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // User Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setMessage(null);
      try {
        // Fetch Lessons
        const storedLessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
        if (storedLessons.length === 0) {
          localStorage.setItem('mock_lessons', JSON.stringify(INITIAL_LESSONS));
          setLessons(INITIAL_LESSONS);
        } else {
          setLessons(storedLessons);
        }

        // Fetch Users
        const storedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        setUsers(storedUsers);

        // Fetch Messages
        const storedMessages = JSON.parse(localStorage.getItem('mock_messages') || '[]');
        setMessages(storedMessages);
      } catch (error: any) {
        setMessage({ type: 'error', text: "Error fetching data: " + error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Listen for changes from other tabs
    window.addEventListener('storage', fetchData);
    return () => window.removeEventListener('storage', fetchData);
  }, []);

  const handleUrlChange = (id: string, newUrl: string) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, videoUrl: newUrl } : l));
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    setSaving(true);
    setMessage(null);
    try {
      const updatedLessons = lessons.map(l => l.id === lesson.id ? lesson : l);
      localStorage.setItem('mock_lessons', JSON.stringify(updatedLessons));
      setLessons(updatedLessons);
      setMessage({ type: 'success', text: `Updated ${lesson.title} video link successfully!` });
    } catch (error) {
      setMessage({ type: 'error', text: "Failed to update video link." });
    } finally {
      setSaving(false);
    }
  };

  const toggleUserBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const updatedUsers = users.map(u => u.id === userId ? { ...u, is_blocked: !currentStatus } : u);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setMessage({ type: 'success', text: `User ${!currentStatus ? 'blocked' : 'unblocked'} successfully.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Failed to update user status." });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setMessage({ type: 'success', text: "User deleted successfully." });
      setShowDeleteConfirm(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Failed to delete user." });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = newUser.email.trim().toLowerCase();
    const trimmedName = newUser.name.trim();
    const trimmedPassword = newUser.password.trim();

    if (!trimmedEmail || !trimmedName || !trimmedPassword) {
      setMessage({ type: 'error', text: "All fields are required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setMessage({ type: 'error', text: "Invalid email format." });
      return;
    }

    if (trimmedPassword.length < 6) {
      setMessage({ type: 'error', text: "Password must be at least 6 characters long." });
      return;
    }

    setCreating(true);
    setMessage(null);
    try {
      if (users.find(u => u.email === trimmedEmail)) {
        throw new Error("Email already exists.");
      }

      const newStudent: UserProfile = {
        id: uuidv4(),
        full_name: trimmedName,
        email: trimmedEmail,
        role: 'student',
        created_at: Date.now(),
        active_device_id: '',
        completed_videos: [],
        progress_percentage: 0,
        is_blocked: false,
        student_id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        profile_photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${trimmedEmail}`
      };

      const updatedUsers = [...users, newStudent];
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      setMessage({ type: 'success', text: "User created successfully!" });
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Failed to create user." });
    } finally {
      setCreating(false);
    }
  };

  const toggleMessageRead = (messageId: string, currentStatus: boolean) => {
    const updatedMessages = messages.map(m => m.id === messageId ? { ...m, read: !currentStatus } : m);
    localStorage.setItem('mock_messages', JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  const deleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(m => m.id !== messageId);
    localStorage.setItem('mock_messages', JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setMessage({ type: 'success', text: "Message deleted successfully." });
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
            <p className="text-stone-600 dark:text-stone-400">Manage users, messages, and content</p>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-4 bg-white dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 w-fit overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'users' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' 
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'messages' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' 
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Messages
              {messages.filter(m => !m.read).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeTab === 'content' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' 
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <Video className="h-4 w-4" />
              Content
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none whitespace-nowrap"
            >
              <UserPlus className="h-4 w-4" />
              Add New Student
            </button>
          )}
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

        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-stone-900 rounded-3xl p-8 w-full max-w-md border border-stone-200 dark:border-stone-800 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-stone-900 dark:text-white">Add New <span className="text-purple-600">Student</span></h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
                    <X className="h-6 w-6 text-stone-500" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Full Name</label>
                    <input
                      required
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Email Address</label>
                    <input
                      required
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">Password</label>
                    <input
                      required
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200 dark:shadow-none mt-4"
                  >
                    {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                    Create Student Account
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-stone-900 rounded-3xl p-8 w-full max-w-md border border-stone-200 dark:border-stone-800 shadow-2xl"
              >
                <div className="text-center">
                  <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2">Delete User?</h2>
                  <p className="text-stone-600 dark:text-stone-400 mb-8">
                    Are you sure you want to delete this user? This action cannot be undone and will remove all their progress data.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 py-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteUser(showDeleteConfirm)}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
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
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{u.id}</p>
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
                              onClick={() => setShowDeleteConfirm(u.id)}
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

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm"
            >
              {messages.length === 0 ? (
                <div className="p-12 text-center text-stone-500 dark:text-stone-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Date</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">User</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Message</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {messages.sort((a, b) => b.date - a.date).map((m) => (
                        <tr key={m.id} className={`hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors ${!m.read ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-stone-400">
                            {new Date(m.date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-stone-900 dark:text-white">{m.name}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-500">{m.email}</p>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p className="text-sm text-stone-700 dark:text-stone-300 truncate" title={m.message}>{m.message}</p>
                          </td>
                          <td className="px-6 py-4">
                            {!m.read ? (
                              <span className="text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">New</span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-full">Read</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleMessageRead(m.id, m.read)}
                                title={m.read ? "Mark as Unread" : "Mark as Read"}
                                className={`p-2 rounded-lg transition-all ${
                                  m.read 
                                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200' 
                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-200'
                                }`}
                              >
                                {m.read ? <MessageSquare className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => deleteMessage(m.id)}
                                title="Delete Message"
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
              )}
            </motion.div>
          )}

          {activeTab === 'content' && (
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
                        Video URL
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => handleUrlChange(lesson.id, e.target.value)}
                          placeholder="https://..."
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
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
