import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Send, MapPin } from "lucide-react";
import { submitPublicReport } from "@/lib/api";

const SymptomReportForm = () => {
  const [formData, setFormData] = useState({
    symptoms: '',
    symptomType: '',
    location: '',
    severity: '',
    patientAge: '',
    additionalNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const publicToken = typeof window !== 'undefined' ? localStorage.getItem('public_jwt') : null;
      await submitPublicReport({
        report_id: `PUB-${Date.now()}`,
        symptoms_text: formData.symptoms,
        state: formData.location,
        symptom_type: formData.symptomType,
        severity: formData.severity,
        patient_age: formData.patientAge,
        additional_notes: formData.additionalNotes,
        // @ts-ignore - allowed extra field; backend ignores if null
        public_user_token: publicToken || undefined,
      });
      alert("Symptom report submitted successfully!");
      setFormData({
        symptoms: '',
        symptomType: '',
        location: '',
        severity: '',
        patientAge: '',
        additionalNotes: ''
      });
    } catch (err: any) {
      alert(err?.message || "Failed to submit report");
    }
  };

  return (
    <Card className="medical-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <AlertCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Report Symptoms</h3>
          <p className="text-sm text-muted-foreground">Help us track disease patterns in your area</p>
        </div>
      </div>

      {/* Authentication notice removed */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symptoms">Primary Symptoms</Label>
            <Input
              id="symptoms"
              placeholder="e.g., fever, cough, headache"
              value={formData.symptoms}
              onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptomType">Symptom Category</Label>
            <Select value={formData.symptomType} onValueChange={(value) => setFormData({...formData, symptomType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="respiratory">Respiratory</SelectItem>
                <SelectItem value="gastrointestinal">Gastrointestinal</SelectItem>
                <SelectItem value="neurological">Neurological</SelectItem>
                <SelectItem value="dermatological">Dermatological</SelectItem>
                <SelectItem value="systemic">Systemic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">State (India)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Maharashtra, Karnataka, Delhi"
                className="pl-10"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">
                  <div className="flex items-center gap-2">
                    <div className="status-indicator status-safe"></div>
                    Mild
                  </div>
                </SelectItem>
                <SelectItem value="moderate">
                  <div className="flex items-center gap-2">
                    <div className="status-indicator status-warning"></div>
                    Moderate
                  </div>
                </SelectItem>
                <SelectItem value="severe">
                  <div className="flex items-center gap-2">
                    <div className="status-indicator status-danger"></div>
                    Severe
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientAge">Patient Age Range</Label>
          <Select value={formData.patientAge} onValueChange={(value) => setFormData({...formData, patientAge: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-5">0-5 years</SelectItem>
              <SelectItem value="6-12">6-12 years</SelectItem>
              <SelectItem value="13-17">13-17 years</SelectItem>
              <SelectItem value="18-30">18-30 years</SelectItem>
              <SelectItem value="31-50">31-50 years</SelectItem>
              <SelectItem value="51-70">51-70 years</SelectItem>
              <SelectItem value="70+">70+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any additional observations, onset date, exposure history, etc."
            rows={4}
            value={formData.additionalNotes}
            onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="gap-2">
            <Send className="w-4 h-4" />
            Submit Report
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            Secure & Anonymous
          </Badge>
        </div>
      </form>
    </Card>
  );
};

export default SymptomReportForm;
