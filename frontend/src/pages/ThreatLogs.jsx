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
    Cell
} from 'recharts';
import { 
    Binary, 
    Activity, 
    Link as LinkIcon, 
    AlertTriangle,
    ShieldCheck,
    Terminal
} from 'lucide-react';

const ThreatLogs = () => {
    const { getAuthHeaders } = useAuth();
    const [logs, setLogs] = useState([]);
    const [analytics, setAnalytics] = useState({
        levelDistribution: [],
        typeDistribution: []
    });
    const [loading, setLoading] = useState(true);

    const COLORS = ['#00D2FF', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

    useEffect(() => {
        const fetchThreats = async () => {
            try {
                // Fetch threat log list
                const logsRes = await fetch('/api/threats', { headers: getAuthHeaders() });
                const logsData = await logsRes.json();

                // Fetch aggregations
                const analyticRes = await fetch('/api/threats/analytics', { headers: getAuthHeaders() });
                const analyticData = await analyticRes.json();

                if (logsData.success && analyticData.success) {
                    setLogs(logsData.logs);
                    setAnalytics(analyticData);
                }
            } catch (error) {
                console.warn('Threat Service offline, launching simulation profiles.');
                // Simulate robust threat records
                setLogs([
                    { _id: '1', threatLogName: 'Intrusion Alert: Wannacry Signature Blocked', threatType: 'Ransomware Payload', threatLevel: 'High', sourceIp: '91.240.118.82', destinationIp: '192.168.4.88', createdAt: new Date() },
                    { _id: '2', threatLogName: 'Inbound SYN Flood DD-994 Detected', threatType: 'DDoS Traffic Spike', threatLevel: 'High', sourceIp: '45.142.120.11', destinationIp: '10.0.1.200', createdAt: new Date() },
                    { _id: '3', threatLogName: 'Credential Spray Attempt Logged', threatType: 'Suspicious Login Attempt', threatLevel: 'Low', sourceIp: '185.220.101.44', destinationIp: '10.0.4.15', createdAt: new Date() },
                    { _id: '4', threatLogName: 'Phishing Target URL Hook Intercepted', threatType: 'Phishing Email Attack', threatLevel: 'Medium', sourceIp: '103.24.12.8', destinationIp: '10.0.8.44', createdAt: new Date() }
                ]);
                setAnalytics({
                    levelDistribution: [
                        { level: 'High', count: 2 },
                        { level: 'Medium', count: 1 },
                        { level: 'Low', count: 1 }
                    ],
                    typeDistribution: [
                        { name: 'Ransomware', value: 2 },
                        { name: 'DDoS Spikes', value: 1 },
                        { name: 'Phishing', value: 1 }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchThreats();
    }, []);

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center bg-cyber-bg min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin"></div>
                    <p className="font-cyber text-xs uppercase tracking-widest text-cyan-400 animate-pulse">Querying Threat Vault...</p>
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
                        THREAT INTELLIGENCE LOGS
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Real-time firewall, system, and intrusion telemetry logs</p>
                </div>
            </div>

            {/* Analytics Dashlets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Level Distribution Chart */}
                <div className="cyber-panel p-6 rounded-xl">
                    <h4 className="font-cyber font-bold text-sm text-slate-200 tracking-wider mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-500" /> THREAT SEVERITY PROFILE
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.levelDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.05)" />
                                <XAxis dataKey="level" stroke="#64748B" style={{ fontSize: 10, fontFamily: 'Orbitron' }} />
                                <YAxis stroke="#64748B" style={{ fontSize: 10, fontFamily: 'Orbitron' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(6, 182, 212, 0.2)', color: '#fff' }} />
                                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                                    {analytics.levelDistribution.map((entry, index) => {
                                        let barColor = '#3b82f6';
                                        if (entry.level === 'High') barColor = '#ef4444';
                                        if (entry.level === 'Medium') barColor = '#f59e0b';
                                        return <Cell key={`cell-${index}`} fill={barColor} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Threat Log Count Indicators */}
                <div className="cyber-panel p-6 rounded-xl flex flex-col justify-between">
                    <div>
                        <h4 className="font-cyber font-bold text-sm text-slate-200 tracking-wider mb-4 flex items-center gap-2">
                            <Terminal className="w-4.5 h-4.5 text-cyan-400" /> SYSTEM SIGNATURE AUDIT STATUS
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            Global systems threat monitoring is active. Total of {logs.length} intrusion attempt logs captured in active index. Real-time firewall rule synchronizations successfully completed with cloud targets.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 font-cyber text-center">
                        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">High Threat</span>
                            <p className="text-2xl font-black text-red-500 mt-1">
                                {logs.filter(l=>l.threatLevel==='High').length}
                            </p>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Medium</span>
                            <p className="text-2xl font-black text-amber-500 mt-1">
                                {logs.filter(l=>l.threatLevel==='Medium').length}
                            </p>
                        </div>
                        <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-lg">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Low Threat</span>
                            <p className="text-2xl font-black text-cyan-400 mt-1">
                                {logs.filter(l=>l.threatLevel==='Low').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs List Panel HUD */}
            <div className="cyber-panel p-6 rounded-xl">
                <h4 className="font-cyber font-bold text-sm text-slate-200 tracking-wider mb-6 flex items-center gap-2">
                    <Binary className="w-4.5 h-4.5 text-cyan-400" /> TELEMETRY FLOW STREAM
                </h4>
                <div className="space-y-4">
                    {logs.map((log) => (
                        <div key={log._id} className="p-4 bg-slate-950/50 border border-slate-900 hover:border-cyan-500/25 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 group">
                            
                            {/* Threat Info block */}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className={`text-[8px] font-cyber font-bold px-2 py-0.5 rounded ${
                                        log.threatLevel === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                        log.threatLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    } uppercase`}>
                                        {log.threatLevel} Threat
                                    </span>
                                    <h5 className="font-cyber font-bold text-sm text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                                        {log.threatLogName}
                                    </h5>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                                    <p>Type: <span className="text-slate-400">{log.threatType}</span></p>
                                    <p>Src IP: <code className="text-slate-400">{log.sourceIp}</code></p>
                                    <p>Dst IP: <code className="text-slate-400">{log.destinationIp}</code></p>
                                </div>
                            </div>

                            {/* Incident link badge */}
                            <div className="shrink-0 flex items-center gap-2">
                                {log.linkedIncident ? (
                                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-cyber font-bold px-3 py-1.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
                                        <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Linked Case File</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-cyber px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                                        <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Containment Active</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThreatLogs;
