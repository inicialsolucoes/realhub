import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Download, Building2, Mail, Phone, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

export default function PaymentDetails() {
    const { id } = useParams();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        api.get(`/payments/${id}`)
            .then(({ data }) => setPayment(data))
            .catch(() => navigate('/payments'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm(t('payments.details.delete_confirm'))) return;
        try {
            await api.delete(`/payments/${id}`);
            navigate('/payments');
        } catch (error) {
            console.error(error);
            alert(t('payments.details.delete_error'));
        }
    };

    const canEdit = user && payment && (user.role === 'admin' || user.id === payment.user_id);

    if (loading) return <div>{t('common.loading')}</div>;
    if (!payment) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/payments" className="flex items-center gap-2 text-slate-500 hover:text-primary">
                <ArrowLeft className="w-4 h-4" /> {t('units.details.back_to_list')}
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{t('payments.details.title')}</h1>
                    <p className="text-slate-500">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                    {canEdit && (
                        <Link to={`/payments/${id}/edit`} className="btn btn-primary flex items-center gap-2">
                            <Edit className="w-4 h-4" /> {t('common.edit')}
                        </Link>
                    )}
                    {user.role === 'admin' && (
                        <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> {t('common.delete')}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-6 space-y-4">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">{t('payments.details.amount')}</span>
                            <p className={`text-3xl font-bold mt-1 ${payment.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                R$ {parseFloat(payment.amount).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">{t('payments.details.type')}</span>
                            <div className="mt-1">
                                {payment.type === 'income' ? (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                                        <TrendingUp className="w-3.5 h-3.5" /> {t('payments.income')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                                        <TrendingDown className="w-3.5 h-3.5" /> {t('payments.expense')}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">{t('payments.details.description')}</span>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg mt-1 text-sm">{payment.description}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">{t('payments.details.cost_center')}</span>
                            <p className="font-medium text-slate-800 mt-1 capitalize">
                                {payment.cost_center_name || '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">{t('payments.details.unit')}</span>
                            <div className="mt-1">
                                {payment.quadra ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-2 rounded-lg text-sm w-fit">
                                            <Building2 className="w-4 h-4" />
                                            <span>{t('units.filters.quadra')} {payment.quadra} • {t('units.filters.lote')} {payment.lote} • {t('units.filters.casa')} {payment.casa}</span>
                                        </div>

                                        {payment.residents && payment.residents.length > 0 && (
                                            <div className="pl-1 border-l-2 border-slate-200">
                                                <span className="text-xs font-semibold text-slate-400 uppercase mb-2 block pl-2">{t('units.table.residents')}</span>
                                                <div className="space-y-4 pl-2">
                                                    {payment.residents.map(resident => (
                                                        <div key={resident.id} className="group">
                                                            <div className="text-sm text-slate-600 flex items-center gap-2 mb-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary transition-colors"></div>
                                                                <span className="font-medium text-slate-800">{resident.name}</span>
                                                                <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5 py-0.5 bg-slate-50 rounded">
                                                                    {resident.role === 'admin' ? t('users.form.role_admin') : t('users.form.role_user')}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 ml-3.5">
                                                                {resident.email && (
                                                                    <a
                                                                        href={`mailto:${resident.email}`}
                                                                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                                                                        title={t('auth.email')}
                                                                    >
                                                                        <Mail className="w-3 h-3" />
                                                                        {resident.email}
                                                                    </a>
                                                                )}
                                                                {resident.phone && (
                                                                    <a
                                                                        href={`tel:${resident.phone}`}
                                                                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                                                                        title={t('auth.phone')}
                                                                    >
                                                                        <Phone className="w-3 h-3" />
                                                                        {resident.phone}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="font-medium text-slate-800">
                                        {payment.unit_id ? `ID: ${payment.unit_id}` : t('payments.table.no_unit')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="card p-6 h-full min-h-[400px] flex flex-col">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> {t('payments.details.no_proof').replace('Nenhum ', '').replace(' anexado', '')}
                        </h3>
                        <div className="flex-1 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                            {payment.proof ? (
                                payment.proof.startsWith('data:image') ? (
                                    <img src={payment.proof} alt="Comprovante" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <iframe src={payment.proof} className="w-full h-full" title={t('payments.details.no_proof').replace('Nenhum ', '').replace(' anexado', '')} />
                                )
                            ) : (
                                <p className="text-slate-400">{t('payments.details.no_proof')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
