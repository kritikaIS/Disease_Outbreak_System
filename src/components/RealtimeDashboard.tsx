import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NotificationSystem from './NotificationSystem';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Bell,
  Eye
} from 'lucide-react';

interface OutbreakStats {
  totalOutbreaks: number;
  activeOutbreaks: number;
  totalReports: number;
  totalClusters: number;
  lastUpdate: string;
}

interface OutbreakAlert {
  outbreak_id: string;
  region: string;
  status: string;
  description: string;
  symptoms: string[];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
}

interface RealtimeDashboardProps {
  refreshInterval?: number; // in milliseconds
}

export default function RealtimeDashboard({ refreshInterval = 30000 }: RealtimeDashboardProps) {
  const [stats, setStats] = useState<OutbreakStats | null>(null);
  const [recentOutbreaks, setRecentOutbreaks] = useState<OutbreakAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch outbreak statistics from public endpoint
      const statsResponse = await fetch('http://localhost:5001/api/outbreaks/public/stats');
      const statsData = await statsResponse.json();
      
      // Fetch recent outbreaks from public endpoint
      const outbreaksResponse = await fetch('http://localhost:5001/api/outbreaks/public/recent?limit=5');
      const outbreaksData = await outbreaksResponse.json();
      
      if (statsData.status === 'success') {
        setStats({
          totalOutbreaks: statsData.data.totalOutbreaks,
          activeOutbreaks: statsData.data.activeOutbreaks,
          totalReports: statsData.data.totalReports || 0,
          totalClusters: 0, // We'll get this from analysis
          lastUpdate: statsData.data.lastUpdate || new Date().toISOString()
        });
      }
      
      if (outbreaksData.status === 'success') {
        const alerts: OutbreakAlert[] = outbreaksData.data.outbreaks.map((outbreak: any) => ({
          outbreak_id: outbreak.outbreak_id,
          region: outbreak.region,
          status: outbreak.status,
          description: outbreak.description,
          symptoms: outbreak.symptoms.map((s: any) => s.name || s.symptom_id),
          severity: getSeverityFromStatus(outbreak.status),
          timestamp: outbreak.start_date
        }));
        setRecentOutbreaks(alerts);
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityFromStatus = (status: string): 'Low' | 'Medium' | 'High' | 'Critical' => {
    switch (status) {
      case 'Active': return 'Critical';
      case 'Investigation': return 'High';
      case 'Contained': return 'Medium';
      case 'Resolved': return 'Low';
      default: return 'Medium';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'destructive';
      case 'Investigation': return 'default';
      case 'Contained': return 'secondary';
      case 'Resolved': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-600" />
            Live Outbreak Monitor
          </h2>
          <p className="text-gray-600">Real-time disease outbreak tracking and alerts</p>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationSystem refreshInterval={15000} />
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600">Active Outbreaks</p>
                  <p className="text-2xl font-bold text-red-900">{stats.activeOutbreaks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Total Outbreaks</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.totalOutbreaks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Reports</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalReports || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Clusters</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalClusters || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Outbreak Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600" />
            Recent Outbreak Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOutbreaks.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent outbreaks detected</p>
              <p className="text-sm text-gray-500 mt-2">System is monitoring for new outbreaks...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOutbreaks.map((outbreak) => (
                <Alert key={outbreak.outbreak_id} className="border-l-4 border-l-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-red-900">{outbreak.outbreak_id}</h4>
                          <Badge variant={getSeverityColor(outbreak.severity)}>
                            {outbreak.severity}
                          </Badge>
                          <Badge variant={getStatusColor(outbreak.status)}>
                            {outbreak.status}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{outbreak.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{outbreak.region}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(outbreak.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            <span>{outbreak.symptoms.length} symptoms</span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600 mb-1">Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {outbreak.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="ml-4">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regional Activity Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Regional Activity Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-600">
              Real-time visualization of outbreak locations and regional statistics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Run Full Analysis
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              View Detailed Reports
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alert Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
