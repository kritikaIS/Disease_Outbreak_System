import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";

const mockStats = [
  {
    title: "Active Outbreaks",
    value: "3",
    change: "+2 from last week",
    trend: "up",
    status: "danger",
    icon: AlertTriangle
  },
  {
    title: "Monitored Regions",
    value: "47",
    change: "All systems active",
    trend: "stable",
    status: "safe",
    icon: Shield
  },
  {
    title: "Weekly Reports",
    value: "1,247",
    change: "+15% vs last week",
    trend: "up",
    status: "safe",
    icon: TrendingUp
  },
  {
    title: "Recovery Rate",
    value: "94.2%",
    change: "+2.1% improvement",
    trend: "up",
    status: "safe",
    icon: TrendingUp
  }
];

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="medical-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                <div className="flex items-center gap-2 mt-2">
                  {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-success" />}
                  {stat.trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
                  <p className="text-sm text-muted-foreground">{stat.change}</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.status === 'danger' ? 'bg-destructive/10' : 
                stat.status === 'warning' ? 'bg-warning/10' : 'bg-success/10'
              }`}>
                <Icon className={`w-6 h-6 ${
                  stat.status === 'danger' ? 'text-destructive' : 
                  stat.status === 'warning' ? 'text-warning' : 'text-success'
                }`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
