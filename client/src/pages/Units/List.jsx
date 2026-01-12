import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Plus, Search, Building, Trash2, Edit, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

export default function UnitsList() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ quadra: '', lote: '', casa: '' });
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const fetchUnits = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ ...filters, page, limit: 10 }).toString();
            const { data } = await api.get(`/units?${query}`);
            setUnits(data.data);
            setMeta(data.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUnits();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/units/${id}`);
            fetchUnits();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">{t('units.title')}</h1>
                {user.role === 'admin' && (
                    <Link to="/units/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t('units.new')}
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('units.filters.quadra')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.quadra}
                            onChange={e => setFilters({ ...filters, quadra: e.target.value })}
                            placeholder={t('units.filters.search_quadra')}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('units.filters.lote')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.lote}
                            onChange={e => setFilters({ ...filters, lote: e.target.value })}
                            placeholder={t('units.filters.search_lote')}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('units.filters.casa')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.casa}
                            onChange={e => setFilters({ ...filters, casa: e.target.value })}
                            placeholder={t('units.filters.search_casa')}
                        />
                    </div>
                    {/* Empty col for spacing if needed or just button */}
                    <div className="md:col-span-2">
                        <button type="submit" className="btn btn-outline flex items-center justify-center gap-2 h-[38px] w-full md:w-auto">
                            <Search className="w-4 h-4" /> {t('payments.filters.filter_button')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px] md:min-w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">{t('units.table.identification')}</th>
                                <th className="p-4 font-semibold text-center">{t('units.table.residents')}</th>
                                <th className="p-4 font-semibold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr><td colSpan="3" className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                            )}
                            {!loading && units.map((unit) => (
                                <tr
                                    key={unit.id}
                                    onClick={() => navigate(`/units/${unit.id}`)}
                                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Building className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-700 block">{t('units.table.quadra')} {unit.quadra}</span>
                                                <span className="text-xs text-slate-500">{t('units.table.lote')} {unit.lote} • {t('units.table.casa')} {unit.casa}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                            {unit.residents_count}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {user.role === 'admin' && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/units/${unit.id}/edit`); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, unit.id)}
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

                {!loading && units.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        <Building className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p>{t('units.table.no_units_found')}</p>
                    </div>
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
                        disabled={page === meta.last_page}
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
