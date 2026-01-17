import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../lib/api';
import { useTranslation } from '../../context/TranslationContext';

export default function PostForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '',
        category: 'notice',
        content: '',
        unit_id: '',
        file: null
    });

    useEffect(() => {
        fetchUnits();
        if (isEditing) {
            fetchPost();
        }
    }, [id]);

    const fetchUnits = async () => {
        try {
            // Using a large limit to get all units for dropdown
            const { data } = await api.get('/units', { params: { limit: 1000 } });
            setUnits(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("Failed to fetch units", error);
        }
    };

    const fetchPost = async () => {
        try {
            const { data } = await api.get(`/posts/${id}`);
            if (data) {
                setFormData({
                    title: data.title || '',
                    category: data.category || 'notice',
                    content: data.content || '',
                    unit_id: data.unit_id || '',
                    file: data.file || null
                });
            }
        } catch (error) {
            console.error("Failed to fetch post", error);
            navigate('/posts');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit check
                alert("File too large");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, file: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            unit_id: formData.unit_id === '' ? null : formData.unit_id
        };

        try {
            if (isEditing) {
                await api.put(`/posts/${id}`, payload);
            } else {
                await api.post('/posts', payload);
            }
            navigate('/posts');
        } catch (error) {
            console.error("Error saving post:", error);
            alert(t('common.error_saving'));
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/posts" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">
                    {isEditing ? t('posts.form.edit_title') : t('posts.form.new_title')}
                </h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                {t('posts.form.title')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                className="input w-full"
                                value={formData.title || ''}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                {t('posts.form.category')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="input w-full"
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="notice">{t('posts.form.categories.notice')}</option>
                                <option value="info">{t('posts.form.categories.info')}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                {t('posts.form.unit')}
                            </label>
                            <select
                                className="input w-full"
                                value={formData.unit_id}
                                onChange={e => setFormData(prev => ({ ...prev, unit_id: e.target.value }))}
                            >
                                <option value="">{t('payments.filters.all')}</option>
                                {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        Q{unit.quadra} L{unit.lote} {unit.casa ? `C${unit.casa}` : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500">
                                {formData.unit_id ? "Visível apenas para esta unidade." : "Visível para todos."}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                {t('posts.form.file')}
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="btn btn-outline w-full flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Upload className="w-4 h-4" />
                                    {formData.file ? (typeof formData.file === 'string' && formData.file.startsWith('data:') ? t('payments.form.file_selected') : 'Arquivo Anexado') : t('payments.form.upload_hint')}
                                </label>
                                {formData.file && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                                    >
                                        <X className="w-4 h-4 text-slate-500" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {t('posts.form.content')} <span className="text-red-500">*</span>
                        </label>
                        <div className="h-64 mb-12">
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={content => setFormData(prev => ({ ...prev, content }))}
                                modules={modules}
                                className="h-full"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
