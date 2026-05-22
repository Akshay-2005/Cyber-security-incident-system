import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    CartesianGrid, 
    Legend 
} from 'recharts';
import { 
    Trophy, 
    Clock, 
    CheckSquare, 
    Award,
    Activity
} from 'lucide-react';

const AnalystPerformance = () => {
    const { getAuthHeaders } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/analysts/leaderboard', { headers: getAuthHeaders() });
                const data = await res.json();
                if (data.success) {
                    setLeaderboard(data.leaderboard);
                }
            } catch (error) {
                console.warn('Leaderboard service offline, initializing simulated analytics profiles.');
                setLeaderboard([
                    { _id: '1', analystName: 'Anjali Singh', email: 'anjali@aegis.com', casesResolved: 48, averageResponseTime: 1.4, slaCompliance: 98.6 },
                    { _id: '2', analystName: 'Rahul Sharma', email: 'rahul@aegis.com', casesResolved: 42, averageResponseTime: 1.8, slaCompliance: 95.2 },
                    { _id: '3', analystName: 'Priya Verma', email: 'priya@aegis.com', casesResolved: 35, averageResponseTime: 2.1, slaCompliance: 92.8 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center bg-cyber-bg min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin"></div>
                    <p className="font-cyber text-xs uppercase tracking-widest text-cyan-400 animate-pulse">Retrieving performance telemetry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-cyber-bg">
            {/* Header HUD */}
            <div className="flex justify-between items-center mb-8 border-b border-cyan-500/10 pb-4">
                <div>
                    <h2 className="text-2xl font-cyber font-black tracking-wider text-slate-100 flex items-center gap-2">
                        SOC ANALYST PERFORMANCE
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Speed diagnostics, ticket resolution quantities, and SLA metric leaderboards</p>
                </div>
            </div>

            {/* Performance metrics dashboard grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Leaderboard Table Column */}
                <div className="cyber-panel p-6 rounded-xl lg:col-span-2">
                    <h4 className="font-cyber font-bold text-sm text-slate-200 tracking-wider mb-6 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-cyan-400" /> SOC PERFORMANCE LEADERBOARD
                    </h4>
                    <div className="space-y-4">
                        {leaderboard.map((analyst, index) => (
                            <div 
                                key={analyst._id} 
                                className={`p-4 bg-slate-950/60 border rounded-lg flex items-center justify-between gap-4 transition-all duration-300 ${
                                    index === 0 
                                        ? 'border-cyan-400/40 shadow-cyber-neon-blue' 
                                        : 'border-slate-900 hover:border-cyan-500/25'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Place Rank Indicator */}
                                    <div className={`w-8 h-8 rounded border font-cyber font-black text-sm flex items-center justify-center ${
                                        index === 0 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' :
                                        index === 1 ? 'bg-purple-500/20 border-purple-400 text-purple-400' :
                                        'bg-slate-900 border-slate-800 text-slate-400'
                                    }`}>
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <h5 className="font-cyber font-bold text-sm text-slate-100">{analyst.analystName}</h5>
                                        <span className="text-[10px] text-slate-500 font-mono">{analyst.email}</span>
                                    </div>
                                </div>

                                {/* Metrics Summary */}
                                <div className="flex items-center gap-6 font-cyber text-center">
                                    <div>
                                        <span className="text-[8px] text-slate-400 uppercase tracking-widest block">Mitigated</span>
                                        <p className="text-sm font-black text-cyan-400 mt-0.5">{analyst.casesResolved}</p>
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-slate-400 uppercase tracking-widest block">SLA Compliance</span>
                                        <p className="text-sm font-black text-emerald-400 mt-0.5">{analyst.slaCompliance}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Snapshot cards */}
                <div className="space-y-6">
                    {/* Top SLA adherence card */}
                    <div className="cyber-panel p-6 rounded-xl border-l-4 border-l-emerald-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-cyber tracking-widest block">Primary Honor Medal</span>
                                <h5 className="font-cyber font-black text-slate-200 mt-1">BEST SLA RESPONDER</h5>
                                <p className="text-sm font-cyber font-black text-emerald-400 mt-4">
                                    {leaderboard[0]?.analystName || 'N/A'} ({leaderboard[0]?.slaCompliance || 100}%)
                                </p>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/30">
                                <Award className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Fastest resolution speed card */}
                    <div className="cyber-panel p-6 rounded-xl border-l-4 border-l-cyan-400">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-cyber tracking-widest block">Time efficiency index</span>
                                <h5 className="font-cyber font-black text-slate-200 mt-1">FASTEST CASE CONTAINMENT</h5>
                                <p className="text-sm font-cyber font-black text-cyan-400 mt-4">
                                    {leaderboard[0]?.analystName || 'N/A'} ({leaderboard[0]?.averageResponseTime || 1.4} Hours Avg)
                                </p>
                            </div>
                            <div className="p-2 bg-cyan-500/10 rounded border border-cyan-400/30">
                                <Clock className="w-6 h-6 text-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance charts mapping metrics for the team */}
            <div className="cyber-panel p-6 rounded-xl">
                <h4 className="font-cyber font-bold text-sm text-slate-200 tracking-wider mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" /> RESOLUTION RESPONSE TIME (HOURS) COMPARATIVE
                </h4>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leaderboard}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.05)" />
                            <XAxis dataKey="analystName" stroke="#64748B" style={{ fontSize: 10, fontFamily: 'Orbitron' }} />
                            <YAxis stroke="#64748B" style={{ fontSize: 10, fontFamily: 'Orbitron' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(6, 182, 212, 0.2)', color: '#fff' }} />
                            <Bar dataKey="averageResponseTime" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Average Hours per Ticket" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalystPerformance;
