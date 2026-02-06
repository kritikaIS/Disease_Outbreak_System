import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  AlertTriangle, 
  X, 
  Clock, 
  MapPin, 
  Activity,
  CheckCircle,
  Info
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'outbreak' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  region?: string;
  outbreakId?: string;
  read: boolean;
}

interface NotificationSystemProps {
  refreshInterval?: number;
}

export default function NotificationSystem({ refreshInterval = 10000 }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const fetchNotifications = async () => {
    try {
      // Fetch recent outbreaks
      const response = await fetch('http://localhost:5001/api/outbreaks/public/recent?limit=3');
      const data = await response.json();
      
      if (data.status === 'success') {
        const newNotifications: Notification[] = data.data.outbreaks.map((outbreak: any) => ({
          id: outbreak.outbreak_id,
          type: outbreak.status === 'Active' ? 'outbreak' : 'alert',
          title: `Outbreak ${outbreak.status === 'Active' ? 'Detected' : 'Update'}`,
          message: outbreak.description,
          timestamp: new Date(outbreak.start_date),
          severity: outbreak.status === 'Active' ? 'Critical' : 'High',
          region: outbreak.region,
          outbreakId: outbreak.outbreak_id,
          read: false
        }));
        
        // Add system notifications
        const systemNotifications: Notification[] = [
          {
            id: 'system-1',
            type: 'info',
            title: 'System Status',
            message: 'Outbreak monitoring system is running normally',
            timestamp: new Date(),
            severity: 'Low',
            read: false
          }
        ];
        
        setNotifications([...newNotifications, ...systemNotifications]);
        setUnreadCount(newNotifications.length + systemNotifications.length);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'outbreak': return <AlertTriangle className="w-4 h-4" />;
      case 'alert': return <Bell className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
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

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 max-h-96 overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last checked: {lastCheck.toLocaleTimeString()}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-1 rounded ${
                          notification.type === 'outbreak' ? 'bg-red-100 text-red-600' :
                          notification.type === 'alert' ? 'bg-orange-100 text-orange-600' :
                          notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <Badge variant={getSeverityColor(notification.severity)} className="text-xs">
                              {notification.severity}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                            </div>
                            {notification.region && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{notification.region}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
