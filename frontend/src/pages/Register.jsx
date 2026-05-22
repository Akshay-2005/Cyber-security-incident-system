import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, User, ShieldAlert, AlertCircle } from 'lucide-react';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Analyst');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await register(name, email, password, role);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.message || 'Node authorization failed.');
            }
        } catch (err) {
            setError('Registration handshake failed.');
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
                    <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-4 relative shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <ShieldAlert className="w-8 h-8 text-purple-400 animate-pulse" />
                        <span className="absolute inset-0 rounded bg-purple-400/20 blur animate-pulse"></span>
                    </div>
                    <h2 className="font-cyber font-black tracking-widest text-slate-100 text-lg uppercase">
                        REGISTER NEW NODE
                    </h2>
                    <p className="text-[10px] tracking-widest text-purple-400/60 uppercase font-cyber font-bold mt-1">
                        Enroll Security Analyst Credentials Card
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg text-xs font-cyber flex items-center gap-2 mb-6 animate-bounce">
                        <AlertCircle className="w-4 h-4" />
                        {error.toUpperCase()}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                            Analyst User Name
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg cyber-input border border-cyan-500/20 text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                            Email Address Registry
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john.doe@aegis.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg cyber-input border border-cyan-500/20 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                            Role Authorization Level
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg cyber-input border border-cyan-500/20 text-xs bg-slate-950 font-cyber"
                        >
                            <option value="Analyst" className="bg-slate-950">Analyst</option>
                            <option value="Security Engineer" className="bg-slate-950">Security Engineer</option>
                            <option value="Admin" className="bg-slate-950">Admin</option>
                        </select>
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
                                placeholder="Choose security code"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg cyber-input border border-cyan-500/20 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cyber-btn-secondary w-full py-3 rounded-lg text-xs flex items-center justify-center font-bold tracking-widest mt-4"
                    >
                        {loading ? 'ENROLLING NODE CARD...' : 'AUTHORIZE ACCOUNT REGISTRY'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link to="/login" className="text-[10px] font-cyber text-slate-400 hover:text-cyan-400 tracking-widest uppercase transition-colors">
                        &larr; Return to gateway login page
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Register;
