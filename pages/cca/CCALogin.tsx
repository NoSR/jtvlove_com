
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const CCALogin: React.FC = () => {
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

                // For staff (CCA) login, we need to check if they have a ccaId
                // The API login function might need to be refined if it doesn't return ccaId for staff
                // But generally, the user object or the login result should contain it.

                // For now, if role is 'cca' and result has ccaId, we merge it.
                // In this system, CCAs might use their email/password.

                if (userObj.role !== 'cca') {
                    // Try to find if this user is linked to a CCA if role is not directly 'cca'
                    // Or check if the result returned a ccaId
                    if (!result.ccaId) {
                        setError('CCA 전용 계정이 아닙니다.');
                        setIsLoading(false);
                        return;
                    }
                }

                const userData = {
                    ...userObj,
                    ccaId: result.ccaId || userObj.id // In case ID is the ccaId
                };

                login(userData);
                navigate('/cca-portal');
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
        <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0f0e0b] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-primary/5 p-10 relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-primary to-yellow-600 rounded-2xl text-white mb-6 shadow-xl shadow-primary/20">
                            <span className="material-symbols-outlined text-3xl">sparkles</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">CCA Portal Login</h2>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Staff Access Only</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl mb-6 text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Account ID / Email</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg group-focus-within:text-primary transition-colors">badge</span>
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your-account-id"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Password</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg group-focus-within:text-primary transition-colors">lock</span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-gradient-to-r from-[#1b180d] to-[#2a2618] dark:from-primary dark:to-yellow-500 dark:text-[#1b180d] text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In To Portal'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Need assistance? <Link to="/notice?type=FAQ" className="text-primary hover:underline">Contact Support</Link>
                    </p>
                </div>

                <p className="mt-8 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">
                    &copy; JTV LOVE Professional Staff Network
                </p>
            </div>
        </div>
    );
};

export default CCALogin;
