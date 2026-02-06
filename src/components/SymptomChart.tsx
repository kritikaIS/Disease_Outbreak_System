import { Card } from "@/components/ui/card";

const symptomData = [
  { name: 'Fever', current: 340, previous: 280, severity: 'high' },
  { name: 'Cough', current: 520, previous: 450, severity: 'medium' },
  { name: 'Fatigue', current: 280, previous: 320, severity: 'low' },
  { name: 'Headache', current: 190, previous: 180, severity: 'medium' },
  { name: 'Nausea', current: 150, previous: 200, severity: 'low' },
  { name: 'Sore Throat', current: 410, previous: 380, severity: 'medium' }
];

const trendData = [45, 78, 125, 89, 156, 203, 178];

const SymptomChart = () => {
  const maxValue = Math.max(...symptomData.map(item => Math.max(item.current, item.previous)));
  const maxTrend = Math.max(...trendData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="medical-card">
        <h3 className="text-xl font-semibold mb-6">Symptom Distribution</h3>
        <div className="space-y-4">
          {symptomData.map((symptom, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{symptom.name}</span>
                <span className="text-muted-foreground">{symptom.current} cases</span>
              </div>
              <div className="flex gap-2 h-6">
                <div className="flex-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(symptom.current / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="flex-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-muted-foreground/50 rounded-full transition-all duration-500"
                    style={{ width: `${(symptom.previous / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current: {symptom.current}</span>
                <span>Previous: {symptom.previous}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="medical-card">
        <h3 className="text-xl font-semibold mb-6">7-Day Trend</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-end h-48 gap-2">
            {trendData.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 flex items-end">
                  <div 
                    className="w-full bg-success rounded-t transition-all duration-700 min-h-[4px]"
                    style={{ height: `${(value / maxTrend) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">W{index + 1}</span>
                <span className="text-xs font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SymptomChart;
