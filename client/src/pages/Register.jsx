import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Building2 } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: ''
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || t('auth.register_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">{t('app.name')}</h1>
                        <p className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-medium">{t('condominium.name')}</p>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('auth.submit_register')}</h2>
                    <p className="text-slate-500 mt-2">{t('auth.register_subtitle')}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.name')}</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.email')}</label>
                        <input
                            type="email"
                            className="input w-full"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.phone')}</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.password')}</label>
                        <input
                            type="password"
                            className="input w-full"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? t('auth.registering') : t('auth.submit_register')}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    {t('auth.has_account')}{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.login_link')}</Link>
                </p>
            </div>
        </div>
    );
}
