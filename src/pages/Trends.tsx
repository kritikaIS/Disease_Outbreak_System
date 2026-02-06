import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchOutbreaks, fetchSymptoms, Outbreak, Symptom } from "@/lib/api";

const Trends = () => {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    const load = () => {
      Promise.all([fetchOutbreaks({ limit: 10 }), fetchSymptoms({ limit: 10 })])
        .then(([o, s]) => {
          if (!mounted) return;
          setOutbreaks(o);
          setSymptoms(s);
        })
        .catch(() => {});
    };

    load();
    timer = window.setInterval(load, 20000);
    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="container py-8 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Outbreak Trends (Recent)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outbreaks.map((o) => (
            <Card key={o.outbreak_id} className="p-4">
              <div className="text-sm text-muted-foreground">{o.region}</div>
              <div className="font-semibold">{o.description || o.outbreak_id}</div>
              <div className="text-xs mt-2">Status: {o.status}</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Symptom Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {symptoms.map((s) => (
            <Card key={s.symptom_id} className="p-4">
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm text-muted-foreground">{s.severity}</div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Trends;
