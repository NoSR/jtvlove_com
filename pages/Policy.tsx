
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';

const Policy: React.FC = () => {
    const location = useLocation();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        if (type === 'privacy' || location.pathname.includes('privacy')) {
            setActiveTab('privacy');
        } else {
            setActiveTab('terms');
        }
    }, [location.search, location.pathname]);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await apiService.getSiteDoc(activeTab);
                setContent(data?.content || '시스템에서 약관 내용을 불러올 수 없습니다.');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [activeTab]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 animate-fade-in mb-20">
            <div className="text-center space-y-4 mb-20">
                <span className="inline-block px-4 py-1.5 bg-zinc-100 dark:bg-white/5 text-gray-500 dark:text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] rounded-full border border-gray-100 dark:border-white/5 shadow-inner shadow-black/5 dark:shadow-white/5 shadow-inner-2">Global Compliance Header</span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic dark:text-white">Legal Information</h1>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed">System usage standards and safety protocols</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'terms' ? 'bg-zinc-900 dark:bg-white dark:text-black text-white shadow-2xl' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/5'}`}
                >
                    Terms of Service
                </button>
                <button
                    onClick={() => setActiveTab('privacy')}
                    className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'privacy' ? 'bg-zinc-900 dark:bg-white dark:text-black text-white shadow-2xl' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/5'}`}
                >
                    Privacy Policy
                </button>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 md:p-20 shadow-2xl shadow-black/5 dark:shadow-white/5 shadow-inner shadow-inner-2">
                    {loading ? (
                        <div className="py-40 text-center animate-pulse text-zinc-400 font-black uppercase tracking-[0.3em]">Decrypting Policy Repository...</div>
                    ) : (
                        <div className="space-y-12">
                            <div className="flex items-center gap-6 pb-10 border-b border-gray-50 dark:border-white/5">
                                <span className={`size-14 rounded-2xl flex items-center justify-center text-white ${activeTab === 'terms' ? 'bg-zinc-800' : 'bg-red-600'}`}>
                                    <span className="material-symbols-outlined font-black">{activeTab === 'terms' ? 'gavel' : 'privacy_tip'}</span>
                                </span>
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic dark:text-white tracking-tight">{activeTab === 'terms' ? '이용약관' : '개인정보 처리방침'}</h2>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Version 1.25.04 | Updated 2026. 03. 02</p>
                                </div>
                            </div>
                            <div className="prose prose-zinc dark:prose-invert max-w-none text-sm font-medium leading-[2.5] text-gray-600 dark:text-zinc-400 whitespace-pre-wrap font-display tracking-tightest selection:bg-primary/30 selection:text-black px-4 lg:px-10">
                                {content}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Policy;
