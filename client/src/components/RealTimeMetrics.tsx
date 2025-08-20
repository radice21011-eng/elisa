import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Metric } from '@shared/schema';
import { TrendingUp, Activity, AlertTriangle, Database, Zap } from 'lucide-react';

interface MetricsDisplayProps {
  metrics: Metric[];
}

export default function RealTimeMetrics() {
  const [realtimeMetrics, setRealtimeMetrics] = useState<Metric[]>([]);
  const { lastMessage } = useWebSocket();

  const { data: initialMetrics = [] } = useQuery({
    queryKey: ['/api/metrics']
  });

  useEffect(() => {
    setRealtimeMetrics(initialMetrics as any[]);
  }, [initialMetrics]);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'metrics_update') {
        setRealtimeMetrics(prev => [...lastMessage.data, ...prev].slice(0, 100));
      } else if (lastMessage.type === 'metric_created') {
        setRealtimeMetrics(prev => [lastMessage.data, ...prev].slice(0, 100));
      }
    }
  }, [lastMessage]);

  const groupedMetrics = realtimeMetrics.reduce((acc, metric) => {
    if (!acc[metric.type]) acc[metric.type] = [];
    acc[metric.type].push(metric);
    return acc;
  }, {} as Record<string, Metric[]>);

  const getLatestValue = (type: string) => {
    const typeMetrics = groupedMetrics[type] || [];
    return typeMetrics[0]?.value || 0;
  };

  const getTrend = (type: string) => {
    const typeMetrics = groupedMetrics[type]?.slice(0, 5) || [];
    if (typeMetrics.length < 2) return 'stable';

    const recent = typeMetrics[0]?.value || 0;
    const previous = typeMetrics[1]?.value || 0;

    if (recent > previous) return 'up';
    if (recent < previous) return 'down';
    return 'stable';
  };

  const metricConfigs = [
    {
      type: 'console_attempts',
      label: 'Console Attempts Blocked',
      icon: AlertTriangle,
      color: 'red',
      description: 'Unauthorized console access attempts'
    },
    {
      type: 'fines_issued',
      label: 'Fines Issued',
      icon: Zap,
      color: 'yellow',
      description: 'ELISA enforcement actions'
    },
    {
      type: 'quantum_operations',
      label: 'Quantum Operations',
      icon: Database,
      color: 'cyan',
      description: 'AI model quantum computations'
    },
    {
      type: 'security_scans',
      label: 'Security Scans',
      icon: Activity,
      color: 'green',
      description: 'System integrity checks'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-purple-400 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3" />
          Real-Time System Metrics
        </h3>
        <div className="text-sm text-gray-400">
          Live updates via WebSocket
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricConfigs.map(config => {
          const latest = getLatestValue(config.type);
          const trend = getTrend(config.type);
          const colorClasses = {
            red: 'border-red-500 bg-red-900/20',
            yellow: 'border-yellow-500 bg-yellow-900/20',
            cyan: 'border-cyan-500 bg-cyan-900/20',
            green: 'border-green-500 bg-green-900/20'
          };

          const textColors = {
            red: 'text-red-400',
            yellow: 'text-yellow-400', 
            cyan: 'text-cyan-400',
            green: 'text-green-400'
          };

          return (
            <div key={config.type} className={`border-2 rounded-xl p-4 ${colorClasses[config.color as keyof typeof colorClasses]}`}>
              <div className="flex items-center justify-between mb-3">
                <config.icon className={`w-6 h-6 ${textColors[config.color as keyof typeof textColors]}`} />
                <div className="flex items-center text-sm">
                  {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {trend === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                  {trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full opacity-50" />}
                </div>
              </div>

              <div className="mb-2">
                <div className={`text-2xl font-bold ${textColors[config.color as keyof typeof textColors]}`}>
                  {latest.toLocaleString()}
                </div>
                <div className="text-white font-semibold text-sm">{config.label}</div>
              </div>

              <div className="text-xs text-gray-400">
                {config.description}
              </div>

              {groupedMetrics[config.type]?.[0] && (
                <div className="text-xs text-gray-500 mt-2">
                  Last update: {new Date(groupedMetrics[config.type][0].timestamp!).toLocaleTimeString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Metrics Timeline */}
      <div className="bg-black/60 border border-purple-500/50 rounded-xl p-4">
        <h4 className="font-bold text-purple-300 mb-4">Recent Activity Timeline</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {realtimeMetrics.slice(0, 20).map((metric, index) => {
            const config = metricConfigs.find(c => c.type === metric.type);
            if (!config) return null;

            return (
              <div key={`${metric.id}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                <div className="flex items-center">
                  <config.icon className={`w-4 h-4 mr-3 ${
                    config.color === 'red' ? 'text-red-400' :
                    config.color === 'yellow' ? 'text-yellow-400' :
                    config.color === 'cyan' ? 'text-cyan-400' : 'text-green-400'
                  }`} />
                  <div>
                    <span className="text-white font-semibold">{config.label}: </span>
                    <span className={`font-bold ${
                      config.color === 'red' ? 'text-red-400' :
                      config.color === 'yellow' ? 'text-yellow-400' :
                      config.color === 'cyan' ? 'text-cyan-400' : 'text-green-400'
                    }`}>
                      {metric.value}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(metric.timestamp!).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Status */}
      <div className="text-xs text-gray-400 text-center">
        Real-time data sync active • Updates every 3 seconds
      </div>
    </div>
  );
}