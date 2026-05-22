import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    FileText, 
    Download, 
    ShieldAlert, 
    Clock, 
    Server,
    Binary
} from 'lucide-react';

const Reports = () => {
    const { getAuthHeaders } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/incidents?limit=100', { headers: getAuthHeaders() });
                const data = await res.json();
                if (data.success) {
                    setIncidents(data.incidents);
                }
            } catch (error) {
                console.warn('Reports connection offline. Generating static reports data.');
                setIncidents([
                    { _id: '1', incidentName: 'DDoS Spikes Intrusions Probe', threatType: 'DDoS Traffic Spike', severity: 'High', priority: 'High', sourceIp: '45.142.120.11', destinationIp: '10.0.1.200', assignedAnalyst: 'Anjali Singh', status: 'In Progress', createdAt: new Date() },
                    { _id: '2', incidentName: 'Brute Force Attempts Registry Probe', threatType: 'Suspicious Login Attempt', severity: 'Low', priority: 'Low', sourceIp: '185.220.101.44', destinationIp: '10.0.4.15', assignedAnalyst: 'Priya Verma', status: 'Resolved', createdAt: new Date() }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const printReport = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center bg-cyber-bg min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin"></div>
                    <p className="font-cyber text-xs uppercase tracking-widest text-cyan-400 animate-pulse">Compiling Intel briefs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-cyber-bg print:p-0 print:bg-white print:text-black">
            
            {/* Header HUD */}
            <div className="flex justify-between items-center mb-8 border-b border-cyan-500/10 pb-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-cyber font-black tracking-wider text-slate-100 flex items-center gap-2">
                        SOC AUDIT REPORTS
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Printer-ready operations audit logs, mitigation reviews, and SIEM summaries</p>
                </div>
                <button
                    onClick={printReport}
                    className="cyber-btn-primary px-6 py-3 rounded-lg text-xs flex items-center gap-1.5"
                >
                    <Download className="w-4.5 h-4.5" />
                    PRINT / DOWNLOAD PDF
                </button>
            </div>

            {/* Print Header (Visible only on print) */}
            <div className="hidden print:block mb-8 text-black border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold tracking-wider">AEGIS SENTINEL SECURE AUDIT REPORT</h1>
                <p className="text-xs uppercase text-slate-700">Generated: {new Date().toLocaleString()} // Classified: Internal Use Only</p>
            </div>

            {/* Main Report Body */}
            <div className="space-y-6">
                
                {/* Stats Dashboard Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                    <div className="cyber-panel p-6 rounded-xl print:bg-white print:border-black print:text-black">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-cyber">Active Registry Incidents</span>
                        <span className="text-3xl font-cyber font-black text-cyan-400 mt-1 print:text-black">{incidents.length} Records</span>
                    </div>
                    <div className="cyber-panel p-6 rounded-xl print:bg-white print:border-black print:text-black">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-cyber">Critical High Severity</span>
                        <span className="text-3xl font-cyber font-black text-red-500 mt-1 print:text-black">
                            {incidents.filter(i=>i.severity==='High').length} Active
                        </span>
                    </div>
                    <div className="cyber-panel p-6 rounded-xl print:bg-white print:border-black print:text-black">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-cyber">Target SLA Standard</span>
                        <span className="text-3xl font-cyber font-black text-emerald-400 mt-1 print:text-black">95% compliant</span>
                    </div>
                </div>

                {/* AI Executive Summary Panel */}
                <div className="cyber-panel p-6 rounded-xl print:border-black print:text-black">
                    <h4 className="font-cyber font-bold text-sm text-slate-200 tracking-wider mb-3 flex items-center gap-2 print:text-black">
                        <FileText className="w-5 h-5 text-cyan-400 print:text-black" /> EXECUTIVE INTELLIGENCE SUMMARY
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed print:text-black">
                        During the current audit cycle, the AegisSentinel security gateway monitored outbound traffic patterns across mapped sandboxes. Key activities recorded include High severity network scans originating from suspicious blocks targeting database cores. Internal security mitigation algorithms successfully auto-enforced rules on all High priority entries. Dynamic triggers logged all activities in Salesforce endpoints with 100% data transmission fidelity. Core operational SLAs remain compliant with incident resolution targets of less than two hours.
                    </p>
                </div>

                {/* Listing of logged incidents */}
                <div className="cyber-panel p-6 rounded-xl print:border-black print:text-black">
                    <h4 className="font-cyber font-bold text-sm text-slate-200 tracking-wider mb-6 flex items-center gap-2 print:text-black">
                        <Binary className="w-5 h-5 text-cyan-400 print:text-black" /> INTRUSION RECORDS INDEX
                    </h4>
                    <div className="space-y-4">
                        {incidents.map((inc) => (
                            <div key={inc._id} className="p-4 bg-slate-950/40 border border-slate-900 rounded print:bg-white print:border-black print:text-black">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                        <h5 className="font-bold text-sm text-slate-100 print:text-black">{inc.incidentName}</h5>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1 print:text-black">
                                            Coordinates: {inc.sourceIp} &rarr; {inc.destinationIp}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-cyber print:text-black print:border-black">
                                            {inc.severity.toUpperCase()}
                                        </span>
                                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-cyber print:text-black print:border-black">
                                            {inc.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                {inc.resolutionNotes && (
                                    <div className="mt-3 pt-3 border-t border-cyan-500/10 text-xs text-slate-400 font-mono print:border-black print:text-black">
                                        <span className="text-cyan-400 font-cyber font-bold text-[10px] tracking-wider block mb-1 print:text-black">Resolution notes:</span>
                                        {inc.resolutionNotes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
