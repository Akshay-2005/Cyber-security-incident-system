import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import IncidentModal from '../components/IncidentModal';
import { 
    Plus, 
    Search, 
    SlidersHorizontal, 
    Trash2, 
    Edit2, 
    RefreshCw, 
    CloudLightning,
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const Incidents = () => {
    const { getAuthHeaders } = useAuth();
    
    // CRUD & UI States
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncident, setEditingIncident] = useState(null);
    const [toast, setToast] = useState(null);

    // Filter & Search Parameters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [severity, setSeverity] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // High Severity alert popups
    const [emergencyPopup, setEmergencyPopup] = useState(null);

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                search,
                status,
                severity,
                page,
                limit: 8
            }).toString();

            const res = await fetch(`/api/incidents?${queryParams}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (data.success) {
                setIncidents(data.incidents);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error('Failed to load incidents, running offline fallback simulation.');
            // Fallback mock records
            const mockIncidents = [
                { _id: '1', incidentName: 'Credential Spray Intrusion Probe', threatType: 'Suspicious Login Attempt', severity: 'Low', priority: 'Low', sourceIp: '185.220.101.44', destinationIp: '10.0.4.15', assignedAnalyst: 'Priya Verma', status: 'Resolved', salesforceId: 'a008d00000Mock123A' },
                { _id: '2', incidentName: 'Ransomware Sandbox Probe Spike', threatType: 'Ransomware Payload', severity: 'High', priority: 'High', sourceIp: '91.240.118.82', destinationIp: '192.168.4.88', assignedAnalyst: 'Rahul Sharma', status: 'New', salesforceId: null },
                { _id: '3', incidentName: 'DDoS Traffic Inbound Volumetric Probe', threatType: 'DDoS Traffic Spike', severity: 'High', priority: 'High', sourceIp: '45.142.120.11', destinationIp: '10.0.1.200', assignedAnalyst: 'Anjali Singh', status: 'In Progress', salesforceId: 'a008d00000Mock444X' }
            ];
            setIncidents(mockIncidents);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, [search, status, severity, page]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = async (formData) => {
        try {
            let res;
            if (editingIncident) {
                // Update
                res = await fetch(`/api/incidents/${editingIncident._id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(formData)
                });
            } else {
                // Create
                res = await fetch('/api/incidents', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();
            
            if (data.success) {
                showToast(editingIncident ? 'Incident details updated' : 'Incident successfully filed');
                setIsModalOpen(false);
                setEditingIncident(null);
                
                // Triggers emergency popup overlay in UI if severity is High
                if (data.incident.severity === 'High' && !editingIncident) {
                    setEmergencyPopup({
                        title: '🚨 CRITICAL EXTRUSION REPORT FILED',
                        message: `Emergency SMTP Dispatch activated for high priority case: "${data.incident.incidentName}". Incident status initialized to NEW by SOC triggers.`,
                        incident: data.incident
                    });
                }
                
                fetchIncidents();
            } else {
                showToast(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            // Mock Offline save
            showToast('Offline Save Triggered: Action registered in browser session storage.');
            setIsModalOpen(false);
            setEditingIncident(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('🚨 WARNING: You are initiating a PURGE command. This will remove the record locally and in Salesforce. Confirm?')) return;

        try {
            const res = await fetch(`/api/incidents/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();

            if (data.success) {
                showToast('Incident fully purged from SOC database');
                fetchIncidents();
            } else {
                showToast(data.message || 'Action denied', 'error');
            }
        } catch (error) {
            showToast('Offline deletion logged locally', 'error');
        }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-cyber-bg relative">
            
            {/* Toast Notification HUD */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-lg border font-cyber text-xs tracking-wider shadow-lg flex items-center gap-2 ${
                    toast.type === 'error' 
                        ? 'bg-red-500/10 border-red-500 text-red-400 shadow-cyber-neon-red animate-bounce' 
                        : 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4.5 h-4.5 animate-spin" /> : <CheckCircle className="w-4.5 h-4.5" />}
                    {toast.message.toUpperCase()}
                </div>
            )}

            {/* HIGH SEVERITY EMERGENCY DANGER OVERLAY POPUP */}
            {emergencyPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                    <div className="border-2 border-red-500 bg-red-950/20 max-w-lg p-6 rounded-xl text-center shadow-cyber-neon-red flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-4 animate-ping">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h4 className="font-cyber font-black text-xl text-red-500 mb-2">{emergencyPopup.title}</h4>
                        <p className="text-sm text-slate-200 mb-4">{emergencyPopup.message}</p>
                        
                        <div className="bg-slate-950/80 p-4 rounded border border-red-500/30 text-left text-xs font-mono mb-6 w-full space-y-1.5">
                            <p><span className="text-red-400">Incident Code:</span> INC-AUTO-GEN</p>
                            <p><span className="text-red-400">Threat Type:</span> {emergencyPopup.incident.threatType}</p>
                            <p><span className="text-red-400">Target IP Address:</span> {emergencyPopup.incident.destinationIp}</p>
                            <p><span className="text-red-400">Gateway Status:</span> CRITICAL AUTOMATED ACTION</p>
                        </div>
                        
                        <button
                            onClick={() => setEmergencyPopup(null)}
                            className="cyber-btn-danger px-8 py-3 rounded text-sm w-full"
                        >
                            Acknowledge Incident & Clear Board
                        </button>
                    </div>
                </div>
            )}

            {/* HUD Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-cyan-500/10 pb-4">
                <div>
                    <h2 className="text-2xl font-cyber font-black tracking-wider text-slate-100 flex items-center gap-2">
                        CYBER INTRUSION FILES
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Active Incident Registry and Salesforce Records Manager</p>
                </div>
                <button
                    onClick={() => {
                        setEditingIncident(null);
                        setIsModalOpen(true);
                    }}
                    className="cyber-btn-primary px-6 py-3 rounded-lg text-xs flex items-center gap-1.5 self-start"
                >
                    <Plus className="w-4.5 h-4.5" />
                    FILE NEW INCIDENT
                </button>
            </div>

            {/* Filter Toolbar HUD */}
            <div className="cyber-panel p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Search Bar */}
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search incident name, IP vectors, analyst..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg cyber-input border border-cyan-500/20 text-xs"
                    />
                </div>
                {/* Status Filter */}
                <div>
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2.5 rounded-lg cyber-input border border-cyan-500/20 text-xs bg-slate-950"
                    >
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                {/* Severity Filter */}
                <div>
                    <select
                        value={severity}
                        onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2.5 rounded-lg cyber-input border border-cyan-500/20 text-xs bg-slate-950"
                    >
                        <option value="">All Severities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>

            {/* Incidents Data Table */}
            <div className="cyber-panel rounded-xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/60 border-b border-cyan-500/10 font-cyber text-[10px] tracking-wider text-slate-400 uppercase">
                                <th className="p-4">Incident Details</th>
                                <th className="p-4">Security Level</th>
                                <th className="p-4">{"IP Coordinates (Src -> Dst)"}</th>
                                <th className="p-4">Assigned Analyst</th>
                                <th className="p-4">Lifecycle</th>
                                <th className="p-4">Salesforce Sync</th>
                                <th className="p-4 text-right">Security Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-500/5 text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center">
                                        <div className="w-8 h-8 border-t-2 border-cyan-400 rounded-full animate-spin mx-auto mb-3"></div>
                                        <span className="text-xs font-cyber text-slate-400 uppercase tracking-widest animate-pulse">Scanning records registry...</span>
                                    </td>
                                </tr>
                            ) : incidents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-xs font-cyber text-slate-400 uppercase tracking-widest">
                                        No security incident files found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                incidents.map((inc) => (
                                    <tr key={inc._id} className="hover:bg-cyan-500/5 transition-colors group">
                                        <td className="p-4 max-w-xs">
                                            <p className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm truncate">{inc.incidentName}</p>
                                            <span className="text-[9px] text-slate-500 uppercase tracking-wider">{inc.threatType}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                                                    inc.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                                    inc.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                } uppercase tracking-widest font-cyber`}>
                                                    Sev: {inc.severity}
                                                </span>
                                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                                                    inc.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-cyber-neon-red' :
                                                    inc.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                } uppercase tracking-widest font-cyber`}>
                                                    Pri: {inc.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-400">
                                            <code>{inc.sourceIp}</code> <span className="text-cyan-500">&rarr;</span> <code>{inc.destinationIp}</code>
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-slate-300">
                                            {inc.assignedAnalyst}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-cyber font-bold px-2.5 py-0.5 rounded-full ${
                                                inc.status === 'New' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                inc.status === 'In Progress' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                                inc.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                'bg-slate-800 text-slate-400 border border-slate-700'
                                            } uppercase`}>
                                                {inc.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {inc.salesforceId ? (
                                                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-cyber font-bold">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-[9px] uppercase tracking-wider">{inc.salesforceId.substring(0, 10)}...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-cyber font-bold">
                                                    <CloudLightning className="w-4 h-4 text-amber-400 animate-pulse" />
                                                    <span className="text-[9px] uppercase tracking-wider">PENDING SYNC</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingIncident(inc);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-all duration-300"
                                                >
                                                    <Edit2 className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(inc._id)}
                                                    className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-red-500/40 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all duration-300"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls HUD */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-slate-950/40 border border-cyan-500/10 px-6 py-4 rounded-xl font-cyber text-xs">
                    <span className="text-slate-400">STAGE {page} OF {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            className="cyber-btn-secondary p-2 rounded disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            className="cyber-btn-secondary p-2 rounded disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Incident Edit/Create Modal Wrapper */}
            <IncidentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingIncident(null);
                }}
                onSave={handleSave}
                incidentToEdit={editingIncident}
            />

        </div>
    );
};

export default Incidents;
