import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Calendar,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';

interface OutbreakAnalysisProps {
  token: string;
}

interface OutbreakData {
  analysisPeriod: {
    startDate: string;
    endDate: string;
    days: number;
  };
  totalReports: number;
  symptomAggregation: any[];
  thresholdAnalysis: any[];
  outbreaks: any[];
  clusters: any[];
  summary: {
    totalOutbreaks: number;
    activeOutbreaks: number;
    totalClusters: number;
  };
}

export default function OutbreakAnalysis({ token }: OutbreakAnalysisProps) {
  const [analysisData, setAnalysisData] = useState<OutbreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisDays, setAnalysisDays] = useState(7);
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const analyzeOutbreaks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        days: analysisDays.toString(),
        ...(selectedRegion && { region: selectedRegion })
      });
      
      const response = await fetch(`http://localhost:5001/api/outbreaks/analyze?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze outbreaks');
      }
      
      const result = await response.json();
      setAnalysisData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    analyzeOutbreaks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Outbreak Analysis</h2>
          <p className="text-gray-600">Monitor and detect potential disease outbreaks</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={analysisDays}
            onChange={(e) => setAnalysisDays(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>Last 3 days</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          
          <Button 
            onClick={analyzeOutbreaks} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="symptoms">Symptom Analysis</TabsTrigger>
            <TabsTrigger value="outbreaks">Outbreaks</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold text-gray-900">{analysisData.totalReports}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Outbreaks</p>
                      <p className="text-2xl font-bold text-gray-900">{analysisData.summary.activeOutbreaks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Outbreaks</p>
                      <p className="text-2xl font-bold text-gray-900">{analysisData.summary.totalOutbreaks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Clusters</p>
                      <p className="text-2xl font-bold text-gray-900">{analysisData.summary.totalClusters}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Analysis Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Start Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(analysisData.analysisPeriod.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">End Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(analysisData.analysisPeriod.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Analysis Days</p>
                    <p className="text-lg font-semibold">{analysisData.analysisPeriod.days}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Symptom Threshold Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.thresholdAnalysis.map((symptom) => (
                    <div key={symptom.symptom_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{symptom.name}</h3>
                        <Badge variant={getSeverityColor(symptom.severity)}>
                          {symptom.severity}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Cases</p>
                          <p className="font-semibold">{symptom.totalCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Max Daily</p>
                          <p className="font-semibold">{symptom.maxDailyCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Threshold</p>
                          <p className="font-semibold">{symptom.threshold}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Exceeded Days</p>
                          <p className="font-semibold">{symptom.thresholdExceededDays}</p>
                        </div>
                      </div>
                      
                      {symptom.isThresholdExceeded && (
                        <Alert className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Threshold exceeded! This symptom shows unusual activity.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outbreaks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detected Outbreaks</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisData.outbreaks.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No outbreaks detected in the analysis period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisData.outbreaks.map((outbreak) => (
                      <div key={outbreak.outbreak_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{outbreak.outbreak_id}</h3>
                          <Badge variant={getStatusColor(outbreak.status)}>
                            {outbreak.status}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{outbreak.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{outbreak.region}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{new Date(outbreak.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-500" />
                            <span>{outbreak.symptoms.length} symptoms</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">Affected Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {outbreak.symptoms.map((symptom) => (
                              <Badge key={symptom.symptom_id} variant="outline">
                                {symptom.name} ({symptom.cases_count})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clusters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Symptom Clusters</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisData.clusters.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No clusters detected in the analysis period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisData.clusters.map((cluster) => (
                      <div key={cluster.cluster_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{cluster.cluster_id}</h3>
                          <Badge variant={getSeverityColor(cluster.severity)}>
                            {cluster.severity} Severity
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{cluster.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{cluster.clinic_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{cluster.patientCount} patients</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {cluster.symptoms.map((symptomId) => (
                              <Badge key={symptomId} variant="secondary">
                                {symptomId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
