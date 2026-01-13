import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { Plus, Search, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Building2, Edit, Trash2 } from 'lucide-react';

export default function PaymentsList() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ type: '', date: '', unit_id: '', cost_center_id: '' });
    const [costCenters, setCostCenters] = useState([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ ...filters, page, limit: 10 }).toString();
            const { data } = await api.get(`/payments?${query}`);
            setPayments(data.data);
            setMeta(data.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchPayments();
    }, [page, fetchPayments]);

    useEffect(() => {
        api.get('/cost-centers?limit=1000&all=true').then(({ data }) => setCostCenters(data.data)).catch(console.error);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPayments();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Tem certeza?")) return;
        try {
            await api.delete(`/payments/${id}`);
            fetchPayments();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">{t('payments.title')}</h1>
                <Link to="/payments/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {t('payments.new')}
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('payments.filters.cost_center')}</label>
                        <select
                            className="input w-full text-sm py-1"
                            value={filters.cost_center_id}
                            onChange={e => setFilters({ ...filters, cost_center_id: e.target.value })}
                        >
                            <option value="">{t('payments.filters.all')}</option>
                            {costCenters.map(cc => (
                                <option key={cc.id} value={cc.id}>{cc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('payments.filters.type')}</label>
                        <select
                            className="input w-full text-sm py-1"
                            value={filters.type}
                            onChange={e => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">{t('payments.filters.all')}</option>
                            <option value="income">{t('payments.income')}</option>
                            <option value="expense">{t('payments.expense')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('payments.filters.date')}</label>
                        <input
                            type="date"
                            className="input w-full text-sm py-1"
                            value={filters.date}
                            onChange={e => setFilters({ ...filters, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('payments.filters.unit')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.unit}
                            onChange={e => setFilters({ ...filters, unit: e.target.value })}
                            placeholder="Q/L/C..."
                        />
                    </div>
                    {/* Empty col for spacing if needed or just button */}
                    <div>
                        <button type="submit" className="btn btn-outline flex items-center justify-center gap-2 h-[38px] w-full md:w-auto">
                            <Search className="w-4 h-4" /> {t('payments.filters.filter_button')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">{t('payments.table.cost_center')}</th>
                                <th className="p-4 font-semibold min-w-32 w-32">{t('payments.table.type')}</th>
                                <th className="p-4 font-semibold min-w-32 w-32">{t('payments.table.amount')}</th>
                                <th className="p-4 font-semibold min-w-40 w-40">{t('payments.table.unit')}</th>
                                <th className="p-4 font-semibold min-w-32 w-32">{t('payments.table.date')}</th>
                                <th className="p-4 font-semibold text-right min-w-32 w-32">{t('payments.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                            )}
                            {!loading && payments.map(payment => (
                                <tr
                                    key={payment.id}
                                    onClick={() => navigate(`/payments/${payment.id}`)}
                                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                >
                                    <td className="p-4 text-slate-600 text-sm text-nowrap">
                                        {payment.cost_center_name || '-'}
                                    </td>
                                    <td className="p-4">
                                        {payment.type === 'income' ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
                                                <TrendingUp className="w-3 h-3" /> {t('payments.income')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                                                <TrendingDown className="w-3 h-3" /> {t('payments.expense')}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`p-4 font-bold ${payment.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        R$ {parseFloat(payment.amount).toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        {payment.quadra ? (
                                            <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-2 py-1 rounded text-sm w-fit">
                                                <Building2 className="w-3 h-3" />
                                                <span>Q{payment.quadra} L{payment.lote} {payment.casa ? `C${payment.casa}` : ''}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">{t('payments.table.no_unit')}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {(user.role === 'admin' || user.id === payment.user_id) && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/payments/${payment.id}/edit`); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, payment.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && payments.length === 0 && (
                    <div className="p-8 text-center text-slate-500">{t('payments.table.no_results')}</div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="btn btn-outline py-1 px-3 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600">{t('common.pagination.page')} {page} {t('common.pagination.of')} {meta.last_page || 1}</span>
                    <button
                        disabled={page === meta.last_page || !meta.last_page}
                        onClick={() => setPage(p => Math.min(meta.last_page || 1, p + 1))}
                        className="btn btn-outline py-1 px-3 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
