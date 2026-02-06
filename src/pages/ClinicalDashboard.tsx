import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchOutbreaks, Outbreak, fetchSymptoms, Symptom } from "@/lib/api";

const ClinicalDashboard = () => {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    const load = () => {
      Promise.all([
        fetchOutbreaks({ limit: 20 }),
        fetchSymptoms({ limit: 50 })
      ])
        .then(([o, s]) => {
          if (!mounted) return;
          setOutbreaks(o);
          setSymptoms(s);
        })
        .finally(() => mounted && setLoading(false));
    };

    load();
    timer = window.setInterval(load, 20000);

    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  if (loading) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <main className="container py-8 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Outbreaks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outbreaks.map((o) => (
            <Card key={o.outbreak_id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{o.region}</div>
                  <div className="text-lg font-semibold">{o.outbreak_id}</div>
                </div>
                <Badge variant={o.status === 'Active' ? 'destructive' : 'secondary'}>{o.status}</Badge>
              </div>
              <div className="text-sm mt-2 line-clamp-3">{o.description || '—'}</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Symptoms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {symptoms.map((s) => (
            <Card key={s.symptom_id} className="p-4">
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm text-muted-foreground">{s.symptom_id} · {s.severity}</div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ClinicalDashboard;


