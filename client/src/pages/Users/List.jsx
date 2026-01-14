import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, User as UserIcon, Building2, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import api from '../../lib/api';
import { useTranslation } from '../../context/TranslationContext';

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState({
        name: '',
        email: '',
        phone: '',
        unit: ''
    });

    const navigate = useNavigate();
    const { t } = useTranslation();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...filters
            };
            const { data } = await api.get('/users', { params });
            // Ensure data.data is an array, default to empty
            setUsers(Array.isArray(data?.data) ? data.data : []);
            setTotalPages(data?.meta?.last_page || 1);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // Reload when fetchUsers (page or filters) change

    // Search on enter or button click
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to first page
        fetchUsers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch {
            alert(t('common.error_deleting') || 'Erro ao excluir');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">{t('users.title')}</h1>
                <Link to="/users/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {t('users.new')}
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('auth.name')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.name}
                            onChange={e => setFilters({ ...filters, name: e.target.value })}
                            placeholder={t('users.filters.search_placeholder')}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('auth.email')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.email}
                            onChange={e => setFilters({ ...filters, email: e.target.value })}
                            placeholder={t('auth.email') + "..."}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('auth.phone')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.phone}
                            onChange={e => setFilters({ ...filters, phone: e.target.value })}
                            placeholder={t('auth.phone') + "..."}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('users.table.unit')}</label>
                        <input
                            className="input w-full text-sm py-1"
                            value={filters.unit}
                            onChange={e => setFilters({ ...filters, unit: e.target.value })}
                            placeholder="Q/L/C..."
                        />
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
                    <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">{t('auth.name')}</th>
                                <th className="p-4 font-semibold">{t('users.table.contact')}</th>
                                <th className="p-4 font-semibold min-w-40 w-40">{t('users.table.unit')}</th>
                                <th className="p-4 font-semibold min-w-32 w-32">{t('users.table.profile')}</th>
                                <th className="p-4 font-semibold text-right min-w-32 w-32">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                            )}
                            {!loading && users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-600 text-sm text-nowrap">
                                        {user.name}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {user.email && (
                                                <a
                                                    href={`mailto:${user.email}`}
                                                    className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary transition-colors w-fit"
                                                    title={t('auth.email')}
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[150px] lg:max-w-[200px]">{user.email}</span>
                                                </a>
                                            )}
                                            {user.phone && (
                                                <a
                                                    href={`tel:${user.phone}`}
                                                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors w-fit"
                                                    title={t('auth.phone')}
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    <span>{user.phone}</span>
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.quadra ? (
                                            <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-2 py-1 rounded text-sm w-fit">
                                                <Building2 className="w-3 h-3" />
                                                <span>Q{user.quadra} L{user.lote} {user.casa ? `C${user.casa}` : ''}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">{t('payments.table.no_unit')}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {user.role === 'admin' ? t('users.form.role_admin') : t('users.form.role_user')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => navigate(`/users/${user.id}/edit`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
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
                {!loading && users.length === 0 && (
                    <div className="p-8 text-center text-slate-500">{t('users.table.no_results')}</div>
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
                    <span className="text-sm text-slate-600">{t('common.pagination.page')} {page} {t('common.pagination.of')} {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="btn btn-outline py-1 px-3 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
