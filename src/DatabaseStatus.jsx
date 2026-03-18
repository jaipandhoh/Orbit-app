import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';

const DatabaseStatus = ({ apiBase = '/api' }) => {
  const [status, setStatus] = useState('checking'); // 'connected', 'disconnected', 'checking'
  const [lastChecked, setLastChecked] = useState(null);

  const checkDatabase = async () => {
    try {
      const response = await fetch(`${apiBase}/health/db`);
      const data = await response.json();
      
      if (data.status === 'connected') {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
      setLastChecked(new Date());
    } catch (error) {
      console.error('Database health check failed:', error);
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkDatabase();
    
    // Check every 30 seconds
    const interval = setInterval(checkDatabase, 30000);
    
    return () => clearInterval(interval);
  }, [apiBase]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'disconnected':
        return 'text-danger';
      default:
        return 'text-mutedText';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'connected':
        return 'bg-success/20 dark:bg-success/20';
      case 'disconnected':
        return 'bg-danger/20 dark:bg-danger/20';
      default:
        return 'bg-surface2 dark:bg-surface2-dark';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={14} className="text-success" />;
      case 'disconnected':
        return <XCircle size={14} className="text-danger" />;
      default:
        return <Loader size={14} className="text-mutedText animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-control ${getStatusBg()} transition-colors`}>
      <Database size={16} className={getStatusColor()} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-small font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        {lastChecked && status !== 'checking' && (
          <div className="text-xs text-mutedText mt-0.5">
            {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;

