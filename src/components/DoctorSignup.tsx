import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerDoctor, fetchClinics } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

interface DoctorSignupProps {
  onSuccess: (token: string, doctor: any) => void;
  onSwitchToLogin: () => void;
}

export default function DoctorSignup({ onSuccess, onSwitchToLogin }: DoctorSignupProps) {
  const [formData, setFormData] = useState({
    doctor_id: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    clinic_id: "",
    region: "",
    phone: ""
  });
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const { toast } = useToast();

  // Load clinics on component mount
  useEffect(() => {
    const loadClinics = async () => {
      try {
        const clinicData = await fetchClinics();
        setClinics(clinicData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load clinics",
          variant: "destructive"
        });
      } finally {
        setLoadingClinics(false);
      }
    };
    loadClinics();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await registerDoctor(signupData);
      
      sessionStorage.setItem('jwt', result.token);
      sessionStorage.setItem('doctor', JSON.stringify(result.doctor));
      
      toast({
        title: "Success",
        description: "Doctor account created successfully!"
      });
      
      onSuccess(result.token, result.doctor);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create doctor account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Doctor Signup</CardTitle>
        <CardDescription>
          Create your doctor account to access the healthcare portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="doctor_id">Doctor ID</Label>
              <Input
                id="doctor_id"
                type="text"
                value={formData.doctor_id}
                onChange={(e) => handleInputChange("doctor_id", e.target.value)}
                required
                placeholder="e.g., DOC001"
              />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Dr. John Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              placeholder="doctor@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                type="text"
                value={formData.specialty}
                onChange={(e) => handleInputChange("specialty", e.target.value)}
                placeholder="e.g., General Medicine"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your region" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="clinic_id">Clinic</Label>
            <Select 
              value={formData.clinic_id} 
              onValueChange={(value) => handleInputChange("clinic_id", value)}
              disabled={loadingClinics}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClinics ? "Loading clinics..." : "Select your clinic"} />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.clinic_id} value={clinic.clinic_id}>
                    {clinic.name} - {clinic.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              className="text-sm"
            >
              Already have an account? Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
