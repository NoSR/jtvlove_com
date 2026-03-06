import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminNotices: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notices, setNotices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingNotice, setEditingNotice] = useState<any>(null);
    const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'venue_admin' && user.role !== 'super_admin') || !user.venueId) {
            navigate('/admin/login');
            return;
        }
        loadNotices();
    }, [user]);

    const loadNotices = async () => {
        if (!user?.venueId) return;
        setIsLoading(true);
        try {
            const data = await apiService.getVenueNotices(user.venueId);
            setNotices(data);
        } catch (error) {
            console.error('Failed to load notices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNew = () => {
        setEditingNotice(null);
        setForm({ title: '', content: '', is_pinned: false });
        setShowEditor(true);
    };

    const handleEdit = (notice: any) => {
        setEditingNotice(notice);
        setForm({
            title: notice.title,
            content: notice.content,
            is_pinned: !!notice.is_pinned,
        });
        setShowEditor(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;
        const ok = await apiService.deleteVenueNotice(id);
        if (ok) {
            loadNotices();
        } else {
            alert('삭제에 실패했습니다.');
        }
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        setIsSaving(true);
        try {
            if (editingNotice) {
                // Update
                const result = await apiService.updateVenueNotice({
                    id: editingNotice.id,
                    title: form.title,
                    content: form.content,
                    is_pinned: form.is_pinned,
                });
                if (result.success) {
                    setShowEditor(false);
                    loadNotices();
                } else {
                    alert('수정에 실패했습니다.');
                }
            } else {
                // Create
                const result = await apiService.createVenueNotice({
                    venue_id: user!.venueId!,
                    title: form.title,
                    content: form.content,
                    is_pinned: form.is_pinned,
                });
                if (result.success) {
                    setShowEditor(false);
                    loadNotices();
                } else {
                    alert(`등록에 실패했습니다: ${result.error || ''}`);
                }
            }
        } catch (err) {
            alert('오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">공지사항 관리</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">업체 상세페이지에 표시되는 공지사항을 관리합니다</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 bg-primary text-[#1b180d] px-6 py-3 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    새 공지 등록
                </button>
            </div>

            {/* Notices List */}
            {notices.length > 0 ? (
                <div className="space-y-4">
                    {notices.map((notice, idx) => {
                        const dateStr = notice.created_at
                            ? new Date(notice.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                            : '';
                        return (
                            <div
                                key={notice.id}
                                className={`bg-white dark:bg-zinc-900 rounded-[2rem] border shadow-sm overflow-hidden transition-all hover:shadow-md ${notice.is_pinned ? 'border-primary/30' : 'border-primary/5'}`}
                            >
                                <div className="flex items-center justify-between p-6 md:p-8">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notice.is_pinned ? 'bg-primary/20 text-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                            <span className="material-symbols-outlined">{notice.is_pinned ? 'push_pin' : 'article'}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                {notice.is_pinned && (
                                                    <span className="text-[8px] font-black bg-primary text-[#1b180d] px-2 py-0.5 rounded uppercase tracking-widest">고정</span>
                                                )}
                                                <p className="font-black text-sm truncate">{notice.title}</p>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 truncate">{notice.content}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                        <span className="text-[10px] font-bold text-zinc-400 hidden md:inline">{dateStr}</span>
                                        <button
                                            onClick={() => handleEdit(notice)}
                                            className="size-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(notice.id)}
                                            className="size-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-primary/5 shadow-sm py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-zinc-200 dark:text-zinc-700">campaign</span>
                    <p className="text-sm font-bold text-zinc-400 mt-4">등록된 공지사항이 없습니다</p>
                    <p className="text-xs text-zinc-400 mt-1">상단의 "새 공지 등록" 버튼을 클릭하여 첫 공지를 작성해보세요.</p>
                </div>
            )}

            {/* Editor Modal */}
            {showEditor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowEditor(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#1b180d] rounded-[2.5rem] border border-primary/20 shadow-2xl overflow-hidden animate-slide-up">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                                    {editingNotice ? '공지 수정' : '새 공지 등록'}
                                </h2>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Venue Notice</p>
                            </div>
                            <button
                                onClick={() => setShowEditor(false)}
                                className="size-12 rounded-2xl bg-zinc-100 dark:bg-white/5 dark:text-white flex items-center justify-center hover:bg-primary hover:text-[#1b180d] transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">제목</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="공지사항 제목을 입력하세요"
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary transition-all dark:text-white"
                                />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">내용</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    placeholder="공지사항 내용을 입력하세요"
                                    rows={6}
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary transition-all resize-none dark:text-white"
                                />
                            </div>

                            {/* Pinned Toggle */}
                            <div className="flex items-center justify-between bg-zinc-50 dark:bg-white/5 rounded-2xl p-5 border border-zinc-200 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">push_pin</span>
                                    <div>
                                        <p className="font-bold text-sm dark:text-white">상단 고정</p>
                                        <p className="text-[10px] text-gray-400">이 공지를 목록 상단에 고정합니다</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, is_pinned: !form.is_pinned })}
                                    className={`w-14 h-7 rounded-full transition-all relative ${form.is_pinned ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-0.5 size-6 bg-white rounded-full shadow-md transition-all ${form.is_pinned ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`}></div>
                                </button>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-5 bg-primary text-[#1b180d] rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? '저장 중...' : editingNotice ? '수정 완료' : '공지 등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotices;
