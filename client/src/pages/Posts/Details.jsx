import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, Download, Trash2, Edit } from 'lucide-react';
import api from '../../lib/api';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/date';

export default function PostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await api.get(`/posts/${id}`);
                setPost(data);
            } catch (error) {
                console.error("Failed to fetch post", error);
                navigate('/posts');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/posts/${id}`);
            navigate('/posts');
        } catch {
            alert(t('common.error_deleting'));
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>;
    if (!post) return null;

    const categoryColors = {
        notice: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const categoryLabels = {
        notice: t('posts.form.categories.notice'),
        info: t('posts.form.categories.info')
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Link to="/posts" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800">{t('posts.details.title')}</h1>
                </div>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Link to={`/posts/${id}/edit`} className="btn btn-primary flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            {t('common.edit')}
                        </Link>
                        <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            {t('common.delete')}
                        </button>
                    </div>
                )}
            </div>

            <div className="card overflow-hidden">
                <div className={`p-6 border-b ${post.category === 'notice' ? 'bg-yellow-50/50' : 'bg-blue-50/50'}`}>
                    <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${categoryColors[post.category]}`}>
                            {categoryLabels[post.category]}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.created_at)}
                            </div>
                            {post.quadra && (
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4" />
                                    <span>Q{post.quadra} L{post.lote} {post.casa ? `C${post.casa}` : ''}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{post.title}</h2>
                </div>

                <div className="p-8">
                    <div 
                        className="prose max-w-none prose-slate"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {post.file && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <a 
                                href={post.file} 
                                download="anexo"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group"
                            >
                                <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700 group-hover:text-primary transition-colors">{t('posts.details.download_file')}</p>
                                    <p className="text-xs text-slate-500">Clique para baixar</p>
                                </div>
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {isAdmin && (
                <div className="card">
                    <div className="p-4 border-b bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800">{t('posts.details.readers.title')}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-slate-500 font-medium">
                                    <th className="px-6 py-3">{t('posts.details.readers.name')}</th>
                                    <th className="px-6 py-3">{t('posts.details.readers.unit')}</th>
                                    <th className="px-6 py-3">{t('posts.details.readers.date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {post.readers?.length > 0 ? (
                                    post.readers.map((reader, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-slate-900">{reader.name}</div>
                                                <div className="text-xs text-slate-500">{reader.email}</div>
                                            </td>
                                            <td className="px-6 py-3 text-slate-600">
                                                {reader.quadra ? `Q${reader.quadra} L${reader.lote} ${reader.casa ? `C${reader.casa}` : ''}` : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-slate-500">
                                                {formatDateTime(reader.last_read_at)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400 italic">
                                            {t('posts.details.readers.no_readers')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
