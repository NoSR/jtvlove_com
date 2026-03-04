
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const VenueAdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await apiService.login({ email, password });
            if (result.success && result.user) {
                const userObj = typeof result.user === 'string' ? JSON.parse(result.user) : result.user;

                if (userObj.role !== 'venue_admin') {
                    setError('업소 관리자 계정이 아닙니다.');
                    setIsLoading(false);
                    return;
                }

                // Merge venueId into the user object for the session
                const userData = {
                    ...userObj,
                    venueId: result.venueId
                };

                login(userData);
                navigate('/admin');
            } else {
                setError(result.error || '로그인에 실패했습니다.');
            }
        } catch (err: any) {
            setError(err.message || '예기치 못한 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/5 p-10 relative overflow-hidden">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center size-16 bg-primary rounded-2xl text-[#1b180d] mb-6 shadow-xl shadow-primary/20">
                            <span className="material-symbols-outlined text-3xl font-black">admin_panel_settings</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter mb-2">업소 관리자 로그인</h2>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Partner Access Portal</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">이메일 계정</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="partner@jtvlove.com"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">비밀번호</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg group-focus-within:text-primary transition-colors">lock</span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-[#1b180d] dark:bg-primary dark:text-[#1b180d] text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? '인증 중...' : '파트너 로그인'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        아직 파트너가 아니신가요? <Link to="/admin/register" className="text-primary hover:underline">파트너 신청하기</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VenueAdminLogin;
