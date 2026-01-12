import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { Loader2, Building2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Falha no login');
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
                        <h1 className="text-xl font-bold tracking-tight">RealHub</h1>
                        <p className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-medium">Residencial Costa Real 1</p>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('auth.login_title')}</h2>
                    <p className="text-slate-500 mt-2">{t('auth.login_subtitle')}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.email')}</label>
                        <input
                            type="email"
                            className="input w-full"
                            placeholder={t('auth.email_placeholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-700">{t('auth.password')}</label>
                            <Link to="/forgot-password" className="text-sm text-primary hover:underline">{t('auth.forgot_password')}</Link>
                        </div>
                        <input
                            type="password"
                            className="input w-full"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? t('common.loading') : t('auth.submit_login')}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    {t('auth.no_account')}{' '}
                    <Link to="/register" className="text-primary font-medium hover:underline">{t('auth.submit_register')}</Link>
                </p>
            </div>
        </div>
    );
}
