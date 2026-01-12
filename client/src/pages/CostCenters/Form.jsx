import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '../../context/TranslationContext';

export default function CostCenterForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('expense');

    useEffect(() => {
        if (isEdit) {
            api.get(`/cost-centers/${id}`).then(({ data }) => {
                setName(data.name);
                setType(data.type || 'expense');
            }).catch(console.error);
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { name, type };
            if (isEdit) {
                await api.put(`/cost-centers/${id}`, payload);
            } else {
                await api.post('/cost-centers', payload);
            }
            navigate('/cost-centers');
        } catch (error) {
            console.error(error);
            alert(t('common.error_saving') || 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/cost-centers" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">{isEdit ? t('cost_centers.form.edit_title') : t('cost_centers.form.new_title')}</h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">{t('cost_centers.form.name')}</label>
                        <input
                            className="input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">{t('cost_centers.form.type')}</label>
                        <select
                            className="input"
                            value={type}
                            onChange={e => setType(e.target.value)}
                            required
                        >
                            <option value="income">{t('payments.income')}</option>
                            <option value="expense">{t('payments.expense')}</option>
                        </select>
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
