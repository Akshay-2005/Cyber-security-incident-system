import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components & Layouts
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import ThreatLogs from './pages/ThreatLogs';
import AnalystPerformance from './pages/AnalystPerformance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// PrivateRoute Wrapper for Session Security
const ProtectedLayout = ({ children }) => {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin"></div>
                    <p className="font-cyber text-xs uppercase tracking-widest text-cyan-400 animate-pulse">Running security checks...</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen flex bg-cyber-bg relative selection:bg-cyan-500/35 selection:text-white">
            {/* Sidebar navigation */}
            <Sidebar />
            
            {/* Main content body scrollable container */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {children}
            </main>
        </div>
    );
};

const AppContent = () => {
    return (
        <Routes>
            {/* Public Auth Handshake routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected SOC Dashboard Hub routes */}
            <Route path="/" element={
                <ProtectedLayout>
                    <Dashboard />
                </ProtectedLayout>
            } />
            <Route path="/incidents" element={
                <ProtectedLayout>
                    <Incidents />
                </ProtectedLayout>
            } />
            <Route path="/threat-logs" element={
                <ProtectedLayout>
                    <ThreatLogs />
                </ProtectedLayout>
            } />
            <Route path="/performance" element={
                <ProtectedLayout>
                    <AnalystPerformance />
                </ProtectedLayout>
            } />
            <Route path="/reports" element={
                <ProtectedLayout>
                    <Reports />
                </ProtectedLayout>
            } />
            <Route path="/settings" element={
                <ProtectedLayout>
                    <Settings />
                </ProtectedLayout>
            } />

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
