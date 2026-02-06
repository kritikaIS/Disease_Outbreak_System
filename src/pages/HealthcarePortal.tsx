import { Card } from "@/components/ui/card";

const HealthcarePortal = () => {
  return (
    <main className="container py-8 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Healthcare Portal</h2>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Doctor tools will appear here (create/edit outbreaks, run analysis, view reports).</div>
        </Card>
      </section>
    </main>
  );
};

export default HealthcarePortal;
