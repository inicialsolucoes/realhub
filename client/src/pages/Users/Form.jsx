import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

export default function UserForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);
    const [costCenters, setCostCenters] = useState([]);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', unit_id: '', password: '', role: 'user', cost_center_ids: []
    });

    useEffect(() => {
        // Fetch Units and Cost Centers
        api.get('/units?limit=100').then(({ data }) => setUnits(data.data));
        api.get('/cost-centers?limit=1000').then(({ data }) => setCostCenters(data.data));

        if (isEdit) {
            api.get(`/users/${id}`).then(({ data }) => {
                setFormData({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || '',
                    unit_id: data.unit_id || '',
                    role: data.role,
                    cost_center_ids: (data.cost_center_ids || []).map(Number),
                    password: '' // Don't fill password
                });
            }).catch(() => navigate('/users'));
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            if (isEdit && !payload.password) delete payload.password; // Don't send empty password on edit

            if (isEdit) {
                await api.put(`/users/${id}`, payload);
            } else {
                await api.post('/users', payload);
            }
            navigate('/users');
        } catch (error) {
            alert(t('common.error_saving') + ': ' + (error.response?.data?.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleCCChange = (ccId) => {
        const current = [...formData.cost_center_ids].map(Number);
        const id = Number(ccId);
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
        setFormData({ ...formData, cost_center_ids: current });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/users" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">{isEdit ? t('users.form.edit_title') : t('users.form.new_title')}</h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.name')}</label>
                        <input
                            className="input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.email')}</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.phone')}</label>
                            <input
                                className="input"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.table.unit')}</label>
                            <select
                                className="input"
                                value={formData.unit_id}
                                onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                            >
                                <option value="">{t('users.form.select_unit')}</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {t('units.filters.quadra')} {u.quadra} - {t('units.filters.lote')} {u.lote} ({t('units.filters.casa')} {u.casa})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.table.profile')}</label>
                            <select
                                className="input"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="user">{t('users.form.role_user')}</option>
                                <option value="admin">{t('users.form.role_admin')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {isEdit ? t('users.form.password_hint') : t('auth.password')}
                        </label>
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required={!isEdit}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.form.cost_centers')}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                            {costCenters.map(cc => (
                                <label key={cc.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 disabled:opacity-50"
                                        checked={formData.cost_center_ids.includes(Number(cc.id))}
                                        onChange={() => handleCCChange(cc.id)}
                                        disabled={user?.role !== 'admin'}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-700">{cc.name}</span>
                                        <span className={`text-[10px] uppercase font-bold ${cc.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {cc.type === 'income' ? t('payments.income') : t('payments.expense')}
                                        </span>
                                    </div>
                                </label>
                            ))}
                            {costCenters.length === 0 && (
                                <p className="text-sm text-slate-500 italic p-2">{t('users.form.no_cost_centers')}</p>
                            )}
                        </div>
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
