import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchMyPublicReports } from "@/lib/api";
import { Navigate } from "react-router-dom";

const PublicDashboard = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('public_jwt') : null;
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    if (token) {
      fetchMyPublicReports(token).then(r => { if (mounted) setReports(r); });
    }
    return () => { mounted = false; };
  }, [token]);

  if (!token) return <Navigate to="/public-auth" replace />;

  return (
    <main className="container py-8">
      <h2 className="text-2xl font-semibold mb-4">My Submissions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r) => (
          <Card key={r.report_id} className="p-4">
            <div className="text-sm text-muted-foreground">{r.state}</div>
            <div className="font-semibold">{r.symptoms_text}</div>
            <div className="text-xs mt-2">Severity: {r.severity || '—'}</div>
          </Card>
        ))}
        {reports.length === 0 && <div className="text-sm text-muted-foreground">No submissions yet.</div>}
      </div>
    </main>
  );
};

export default PublicDashboard;

