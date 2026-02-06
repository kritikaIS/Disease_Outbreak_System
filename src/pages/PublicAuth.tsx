import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { publicLogin, publicRegister } from "@/lib/api";

const PublicAuth = () => {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { token } = await publicLogin(login);
    localStorage.setItem('public_jwt', token);
    window.location.href = '/public';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { token } = await publicRegister(signup);
    localStorage.setItem('public_jwt', token);
    window.location.href = '/public';
  };

  return (
    <main className="container py-8">
      <Card className="p-6 max-w-md mx-auto">
        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={signup.name} onChange={e => setSignup({ ...signup, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={signup.email} onChange={e => setSignup({ ...signup, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={signup.password} onChange={e => setSignup({ ...signup, password: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
};

export default PublicAuth;
