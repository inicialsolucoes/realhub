import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Clock, User as UserIcon, Activity } from 'lucide-react';
import { useTranslation } from '../../context/TranslationContext';

export default function LogsList() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({ page: 1, action: '', entity_type: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/activity-logs', { params: filters });
                setLogs(data.data);
                setMeta(data.meta);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [filters]);

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">{t('app.logs')}</h1>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('logs.table.action')}</label>
                        <select
                            className="input w-full text-sm py-1"
                            value={filters.action}
                            onChange={e => setFilters({ ...filters, action: e.target.value, page: 1 })}
                        >
                            <option value="">{t('logs.filters.all_actions') || 'Todas as Ações'}</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                            <option value="LOGIN">LOGIN</option>
                            <option value="LOGOUT">LOGOUT</option>
                            <option value="REGISTER">REGISTER</option>
                            <option value="PASSWORD_RESET">PASSWORD RESET</option>
                            <option value="FORGOT_PASSWORD_REQUEST">FORGOT PASSWORD</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('logs.table.entity')}</label>
                        <select
                            className="input w-full text-sm py-1"
                            value={filters.entity_type}
                            onChange={e => setFilters({ ...filters, entity_type: e.target.value, page: 1 })}
                        >
                            <option value="">{t('logs.filters.all_entities') || 'Todas as Entidades'}</option>
                            <option value="user">{t('entities.user')}</option>
                            <option value="unit">{t('entities.unit')}</option>
                            <option value="payment">{t('entities.payment')}</option>
                            <option value="cost_center">{t('entities.cost_center')}</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit" className="btn btn-outline flex items-center justify-center gap-2 h-[38px] w-full md:w-auto">
                            <Search className="w-4 h-4" /> {t('payments.filters.filter_button')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">{t('logs.table.user') || 'Usuário'}</th>
                                <th className="p-4 font-semibold min-w-40 w-40">{t('logs.table.action') || 'Ação'}</th>
                                <th className="p-4 font-semibold min-w-48 w-48">{t('logs.table.entity') || 'Entidade'}</th>
                                <th className="p-4 font-semibold min-w-48 w-48">{t('logs.table.date') || 'Data/Hora'}</th>
                                <th className="p-4 font-semibold text-right min-w-12 w-12">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">{t('common.loading')}</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">{t('logs.table.no_results') || 'Nenhum log encontrado.'}</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-slate-600 text-sm text-nowrap">
                                            <Link to={`/logs/${log.id}`} className="font-medium text-slate-700 hover:text-primary transition-colors">
                                                {log.user_name || t('common.system')}
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                                                log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                                                    log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                                                        log.action === 'PASSWORD_RESET' || log.action === 'FORGOT_PASSWORD_REQUEST' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-slate-100 text-slate-600'
                                                }`}>
                                                {log.action === 'FORGOT_PASSWORD_REQUEST' ? 'FORGOT PASSWORD' : log.action}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-600 capitalize">
                                                {log.entity_type ? t(`entities.${log.entity_type}`) : '-'} {log.entity_id && `#${log.entity_id}`}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(log.created_at).toLocaleString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link to={`/logs/${log.id}`} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg inline-block transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                        disabled={meta.page === 1}
                        onClick={() => handlePageChange(Math.max(1, meta.page - 1))}
                        className="btn btn-outline py-1 px-3 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600">{t('common.pagination.page')} {meta.page} {t('common.pagination.of')} {meta.last_page}</span>
                    <button
                        disabled={meta.page === meta.last_page}
                        onClick={() => handlePageChange(Math.min(meta.last_page, meta.page + 1))}
                        className="btn btn-outline py-1 px-3 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
