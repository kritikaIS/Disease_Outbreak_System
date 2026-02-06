import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, LogIn, Shield, User } from "lucide-react";
import LoginModal from "./LoginModal";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MedWatch</h1>
            <p className="text-xs text-muted-foreground">Disease Outbreak Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-success border-success/30">
            <div className="status-indicator status-safe mr-2"></div>
            Systems Online
          </Badge>
          
          <Link to="/doctor-auth">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              Doctor Portal
            </Button>
          </Link>
          
          <LoginModal>
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="w-4 h-4" />
              Clinic Login
            </Button>
          </LoginModal>
          
          <LoginModal>
            <Button variant="ghost" size="sm" className="gap-2">
              <LogIn className="w-4 h-4" />
              Public Access
            </Button>
          </LoginModal>
        </div>
      </div>
    </header>
  );
};

export default Header;
