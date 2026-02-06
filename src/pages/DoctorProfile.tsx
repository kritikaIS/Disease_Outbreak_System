import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchSymptoms, Symptom, createPatient, createReport, fetchDoctorReports } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import OutbreakAnalysis from "@/components/OutbreakAnalysis";

interface DoctorProfileProps {
  doctor: any;
  token: string;
}

export default function DoctorProfile({ doctor, token }: DoctorProfileProps) {
  const [activeTab, setActiveTab] = useState("submit-report");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const { toast } = useToast();

  const [patientForm, setPatientForm] = useState({
    patient_id: "",
    name: "",
    dob: "",
    gender: "",
    address: "",
    phone: ""
  });

  const [reportForm, setReportForm] = useState({
    report_id: "",
    patient_id: "",
    selectedSymptoms: [] as string[],
    customSymptoms: "",
    onsetDates: {} as Record<string, string>,
    durations: {} as Record<string, string>
  });

  useEffect(() => {
    loadSymptoms();
    loadReports();
  }, []);

  const loadSymptoms = async () => {
    try {
      const symptomData = await fetchSymptoms({ limit: 100 });
      setSymptoms(symptomData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load symptoms",
        variant: "destructive"
      });
    }
  };

  const loadReports = async () => {
    try {
      const reportData = await fetchDoctorReports(doctor.doctor_id, token);
      setReports(reportData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    }
  };

  const handlePatientFormChange = (field: string, value: string) => {
    setPatientForm(prev => ({ ...prev, [field]: value }));
  };

  const handleReportFormChange = (field: string, value: any) => {
    setReportForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (symptomId: string) => {
    setReportForm(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter(id => id !== symptomId)
        : [...prev.selectedSymptoms, symptomId]
    }));
  };

  const handleOnsetDateChange = (symptomId: string, date: string) => {
    setReportForm(prev => ({
      ...prev,
      onsetDates: { ...prev.onsetDates, [symptomId]: date }
    }));
  };

  const handleDurationChange = (symptomId: string, duration: string) => {
    setReportForm(prev => ({
      ...prev,
      durations: { ...prev.durations, [symptomId]: duration }
    }));
  };

  const generateId = (prefix: string) => {
    return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmitPatient = async () => {
    console.log("Form data before validation:", patientForm); // Debug log
    
    if (!patientForm.name || !patientForm.dob || !patientForm.gender) {
      console.log("Validation failed - missing fields:", {
        name: patientForm.name,
        dob: patientForm.dob,
        gender: patientForm.gender
      }); // Debug log
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Convert date to ISO8601 format (YYYY-MM-DD)
      console.log("Original date:", patientForm.dob); // Debug log
      const dateObj = new Date(patientForm.dob);
      console.log("Date object:", dateObj); // Debug log
      
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }
      const isoDate = dateObj.toISOString().split('T')[0];
      console.log("ISO date:", isoDate); // Debug log
      
      const patientData = {
        patient_id: patientForm.patient_id || generateId("PAT"),
        name: patientForm.name.trim(),
        dob: isoDate,
        gender: patientForm.gender
      };
      
      // Only add optional fields if they have values
      if (patientForm.address && patientForm.address.trim()) {
        patientData.address = patientForm.address.trim();
      }
      if (patientForm.phone && patientForm.phone.trim()) {
        patientData.phone = patientForm.phone.trim();
      }
      
      console.log("Final patient data being sent:", patientData); // Debug log
      
      await createPatient(patientData, token);
      
      toast({
        title: "Success",
        description: "Patient created successfully!"
      });
      
      setPatientForm({
        patient_id: "",
        name: "",
        dob: "",
        gender: "",
        address: "",
        phone: ""
      });
    } catch (error: any) {
      console.error("Patient creation error details:", error); // Debug log
      toast({
        title: "Error",
        description: error.message || "Failed to create patient",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.patient_id || reportForm.selectedSymptoms.length === 0) {
      toast({
        title: "Error",
        description: "Please select a patient and at least one symptom",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const symptomsData = reportForm.selectedSymptoms.map(symptomId => ({
        symptom_id: symptomId,
        onset_date: reportForm.onsetDates[symptomId] || undefined,
        duration: reportForm.durations[symptomId] || undefined
      }));

      const reportData = {
        report_id: reportForm.report_id || generateId("RPT"),
        patient_id: reportForm.patient_id,
        clinic_id: doctor.clinic_id,
        doctor_id: doctor.doctor_id,
        symptoms: symptomsData
      };

      await createReport(reportData, token);
      
      toast({
        title: "Success",
        description: "Report submitted successfully!"
      });
      
      setReportForm({
        report_id: "",
        patient_id: "",
        selectedSymptoms: [],
        customSymptoms: "",
        onsetDates: {},
        durations: {}
      });
      
      setReportFormOpen(false);
      loadReports();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. {doctor.name}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{doctor.specialty}</Badge>
          <Badge variant="secondary">{doctor.region}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit-report">Submit Report</TabsTrigger>
          <TabsTrigger value="report-history">Report History</TabsTrigger>
          <TabsTrigger value="outbreak-analysis">Outbreak Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="submit-report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Patient Report</CardTitle>
              <CardDescription>
                Create a new patient and submit their symptom report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Creation Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient_id">Patient ID (Optional)</Label>
                    <Input
                      id="patient_id"
                      value={patientForm.patient_id}
                      onChange={(e) => handlePatientFormChange("patient_id", e.target.value)}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Patient Name *</Label>
                    <Input
                      id="name"
                      value={patientForm.name}
                      onChange={(e) => handlePatientFormChange("name", e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={patientForm.dob}
                      onChange={(e) => handlePatientFormChange("dob", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={patientForm.gender} onValueChange={(value) => handlePatientFormChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={patientForm.address}
                      onChange={(e) => handlePatientFormChange("address", e.target.value)}
                      placeholder="Patient address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={patientForm.phone}
                      onChange={(e) => handlePatientFormChange("phone", e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmitPatient} disabled={loading}>
                    {loading ? "Creating Patient..." : "Create Patient"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => console.log("Current form state:", patientForm)}
                  >
                    Debug Form
                  </Button>
                </div>
              </div>

              {/* Report Submission Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Symptom Report</h3>
                
                <div>
                  <Label htmlFor="report_patient_id">Patient ID *</Label>
                  <Input
                    id="report_patient_id"
                    value={reportForm.patient_id}
                    onChange={(e) => handleReportFormChange("patient_id", e.target.value)}
                    placeholder="Enter patient ID"
                    required
                  />
                </div>

                <div>
                  <Label>Symptoms *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto border rounded-md p-4">
                    {symptoms.map((symptom) => (
                      <div key={symptom.symptom_id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={symptom.symptom_id}
                          checked={reportForm.selectedSymptoms.includes(symptom.symptom_id)}
                          onChange={() => toggleSymptom(symptom.symptom_id)}
                          className="rounded"
                        />
                        <Label htmlFor={symptom.symptom_id} className="text-sm">
                          {symptom.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Symptom Details */}
                {reportForm.selectedSymptoms.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Symptom Details</h4>
                    {reportForm.selectedSymptoms.map((symptomId) => {
                      const symptom = symptoms.find(s => s.symptom_id === symptomId);
                      return (
                        <div key={symptomId} className="border rounded-md p-4 space-y-2">
                          <h5 className="font-medium">{symptom?.name}</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`onset_${symptomId}`}>Onset Date</Label>
                              <Input
                                id={`onset_${symptomId}`}
                                type="date"
                                value={reportForm.onsetDates[symptomId] || ""}
                                onChange={(e) => handleOnsetDateChange(symptomId, e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`duration_${symptomId}`}>Duration</Label>
                              <Input
                                id={`duration_${symptomId}`}
                                value={reportForm.durations[symptomId] || ""}
                                onChange={(e) => handleDurationChange(symptomId, e.target.value)}
                                placeholder="e.g., 3 days"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <Label htmlFor="custom_symptoms">Additional Notes</Label>
                  <Textarea
                    id="custom_symptoms"
                    value={reportForm.customSymptoms}
                    onChange={(e) => handleReportFormChange("customSymptoms", e.target.value)}
                    placeholder="Any additional symptoms or notes..."
                  />
                </div>

                <Button onClick={handleSubmitReport} disabled={loading || reportForm.selectedSymptoms.length === 0}>
                  {loading ? "Submitting Report..." : "Submit Report"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                View all reports submitted by you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.report_id}>
                      <TableCell className="font-medium">{report.report_id}</TableCell>
                      <TableCell>{report.patient_id?.name || report.patient_id}</TableCell>
                      <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {report.symptoms?.map((symptom: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {symptom.symptom_id?.name || symptom.symptom_id}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Submitted</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outbreak-analysis" className="space-y-6">
          <OutbreakAnalysis token={token} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
