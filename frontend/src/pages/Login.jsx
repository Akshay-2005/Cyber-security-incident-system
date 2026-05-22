import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const res = await login(email, password);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.message || 'Verification rejected.');
            }
        } catch (err) {
            setError('Handshake failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-cyber-bg min-h-screen relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 blur-3xl pointer-events-none rounded-full"></div>

            <div className="cyber-panel w-full max-w-md p-8 rounded-2xl border border-cyan-500/20 shadow-cyber-neon-blue backdrop-blur-xl">
                
                {/* HUD Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center mx-auto mb-4 relative shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Shield className="w-8 h-8 text-cyan-400" />
                        <span className="absolute inset-0 rounded bg-cyan-400/20 blur animate-pulse"></span>
                    </div>
                    <h2 className="font-cyber font-black tracking-widest text-slate-100 text-lg uppercase">
                        AEGIS<span className="text-cyan-400">SOC</span> LOGIN
                    </h2>
                    <p className="text-[10px] tracking-widest text-cyan-400/60 uppercase font-cyber font-bold mt-1">
                        Secure Gateway Handshake Authorization
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg text-xs font-cyber flex items-center gap-2 mb-6">
                        <AlertCircle className="w-4 h-4" />
                        {error.toUpperCase()}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                            Analyst Email Registry
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. admin@aegis.com"
                                className="w-full pl-10 pr-4 py-3 rounded-lg cyber-input border border-cyan-500/20 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                            Security Access Key
                        </label>
                        <div className="relative">
                            <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Access Key Code"
                                className="w-full pl-10 pr-4 py-3 rounded-lg cyber-input border border-cyan-500/20 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cyber-btn-primary w-full py-3 rounded-lg text-xs flex items-center justify-center font-bold tracking-widest"
                    >
                        {loading ? 'INITIATING HANDSHAKE...' : 'ESTABLISH SECURE LINK'}
                    </button>
                </form>

                {/* Quick Seeding accounts details */}
                <div className="mt-6 pt-6 border-t border-cyan-500/10 text-center space-y-1.5">
                    <p className="text-[10px] text-slate-500">
                        Default SOC credential keys (evaluation ready):
                    </p>
                    <div className="text-[9px] text-cyan-400/80 font-mono">
                        <p>Admin: admin@aegis.com / password123</p>
                        <p>Analyst: anjali@aegis.com / password123</p>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link to="/register" className="text-[10px] font-cyber text-slate-400 hover:text-cyan-400 tracking-widest uppercase transition-colors">
                        Register New Security Node Card &rarr;
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Login;
