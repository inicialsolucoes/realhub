import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Plus, Edit, Trash2, Folder, Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';

export default function CostCentersList() {
    const { t } = useTranslation();
    const [costCenters, setCostCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});
    const navigate = useNavigate();

    const fetchCostCenters = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ name, page, limit: 10 }).toString();
            const { data } = await api.get(`/cost-centers?${query}`);
            setCostCenters(data.data || []);
            setMeta(data.meta || {});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [name, page]);

    useEffect(() => {
        fetchCostCenters();
    }, [page, fetchCostCenters]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCostCenters();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/cost-centers/${id}`);
            fetchCostCenters();
        } catch (error) {
            console.error(error);
            alert(t('cost_centers.delete_error') || 'Não é possível excluir centro de custo em uso.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">{t('cost_centers.title')}</h1>
                <Link to="/cost-centers/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {t('cost_centers.new')}
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('cost_centers.table.name')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            placeholder={t('cost_centers.filters.search_placeholder')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-outline flex items-center justify-center gap-2 h-[38px]">
                        <Search className="w-4 h-4" /> {t('payments.filters.filter_button')}
                    </button>
                </form>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px] md:min-w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">{t('cost_centers.table.name')}</th>
                                <th className="p-4 font-semibold">{t('cost_centers.table.type')}</th>
                                <th className="p-4 font-semibold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr><td colSpan="2" className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                            )}
                            {!loading && costCenters.map((cc) => (
                                <tr
                                    key={cc.id}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Folder className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-slate-700">{cc.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {cc.type === 'income' ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
                                                <TrendingUp className="w-3 h-3" /> {t('payments.income')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                                                <TrendingDown className="w-3 h-3" /> {t('payments.expense')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => navigate(`/cost-centers/${cc.id}/edit`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, cc.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && costCenters.length === 0 && (
                    <div className="p-8 text-center text-slate-500">{t('cost_centers.table.no_results')}</div>
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
