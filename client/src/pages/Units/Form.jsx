import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useTranslation } from '../../context/TranslationContext';

export default function UnitForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        quadra: '', lote: '', casa: '', observacao: ''
    });

    useEffect(() => {
        if (isEdit) {
            api.get(`/units/${id}`).then(({ data }) => {
                setFormData({
                    quadra: data.quadra,
                    lote: data.lote,
                    casa: data.casa,
                    observacao: data.observacao || ''
                });
            }).catch(() => navigate('/units'));
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/units/${id}`, formData);
            } else {
                await api.post('/units', formData);
            }
            navigate('/units');
        } catch {
            alert(t('common.error_saving') || 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/units" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">{isEdit ? t('units.form.edit_title') : t('units.form.new_title')}</h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">{t('units.filters.quadra')}</label>
                            <input
                                className="input"
                                value={formData.quadra}
                                onChange={e => setFormData({ ...formData, quadra: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">{t('units.filters.lote')}</label>
                            <input
                                className="input"
                                value={formData.lote}
                                onChange={e => setFormData({ ...formData, lote: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">{t('units.filters.casa')}</label>
                        <input
                            className="input"
                            value={formData.casa}
                            onChange={e => setFormData({ ...formData, casa: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">{t('units.form.observation')}</label>
                        <textarea
                            className="input min-h-[100px]"
                            value={formData.observacao}
                            onChange={e => setFormData({ ...formData, observacao: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

