import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

export default function PaymentForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);
    const [costCenters, setCostCenters] = useState([]);

    const [formData, setFormData] = useState({
        description: '',
        type: 'income',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        unit_id: user?.role !== 'admin' ? (user?.unit_id || '') : '',
        cost_center_id: '',
        proof: ''
    });

    useEffect(() => {
        // Fetch Units and Cost Centers
        api.get('/units?limit=100').then(({ data }) => setUnits(data.data));
        api.get('/cost-centers?limit=1000').then(({ data }) => setCostCenters(data.data));

        if (isEdit) {
            api.get(`/payments/${id}`).then(({ data }) => {
                setFormData({
                    description: data.description,
                    type: data.type,
                    amount: data.amount,
                    date: data.date.split('T')[0],
                    unit_id: data.unit_id || '',
                    cost_center_id: data.cost_center_id || '',
                    proof: data.proof || ''
                });
            }).catch(() => navigate('/payments'));
        }
    }, [id, isEdit, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, proof: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/payments/${id}`, formData);
            } else {
                const response = await api.post('/payments', formData);

                // Show success message for bulk creation
                if (response.data.count && response.data.count > 1) {
                    alert(`✓ ${response.data.count} pagamentos pendentes criados com sucesso!`);
                }
            }
            navigate('/payments');
        } catch (error) {
            alert('Erro ao salvar: ' + (error.response?.data?.message || 'Erro'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/payments" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">{isEdit ? t('payments.form.edit_title') : t('payments.form.new_title')}</h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">{t('payments.form.cost_center')} <span className="text-red-500">*</span></label>
                        <select
                            className="input"
                            value={formData.cost_center_id}
                            onChange={e => {
                                const ccId = e.target.value;
                                const selectedCC = costCenters.find(c => c.id === parseInt(ccId));
                                setFormData({
                                    ...formData,
                                    cost_center_id: ccId,
                                    type: selectedCC ? selectedCC.type : formData.type
                                });
                            }}
                            required
                        >
                            <option value="">{t('payments.form.select_placeholder')}</option>
                            {costCenters.map(cc => (
                                <option key={cc.id} value={cc.id}>{cc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">{t('payments.form.amount')}</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">{t('payments.form.date')}</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">{t('payments.form.type')}</label>
                            <select
                                className={`input ${user.role !== 'admin' ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                disabled={user.role !== 'admin'}
                            >
                                <option value="income">{t('payments.income')}</option>
                                <option value="expense">{t('payments.expense')}</option>
                                {user.role === 'admin' && (
                                    <option value="pending">{t('payments.pending')}</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="label">{t('payments.form.unit')}</label>
                            <select
                                className="input"
                                value={formData.unit_id}
                                onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                            >
                                <option value="">{t('payments.form.no_unit')}</option>
                                {units
                                    .filter(u => user.role === 'admin' || u.id === user.unit_id)
                                    .map(u => (
                                        <option key={u.id} value={u.id}>
                                            Quadra {u.quadra} - Lote {u.lote} - Casa {u.casa}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Warning message for pending payments without unit */}
                    {user.role === 'admin' && formData.type === 'pending' && !formData.unit_id && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-semibold mb-1">{t('payments.form.bulk_warning_title')}</p>
                                <p>{t('payments.form.bulk_warning_message')}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="label">{t('payments.form.proof')}</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-slate-500">
                                <Upload className="w-8 h-8 text-slate-300" />
                                <p className="text-sm font-medium">{t('payments.form.upload_hint')}</p>
                                {formData.proof && <p className="text-xs text-emerald-600 font-bold">{t('payments.form.file_selected')}</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label">{t('payments.form.description')}</label>
                        <textarea
                            className="input min-h-[100px] py-2"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        ></textarea>
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


