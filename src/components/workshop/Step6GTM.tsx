import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { callGemini } from "@/lib/workshop-store";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Step6Props {
  data: any;
  icpData: any;
  valuePropData: any;
  onboardingData: any;
  onSave: (data: any) => void;
  onNext: () => void;
}

export function Step6GTM({ data, icpData, valuePropData, onboardingData, onSave, onNext }: Step6Props) {
  const [result, setResult] = useState<any>(data?.result || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeModule, setActiveModule] = useState(0);
  const { toast } = useToast();

  const offer = icpData?.offer || "";
  const icps = icpData?.result || [];
  const vps = valuePropData?.result || [];
  const industry = onboardingData?.industry || "";

  const generate = async () => {
    setError("");
    setLoading(true);
    setResult(null);

    const icpDetail = icps.map((icp: any, i: number) =>
      `ICP ${i + 1}: ${icp.name}. Pain Points: ${(icp.painPoints || []).join(", ")}. Goals: ${Array.isArray(icp.goalsDesires) ? icp.goalsDesires.join(", ") : (icp.goalsDesires || "")}`
    ).join("\n");

    const vpDetail = vps.map((vp: any, i: number) =>
      `ICP ${i + 1}: ${vp.icpName || vp.corePromise}. Method: ${vp.corePromise || vp.yourMethod}`
    ).join("\n");

    const prompt = `You are an expert GTM Strategist. Generate a HIGHLY DETAILED, ACTIONABLE Go-To-Market strategy.

Inputs:
- Core Offer: ${offer}
- Industry: ${industry}
- ICPs:
${icpDetail}
- Value Props:
${vpDetail}

Return a JSON object with these 4 sections:

1. "channels": Array of objects for primary channels. Each: { "name": string, "effort": "Low"|"Medium"|"High", "roi": "Low"|"Medium"|"High", "useCase": string, "startHere": boolean (true for top 1-2), "tips": [3 strings] }

2. "timeline": Array of 3 objects for execution phases. Each: { "phase": string (e.g. "Week 1-2"), "title": string, "tasks": [array of strings] }

3. "partners": { "types": [{ "type": string, "angle": string, "offer": string, "snippet": string }] }

4. "leadMagnets": [{ "name": string, "type": "Audit"|"Report"|"Workshop", "targetICP": string, "description": string, "format": string }]

Rules:
- Use "LinkedIn Connection Request", "LinkedIn DM", "Cold Email" terminology.
- Short sentences. Scannable. No jargon.
- Return ONLY valid JSON (no markdown, no code blocks).`;

    try {
      const timeoutP = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 60000));
      const raw = await Promise.race([callGemini(prompt), timeoutP]) as string;
      let parsed;
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match ? match[0] : raw);
      } catch {
        setError("Failed to parse. Try again.");
        setLoading(false);
        return;
      }
      setResult(parsed);
      onSave({ result: parsed });
      toast({ title: "✓ Saved", duration: 3000 });
    } catch (e: any) {
      setError(e.message === "timeout" ? "This is taking too long. Please try again." : (e.message || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  const modules = ["Channels", "Timeline", "Partners", "Lead Magnets"];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Your <span className="accent-text">GTM Strategy</span></h2>
      <p className="text-muted-foreground mb-8 text-sm">A complete, actionable go-to-market plan</p>

      {!loading && !result && (
        <Button onClick={generate} className="accent-bg hover:opacity-90 w-full h-11 font-semibold">
          Generate GTM Strategy
        </Button>
      )}

      {loading && <LoadingSpinner text="Generating your GTM strategy..." />}
      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Module Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto">
            {modules.map((m, idx) => (
              <button
                key={m}
                onClick={() => setActiveModule(idx)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeModule === idx ? "accent-bg" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Channels */}
          {activeModule === 0 && result.channels && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.channels.map((ch: any, i: number) => (
                <div key={i} className={`glass-card p-5 ${ch.startHere ? "border-primary" : ""}`}>
                  {ch.startHere && (
                    <span className="text-[10px] font-bold accent-bg px-2 py-0.5 rounded mb-2 inline-block">START HERE</span>
                  )}
                  <h4 className="font-semibold text-sm mb-2">{ch.name}</h4>
                  <div className="flex gap-3 mb-3">
                    <span className="text-xs text-muted-foreground">Effort: <span className="text-foreground">{ch.effort}</span></span>
                    <span className="text-xs text-muted-foreground">ROI: <span className="text-foreground">{ch.roi}</span></span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{ch.useCase}</p>
                  {ch.tips && (
                    <ul className="space-y-1">
                      {ch.tips.map((t: string, j: number) => (
                        <li key={j} className="text-xs text-muted-foreground">→ {t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {activeModule === 1 && result.timeline && (
            <div className="space-y-4">
              {result.timeline.map((phase: any, i: number) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold accent-bg">{i + 1}</span>
                    <div>
                      <span className="text-xs text-primary font-medium">{phase.phase}</span>
                      <h4 className="font-semibold text-sm">{phase.title}</h4>
                    </div>
                  </div>
                  <ul className="space-y-1.5 ml-11">
                    {phase.tasks?.map((task: string, j: number) => (
                      <li key={j} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-muted-foreground/50">•</span>{task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Partners */}
          {activeModule === 2 && result.partners?.types && (
            <div className="space-y-3">
              {result.partners.types.map((p: any, i: number) => (
                <div key={i} className="glass-card p-5">
                  <h4 className="font-semibold text-sm mb-1">{p.type}</h4>
                  <div className="space-y-2 mt-3">
                    <div><span className="text-xs text-muted-foreground">Angle:</span> <span className="text-sm">{p.angle}</span></div>
                    <div><span className="text-xs text-muted-foreground">Offer:</span> <span className="text-sm">{p.offer}</span></div>
                    {p.snippet && (
                      <div className="bg-secondary p-3 rounded-md mt-2">
                        <span className="text-xs text-muted-foreground">Copy snippet:</span>
                        <p className="text-sm mt-1 italic">"{p.snippet}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lead Magnets */}
          {activeModule === 3 && result.leadMagnets && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.leadMagnets.map((lm: any, i: number) => (
                <div key={i} className="glass-card p-5">
                  <span className="text-[10px] font-medium text-primary uppercase">{lm.type || lm.format}</span>
                  <h4 className="font-semibold text-sm mt-1 mb-2">{lm.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{lm.description || lm.whatItDoes}</p>
                  <span className="text-xs text-muted-foreground">{lm.targetICP}</span>
                </div>
              ))}
            </div>
          )}

          <Button onClick={generate} variant="ghost" className="w-full mt-6 text-muted-foreground">Regenerate</Button>
        </motion.div>
      )}

      {result && (
        <div className="mt-8 flex justify-end">
          <Button onClick={() => { onSave({ result }); onNext(); }} className="accent-bg hover:opacity-90 h-12 px-8 font-semibold">
            Next Step →
          </Button>
        </div>
      )}
    </motion.div>
  );
}
