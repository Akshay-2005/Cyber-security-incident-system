import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';

const IncidentModal = ({ isOpen, onClose, onSave, incidentToEdit }) => {
    const [formData, setFormData] = useState({
        incidentName: '',
        threatType: 'Malware Attack',
        severity: 'Low',
        priority: 'Low',
        sourceIp: '',
        destinationIp: '',
        assignedAnalyst: 'Anjali Singh',
        status: 'New',
        resolutionNotes: ''
    });

    useEffect(() => {
        if (incidentToEdit) {
            setFormData({
                incidentName: incidentToEdit.incidentName || '',
                threatType: incidentToEdit.threatType || 'Malware Attack',
                severity: incidentToEdit.severity || 'Low',
                priority: incidentToEdit.priority || 'Low',
                sourceIp: incidentToEdit.sourceIp || '',
                destinationIp: incidentToEdit.destinationIp || '',
                assignedAnalyst: incidentToEdit.assignedAnalyst || 'Anjali Singh',
                status: incidentToEdit.status || 'New',
                resolutionNotes: incidentToEdit.resolutionNotes || ''
            });
        } else {
            setFormData({
                incidentName: '',
                threatType: 'Malware Attack',
                severity: 'Low',
                priority: 'Low',
                sourceIp: '',
                destinationIp: '',
                assignedAnalyst: 'Anjali Singh',
                status: 'New',
                resolutionNotes: ''
            });
        }
    }, [incidentToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Simulate Apex logic locally: Priority = High automatically sets Status = New
            if (name === 'priority' && value === 'High') {
                updated.status = 'New';
            }
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    const threatTypes = ['Malware Attack', 'DDoS Traffic Spike', 'Suspicious Login Attempt', 'Ransomware Payload', 'Phishing Email Attack'];
    const levels = ['Low', 'Medium', 'High'];
    const analysts = ['Anjali Singh', 'Rahul Sharma', 'Priya Verma'];
    const statuses = ['New', 'In Progress', 'Resolved', 'Closed'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="cyber-panel w-full max-w-2xl rounded-xl border border-cyan-500/30 overflow-hidden shadow-cyber-neon-blue flex flex-col max-h-[90vh]">
                
                {/* HUD Modal Header */}
                <div className="p-5 border-b border-cyan-500/10 flex items-center justify-between bg-slate-950/60">
                    <h3 className="font-cyber font-bold text-slate-100 flex items-center gap-2 text-sm tracking-widest">
                        <ShieldAlert className="w-5 h-5 text-cyan-400" />
                        {incidentToEdit ? 'UPDATE SECURITY RECORD' : 'CREATE INCIDENT ENTRY'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded border border-transparent hover:border-slate-800 hover:bg-slate-900 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400 hover:text-white" />
                    </button>
                </div>

                {/* Form Input fields */}
                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 overflow-y-auto">
                    
                    {/* Name Field */}
                    <div>
                        <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                            Incident Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="incidentName"
                            required
                            value={formData.incidentName}
                            onChange={handleChange}
                            placeholder="e.g. Host-09 brute force dictionary intrusion"
                            className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm"
                        />
                    </div>

                    {/* Threat Type & Analyst Select Picklists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                                Threat Type
                            </label>
                            <select
                                name="threatType"
                                value={formData.threatType}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm"
                            >
                                {threatTypes.map(t => <option key={t} value={t} className="bg-slate-950">{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                                Assigned Analyst
                            </label>
                            <select
                                name="assignedAnalyst"
                                value={formData.assignedAnalyst}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm"
                            >
                                {analysts.map(a => <option key={a} value={a} className="bg-slate-950">{a}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Severity, Priority, Status Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                                Severity
                            </label>
                            <select
                                name="severity"
                                value={formData.severity}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm"
                            >
                                {levels.map(l => <option key={l} value={l} className="bg-slate-950">{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                                Response Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm"
                            >
                                {levels.map(l => <option key={l} value={l} className="bg-slate-950">{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                                Lifecycle Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={formData.priority === 'High'}
                                className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm disabled:opacity-50"
                            >
                                {statuses.map(s => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
                            </select>
                            {formData.priority === 'High' && (
                                <span className="text-[9px] text-red-400 mt-1 block font-cyber">Enforced by SF Trigger: Priority High sets Status to New.</span>
                            )}
                        </div>
                    </div>

                    {/* IPs Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                                Source IP Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="sourceIp"
                                required
                                value={formData.sourceIp}
                                onChange={handleChange}
                                placeholder="e.g. 195.120.44.12"
                                className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                                Destination Target IP <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="destinationIp"
                                required
                                value={formData.destinationIp}
                                onChange={handleChange}
                                placeholder="e.g. 10.0.4.155"
                                className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm"
                            />
                        </div>
                    </div>

                    {/* Resolution Notes */}
                    <div>
                        <label className="block text-[10px] uppercase font-cyber font-bold text-slate-400 tracking-widest mb-1.5">
                            Mitigation / Resolution Notes
                        </label>
                        <textarea
                            name="resolutionNotes"
                            rows="3"
                            value={formData.resolutionNotes}
                            onChange={handleChange}
                            placeholder="Detail actions taken to isolate threat or audit logs..."
                            className="w-full px-4 py-2.5 rounded-lg cyber-input border border-cyan-500/25 text-sm font-sans"
                        />
                    </div>

                </form>

                {/* Footer Modal Options */}
                <div className="p-4 border-t border-cyan-500/10 flex justify-end gap-3 bg-slate-950/60">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cyber-btn-secondary px-5 py-2 rounded text-xs"
                    >
                        Abort
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="cyber-btn-primary px-6 py-2 rounded text-xs flex items-center gap-1.5"
                    >
                        <Check className="w-4 h-4" />
                        Execute Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncidentModal;
