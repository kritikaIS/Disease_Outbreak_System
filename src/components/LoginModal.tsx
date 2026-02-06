import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Building2 } from "lucide-react";
import { loginDoctor } from "@/lib/api";

interface LoginModalProps {
  children: React.ReactNode;
}

const LoginModal = ({ children }: LoginModalProps) => {
  const [clinicData, setClinicData] = useState({
    email: '',
    password: '',
    clinicName: '',
    licenseNumber: ''
  });

  const [publicData, setPublicData] = useState({
    email: '',
    password: ''
  });

  const handleClinicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await loginDoctor({ email: clinicData.email, password: clinicData.password });
      sessionStorage.setItem('jwt', token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      alert(err?.message || 'Login failed');
    }
  };

  const handlePublicLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Public login not required. Use the form to submit anonymously.");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Access
          </DialogTitle>
        </DialogHeader>

        {/* No pre-auth notice */}

        <Tabs defaultValue="clinic" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="clinic" className="gap-2">
              <Building2 className="w-4 h-4" />
              Clinic Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="space-y-4">
            <div className="text-center mb-4">
              <Badge variant="outline" className="gap-2">
                <Shield className="w-3 h-3" />
                Healthcare Professional Access
              </Badge>
            </div>
            
            <form onSubmit={handleClinicLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicEmail">Professional Email</Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={clinicData.email}
                  onChange={(e) => setClinicData({...clinicData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicPassword">Password</Label>
                <Input
                  id="clinicPassword"
                  type="password"
                  value={clinicData.password}
                  onChange={(e) => setClinicData({...clinicData, password: e.target.value})}
                  required
                />
              </div>

              {/* Removed extra fields to simplify login: clinic name and license */}

              <Button type="submit" className="w-full gap-2">
                <Building2 className="w-4 h-4" />
                Access Clinical Dashboard
              </Button>
            </form>
          </TabsContent>

          {/* Public access removed; public reports are anonymous via the form */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
