
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Post } from '../types';

const NoticeCenter: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Notice' | 'Event' | 'FAQ'>('Notice');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        if (type === 'Event') setActiveTab('Event');
        else if (type === 'FAQ') setActiveTab('FAQ');
        else setActiveTab('Notice');
    }, [location.search]);

    useEffect(() => {
        fetchPosts();
    }, [activeTab]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await apiService.getPosts(activeTab);
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 animate-fade-in">
            <div className="text-center space-y-4 mb-20">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full">Support & News</span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic dark:text-white">Communication Center</h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest max-w-lg mx-auto leading-relaxed">Stay updated with the latest announcements, special events, and frequently asked questions.</p>
            </div>

            {/* Sub Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-16 border-b border-gray-100 dark:border-white/5 pb-8">
                {(['Notice', 'Event', 'FAQ'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => navigate(`/notice?type=${tab}`)}
                        className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-105' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        {tab === 'Notice' ? '공지사항' : tab === 'Event' ? '이벤트' : 'FAQ'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-40 text-center animate-pulse text-primary font-black uppercase tracking-widest">Synchronizing Broadcasts...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                    {posts.map(post => (
                        activeTab === 'FAQ' ? (
                            <div key={post.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all p-8 md:p-10">
                                <div className="flex gap-6">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg">Q</div>
                                    <div className="flex-1 space-y-4">
                                        <h3 className="text-lg font-black dark:text-white leading-tight">{post.title}</h3>
                                        <div className="bg-gray-50 dark:bg-black/40 rounded-3xl p-8 border border-gray-100 dark:border-white/5">
                                            <p className="text-sm text-gray-600 dark:text-zinc-400 font-bold leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link key={post.id} to={`/community?board=${post.board}&id=${post.id}`} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all hover:-translate-y-1">
                                <div className="flex flex-col md:flex-row">
                                    {post.image && (
                                        <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                                            <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} />
                                        </div>
                                    )}
                                    <div className="flex-1 p-8 md:p-10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{activeTab}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">• {new Date(post.created_at || new Date()).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black dark:text-white group-hover:text-primary transition-colors leading-tight">{post.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium line-clamp-2 leading-relaxed">{post.content}</p>
                                        <div className="pt-4 flex items-center justify-between border-t border-gray-50 dark:border-white/5 uppercase">
                                            <span className="text-[9px] font-black text-gray-400 tracking-widest flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">visibility</span> {post.views || 0}
                                            </span>
                                            <span className="text-[9px] font-black text-primary tracking-widest flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                                                READ MORE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    ))}
                    {posts.length === 0 && (
                        <div className="py-40 text-center bg-gray-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">notifications_off</span>
                            <p className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.5em]">System standby. Current log is empty.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NoticeCenter;
