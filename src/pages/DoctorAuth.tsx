import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorLogin from "@/components/DoctorLogin";
import DoctorSignup from "@/components/DoctorSignup";

interface DoctorAuthProps {
  onSuccess: (token: string, doctor: any) => void;
}

export default function DoctorAuth({ onSuccess }: DoctorAuthProps) {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Healthcare Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your doctor account to manage patient reports
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <DoctorLogin 
              onSuccess={onSuccess}
              onSwitchToSignup={() => setActiveTab("signup")}
            />
          </TabsContent>
          
          <TabsContent value="signup">
            <DoctorSignup 
              onSuccess={onSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
