'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userAPI, postsAPI } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  headline: string;
  profilePicture: string | null;
}

interface UserPreferences {
  role?: string;
  goals?: string;
  challenges?: string;
  targetCountry?: string;
  contentTone?: string;
}

interface Post {
  id: number;
  content: string;
  status: string;
  isAIGenerated: boolean;
  createdAt: string;
  publishedAt: string;
  linkedinPostId: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'preferences'>('create');

  // Auto-resize textarea function
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  useEffect(() => {
    const token = localStorage.getItem('linkedin_token');
    if (!token) {
      router.push('/');
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const [profileRes, prefsRes, postsRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getPreferences(),
        postsAPI.getMyPosts()
      ]);

      setProfile(profileRes.data);
      setPreferences(prefsRes.data);
      setPosts(postsRes.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('linkedin_token');
        router.push('/');
      } else {
        setError('Failed to load dashboard data');
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('http://localhost:3000/auth/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('linkedin_token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all local storage
      localStorage.removeItem('linkedin_token');
      localStorage.clear();
      
      // Also logout from LinkedIn to clear their session
      // Open LinkedIn logout in a hidden iframe or new window
      const linkedinLogoutUrl = 'https://www.linkedin.com/m/logout';
      const logoutWindow = window.open(linkedinLogoutUrl, '_blank', 'width=1,height=1');
      
      // Close the logout window after 2 seconds
      setTimeout(() => {
        if (logoutWindow) {
          logoutWindow.close();
        }
        // Redirect to home page
        router.push('/');
      }, 2000);
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    setMessage(null);

    try {
      const response = await postsAPI.generateAIContent();
      setPostContent(response.data.content);
      setMessage({ type: 'success', text: '✨ AI content generated! Review and edit before publishing.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to generate content. Please try again.' });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postContent.trim()) {
      setMessage({ type: 'error', text: 'Please enter some content' });
      return;
    }

    setPosting(true);
    setMessage(null);

    try {
      await postsAPI.createPost(postContent, false);
      setMessage({ type: 'success', text: '🎉 Post published successfully on LinkedIn!' });
      setPostContent('');
      loadDashboardData(); // Reload posts
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to publish post' });
    } finally {
      setPosting(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.updatePreferences(preferences);
      setMessage({ type: 'success', text: '✅ Preferences saved successfully!' });
      setShowPreferences(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">LinkedIn AI Assistant</span>
            </div>
            <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt={`${profile.firstName} ${profile.lastName}`} className="w-20 h-20 rounded-full border-4 border-blue-100" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-100">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h2>
                {profile?.headline && <p className="text-gray-600 mt-1">{profile.headline}</p>}
                {profile?.email && <p className="text-sm text-gray-500 mt-2">{profile.email}</p>}
                <div className="mt-3 flex items-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Connected
                  </span>
                  <span className="text-sm text-gray-600">📊 {posts.length} Posts</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowPreferences(!showPreferences)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium">
              ⚙️ AI Preferences
            </button>
          </div>
        </div>

        {/* AI Preferences Modal */}
        {showPreferences && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Personalization Settings</h3>
            <form onSubmit={handlePreferencesSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                <input 
                  type="text" 
                  value={preferences.role || ''} 
                  onChange={(e) => setPreferences({...preferences, role: e.target.value})} 
                  placeholder="e.g., Software Engineer, Marketing Manager" 
                  autoComplete="off"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[15px] text-gray-900 placeholder:text-gray-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Goals</label>
                <textarea 
                  value={preferences.goals || ''} 
                  onChange={(e) => setPreferences({...preferences, goals: e.target.value})} 
                  placeholder="What are your professional goals? e.g., Build my personal brand, Connect with industry leaders" 
                  rows={3} 
                  autoComplete="off"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 resize-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Challenges</label>
                <textarea 
                  value={preferences.challenges || ''} 
                  onChange={(e) => setPreferences({...preferences, challenges: e.target.value})} 
                  placeholder="What challenges are you facing? e.g., Finding time to create content, Standing out in a crowded market" 
                  rows={3} 
                  autoComplete="off"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 resize-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Country</label>
                  <input 
                    type="text" 
                    value={preferences.targetCountry || ''} 
                    onChange={(e) => setPreferences({...preferences, targetCountry: e.target.value})} 
                    placeholder="e.g., USA, Global, UK" 
                    autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[15px] text-gray-900 placeholder:text-gray-400" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Tone</label>
                  <select 
                    value={preferences.contentTone || 'professional'} 
                    onChange={(e) => setPreferences({...preferences, contentTone: e.target.value})} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[15px] text-gray-900 bg-white"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm hover:shadow-md">
                  Save Preferences
                </button>
                <button type="button" onClick={() => setShowPreferences(false)} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button onClick={() => setActiveTab('create')} className={`pb-4 px-2 font-medium ${activeTab === 'create' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
              ✍️ Create Post
            </button>
            <button onClick={() => setActiveTab('history')} className={`pb-4 px-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
              📜 Post History ({posts.length})
            </button>
          </div>
        </div>

        {/* Create Post Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create LinkedIn Post</h3>
              <button onClick={handleGenerateAI} disabled={generatingAI} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg font-medium disabled:opacity-50 flex items-center space-x-2 transition-all">
                {generatingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate AI Content</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handlePostSubmit}>
              <div className="relative">
                <textarea 
                  value={postContent} 
                  onChange={handleTextareaChange}
                  placeholder="What do you want to share with your network? Share your insights, achievements, or professional thoughts..." 
                  rows={6}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all font-normal text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 placeholder:text-sm overflow-hidden"
                  style={{ minHeight: '180px', maxHeight: '500px' }}
                  disabled={posting} 
                />
                
                {/* Character count with visual feedback */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <div className={`text-sm font-medium px-3 py-1 rounded-full transition-all ${
                    postContent.length === 0 ? 'bg-gray-100 text-gray-400' :
                    postContent.length < 100 ? 'bg-blue-100 text-blue-600' :
                    postContent.length < 1000 ? 'bg-green-100 text-green-600' :
                    postContent.length < 3000 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {postContent.length} {postContent.length === 1 ? 'character' : 'characters'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Max 3,000 characters</span>
                  </span>
                  {postContent.length > 0 && (
                    <span className="flex items-center space-x-1 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ready to publish</span>
                    </span>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={posting || !postContent.trim() || postContent.length > 3000} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                >
                  {posting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Publish to LinkedIn</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className="font-medium">{message.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Post History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Create your first post to see it here!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {post.status}
                      </span>
                      {post.isAIGenerated && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">✨ AI Generated</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  {post.publishedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                      Published: {new Date(post.publishedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
