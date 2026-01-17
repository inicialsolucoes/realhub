import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, Bell, Building2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import api from '../../lib/api';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/AuthContext';

export default function PostsList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                title: search,
                category
            };
            const { data } = await api.get('/posts', { params });
            // Ensure data.data is an array if using refactored service response structure
            setPosts(Array.isArray(data?.data) ? data.data : []);
            setTotalPages(data?.meta?.last_page || 1);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, category]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPosts();
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/posts/${id}`);
            fetchPosts();
        } catch {
            alert(t('common.error_deleting'));
        }
    };

    const categoryColors = {
        notice: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const categoryLabels = {
        notice: t('posts.form.categories.notice'),
        info: t('posts.form.categories.info')
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-primary" />
                    {t('posts.title')}
                </h1>
                {isAdmin && (
                    <Link to="/posts/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t('posts.new')}
                    </Link>
                )}
            </div>

            <div className="card p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('posts.form.title')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('common.actions') + "..."}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('posts.form.category')}</label>
                        <select
                            className="input w-full text-sm py-1"
                            value={category}
                            onChange={e => { setCategory(e.target.value); setPage(1); }}
                        >
                            <option value="">{t('payments.filters.all')}</option>
                            <option value="notice">{t('posts.form.categories.notice')}</option>
                            <option value="info">{t('posts.form.categories.info')}</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit" className="btn btn-outline flex items-center justify-center gap-2 h-[38px]">
                            <Search className="w-4 h-4" /> {t('payments.filters.filter_button')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">{t('posts.table.title')}</th>
                                <th className="p-4 font-semibold min-w-32 w-32">{t('posts.table.category')}</th>
                                <th className="p-4 font-semibold min-w-40 w-40">{t('posts.table.unit')}</th>
                                <th className="p-4 font-semibold min-w-32 w-32">{t('posts.table.date')}</th>
                                <th className="p-4 font-semibold text-right min-w-40 w-40">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                            )}
                            {!loading && posts.length === 0 && (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">{t('posts.table.no_results')}</td></tr>
                            )}
                            {!loading && posts.map(post => (
                                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <Link to={`/posts/${post.id}`} className="font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-2">
                                            {post.file && <FileText className="w-4 h-4 text-slate-400" />}
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${categoryColors[post.category] || 'bg-gray-100 text-gray-800'}`}>
                                            {categoryLabels[post.category] || post.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                       {post.quadra ? (
                                            <div className="flex items-center gap-2 text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded w-fit">
                                                <Building2 className="w-3 h-3" />
                                                <span>Q{post.quadra} L{post.lote} {post.casa ? `C${post.casa}` : ''}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">{t('payments.filters.all')}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/posts/${post.id}/edit`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => navigate(`/posts/${post.id}`)}
                                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors inline-block"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="btn btn-outline py-1 px-3 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600">{t('common.pagination.page')} {page} {t('common.pagination.of')} {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="btn btn-outline py-1 px-3 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
