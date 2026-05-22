import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    ShieldAlert, 
    Binary, 
    BarChart3, 
    Activity, 
    Settings, 
    LogOut,
    ShieldAlert as ShieldIcon
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
        { name: 'Threat Logs', path: '/threat-logs', icon: Binary },
        { name: 'Performance', path: '/performance', icon: BarChart3 },
        { name: 'Reports', path: '/reports', icon: Activity },
        { name: 'Settings & Sync', path: '/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-950/70 border-r border-cyan-500/20 backdrop-blur-xl flex flex-col h-screen sticky top-0 z-20 shrink-0">
            {/* Logo Section */}
            <div className="p-6 border-b border-cyan-500/10 flex items-center gap-3">
                <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/40 relative">
                    <ShieldIcon className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <span className="absolute inset-0 rounded bg-cyan-400/20 blur animate-pulse"></span>
                </div>
                <div>
                    <h1 className="font-cyber font-black tracking-widest text-slate-100 text-lg">
                        AEGIS<span className="text-cyan-400">SOC</span>
                    </h1>
                    <p className="text-[10px] tracking-widest text-cyan-400/60 uppercase font-cyber font-bold">
                        Sentinel Gate v2.6
                    </p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-cyber font-medium tracking-wide transition-all duration-300 group relative
                            ${isActive 
                                ? 'text-cyan-400 border border-cyan-400/20 bg-cyan-500/10 shadow-cyber-neon' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-800 border border-transparent'
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                                <span>{item.name}</span>
                                
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeGlow"
                                        className="absolute right-0 top-1/4 bottom-1/4 w-[3px] rounded-l bg-cyan-400 shadow-cyber-neon"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Analyst Identity Card */}
            <div className="p-4 border-t border-cyan-500/10 bg-slate-950/40">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full border border-cyan-400/30 bg-slate-900 flex items-center justify-center font-cyber font-bold text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                        {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'AN'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate">{user?.name || 'System Analyst'}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-cyber font-bold text-cyan-400 tracking-wider">
                            {user?.role || 'Security Analyst'}
                        </span>
                    </div>
                </div>
                
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded border border-red-500/30 hover:border-red-500 text-slate-400 hover:text-white bg-red-950/10 hover:bg-red-500/20 text-xs font-cyber tracking-wider transition-all duration-300"
                >
                    <LogOut className="w-4 h-4" />
                    DISCONNECT
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
