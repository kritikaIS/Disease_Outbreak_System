import DashboardStats from "@/components/DashboardStats";
import OutbreakMap from "@/components/OutbreakMap";
import SymptomChart from "@/components/SymptomChart";
import SymptomReportForm from "@/components/SymptomReportForm";
import LoginModal from "@/components/LoginModal";
import RealtimeDashboard from "@/components/RealtimeDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users, FileText, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <main className="container py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className="text-success border-success/30">
            <div className="status-indicator status-safe mr-2"></div>
            Live Monitoring Active
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Disease Outbreak Monitoring System
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Real-time disease surveillance and outbreak detection to protect public health. 
          Monitor symptoms, track patterns, and respond to emerging health threats.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <LoginModal>
            <Button size="lg" className="gap-2">
              <Shield className="w-5 h-5" />
              Clinical Access
            </Button>
          </LoginModal>
          <Button variant="secondary" size="lg" className="gap-2" onClick={() => navigate('/public-auth')}>
            Public Login
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <FileText className="w-5 h-5" />
            View Public Reports
          </Button>
        </div>
      </section>

      {/* Real-time Dashboard */}
      <section>
        <RealtimeDashboard refreshInterval={30000} />
      </section>

      {/* Charts and Map */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <SymptomChart />
        </div>
        <div>
          <OutbreakMap />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card text-center">
          <div className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Report Symptoms</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Help track disease patterns by reporting symptoms in your area
            </p>
            <LoginModal>
              <Button variant="outline" className="w-full">
                Submit Report
              </Button>
            </LoginModal>
          </div>
        </Card>

        <Card className="medical-card text-center">
          <div className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mb-4">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">View Trends</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze disease patterns and outbreak predictions
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/trends')}>
              View Analytics
            </Button>
          </div>
        </Card>

        <Card className="medical-card text-center">
          <div className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg mb-4">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Healthcare Portal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Professional tools for clinics and healthcare providers
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/portal')}>
              Healthcare Portal
            </Button>
          </div>
        </Card>
      </section>

      {/* Symptom Reporting Form */}
      <section>
        <SymptomReportForm />
      </section>

      {/* Information Notice */}
      <section className="bg-muted/50 rounded-lg p-6 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Secure & Confidential</h3>
            <p className="text-sm text-muted-foreground">
              All health data is encrypted and anonymized. Clinical access requires professional 
              verification. Full functionality includes authentication, secure data storage, and real-time monitoring capabilities.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
