import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";

interface OutbreakData {
  outbreak_id: string;
  region: string;
  status: string;
  description: string;
  symptoms: Array<{
    symptom_id: string;
    name: string;
    cases_count: number;
    is_threshold_exceeded: boolean;
  }>;
  start_date: string;
}

interface RegionData {
  region: string;
  outbreaks: number;
  activeOutbreaks: number;
  totalCases: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

const OutbreakMap = () => {
  const [outbreaks, setOutbreaks] = useState<OutbreakData[]>([]);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/outbreaks/public/recent?limit=10');
      const data = await response.json();
      
      if (data.status === 'success') {
        setOutbreaks(data.data.outbreaks);
        
        // Process region data
        const regionMap = new Map<string, RegionData>();
        
        data.data.outbreaks.forEach((outbreak: OutbreakData) => {
          const region = outbreak.region;
          const totalCases = outbreak.symptoms.reduce((sum, s) => sum + s.cases_count, 0);
          const hasActiveOutbreak = outbreak.status === 'Active';
          const hasThresholdExceeded = outbreak.symptoms.some(s => s.is_threshold_exceeded);
          
          if (!regionMap.has(region)) {
            regionMap.set(region, {
              region,
              outbreaks: 0,
              activeOutbreaks: 0,
              totalCases: 0,
              severity: 'Low'
            });
          }
          
          const regionInfo = regionMap.get(region)!;
          regionInfo.outbreaks += 1;
          regionInfo.totalCases += totalCases;
          
          if (hasActiveOutbreak) {
            regionInfo.activeOutbreaks += 1;
          }
          
          // Determine severity
          if (hasActiveOutbreak && hasThresholdExceeded) {
            regionInfo.severity = 'Critical';
          } else if (hasActiveOutbreak) {
            regionInfo.severity = 'High';
          } else if (hasThresholdExceeded) {
            regionInfo.severity = 'Medium';
          }
        });
        
        setRegionData(Array.from(regionMap.values()));
        setLastUpdate(new Date());
        setError("");
      }
    } catch (err) {
      setError("Failed to load outbreak data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  return (
    <Card className="medical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Regional Outbreak Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Live Monitoring
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Interactive Map Placeholder */}
        <div className="relative mb-6">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-green-50 h-64">
            {/* Map Grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-6 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>
            
            {/* Region Markers */}
            {regionData.map((region, index) => {
              const positions = [
                { top: '20%', left: '15%' }, // Delhi
                { top: '30%', left: '25%' }, // Maharashtra
                { top: '40%', left: '20%' }, // Karnataka
                { top: '50%', left: '30%' }, // Tamil Nadu
                { top: '60%', left: '25%' }, // West Bengal
                { top: '25%', left: '35%' }, // Gujarat
                { top: '35%', left: '40%' }, // Rajasthan
                { top: '45%', left: '45%' }, // Uttar Pradesh
              ];
              
              const position = positions[index % positions.length];
              
              return (
                <div
                  key={region.region}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={position}
                >
                  <div className="relative">
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                      region.severity === 'Critical' ? 'bg-red-500' :
                      region.severity === 'High' ? 'bg-orange-500' :
                      region.severity === 'Medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      {region.activeOutbreaks > 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                      {region.region}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Map Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Interactive Regional Map</p>
                <p className="text-xs text-gray-500">Hover over markers for details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Region Statistics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Regional Statistics
          </h4>
          
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          
          {!loading && !error && regionData.length === 0 && (
            <div className="text-center py-4">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No outbreak data available</p>
            </div>
          )}
          
          {!loading && !error && regionData.map((region) => (
            <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  region.severity === 'Critical' ? 'bg-red-500' :
                  region.severity === 'High' ? 'bg-orange-500' :
                  region.severity === 'Medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{region.region}</p>
                  <p className="text-xs text-gray-500">
                    {region.outbreaks} outbreak{region.outbreaks !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{region.totalCases} cases</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(region.severity)} className="text-xs">
                    {region.severity}
                  </Badge>
                  {region.activeOutbreaks > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {region.activeOutbreaks} Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Outbreaks */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Recent Outbreak Reports
          </h4>
          
          {outbreaks.slice(0, 3).map((outbreak) => {
            const totalCases = outbreak.symptoms.reduce((sum, s) => sum + s.cases_count, 0);
            const hasThresholdExceeded = outbreak.symptoms.some(s => s.is_threshold_exceeded);
            
            return (
              <div key={outbreak.outbreak_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    outbreak.status === 'Active' ? 'bg-red-500' :
                    outbreak.status === 'Investigation' ? 'bg-orange-500' :
                    outbreak.status === 'Contained' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{outbreak.region}</p>
                    <p className="text-xs text-gray-500">{outbreak.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{totalCases} cases</p>
                  <Badge variant={getStatusColor(outbreak.status)} className="text-xs">
                    {outbreak.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OutbreakMap;
