import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building, Users, Trash2, Edit, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

export default function UnitDetails() {
    const { id } = useParams();
    const [unit, setUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUnit = async () => {
            try {
                const { data } = await api.get(`/units/${id}`);
                setUnit(data);
            } catch (error) {
                console.error(error);
                if (error.response?.status === 404) navigate('/units');
            } finally {
                setLoading(false);
            }
        };
        fetchUnit();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm(t('units.details.delete_confirm'))) return;
        try {
            await api.delete(`/units/${id}`);
            navigate('/units');
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir');
        }
    };

    if (loading) return <div className="p-8">{t('common.loading')}</div>;
    if (!unit) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/units" className="flex items-center gap-2 text-slate-500 hover:text-primary">
                <ArrowLeft className="w-4 h-4" /> {t('units.details.back_to_list')}
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{t('units.details.title_prefix')} {unit.quadra}-{unit.lote}</h1>
                    <p className="text-slate-500">{t('units.table.casa')} {unit.casa}</p>
                </div>
                {user.role === 'admin' && (
                    <div className="flex gap-3">
                        <Link to={`/units/${id}/edit`} className="btn btn-primary flex items-center gap-2">
                            <Edit className="w-4 h-4" /> {t('common.edit')}
                        </Link>
                        <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> {t('common.delete')}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" /> {t('units.details.details')}
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">{t('units.filters.quadra')}</span>
                            <span className="font-medium">{unit.quadra}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">{t('units.filters.lote')}</span>
                            <span className="font-medium">{unit.lote}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">{t('units.filters.casa')}</span>
                            <span className="font-medium">{unit.casa}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">{t('units.form.interfone')}</span>
                            <span className="font-medium">{unit.interfone || '-'}</span>
                        </div>
                        <div className="pt-2">
                            <span className="text-slate-500 block mb-1">{t('units.form.observation')}</span>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">
                                {unit.observacao || t('units.details.no_observation')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> {t('units.table.residents')}
                    </h3>
                    <div className="space-y-3">
                        {unit.residents && unit.residents.length > 0 ? (
                            unit.residents.map(resident => (
                                <div key={resident.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-3 group hover:bg-white hover:border-primary transition-all duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm border border-slate-100">
                                            {resident.name[0]}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold text-slate-800 truncate">{resident.name}</p>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5 py-0.5 bg-white rounded border border-slate-100">
                                                {resident.role === 'admin' ? t('users.form.role_admin') : t('users.form.role_user')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pl-1">
                                        {resident.email && (
                                            <a
                                                href={`mailto:${resident.email}`}
                                                className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors bg-white/50 p-1.5 rounded-lg border border-transparent hover:border-slate-100"
                                            >
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate">{resident.email}</span>
                                            </a>
                                        )}
                                        {resident.phone && (
                                            <a
                                                href={`tel:${resident.phone}`}
                                                className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors bg-white/50 p-1.5 rounded-lg border border-transparent hover:border-slate-100"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{resident.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p>{t('units.details.no_residents')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
