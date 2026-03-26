import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { callGemini } from "@/lib/workshop-store";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const ANGLES = ["Authority", "ROI", "Pain-led", "Contrarian", "Curiosity", "Offer-led"];

interface Step7Props {
  data: any;
  icpData: any;
  valuePropData: any;
  profileData: any;
  onboardingData: any;
  onSave: (data: any) => void;
  onNext: () => void;
}

export function Step7Outreach({ data, icpData, valuePropData, profileData, onboardingData, onSave, onNext }: Step7Props) {
  const [angle, setAngle] = useState(data?.angle || "Authority");
  const [result, setResult] = useState<any>(data?.result || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const { toast } = useToast();
  const generationIdRef = useRef(0);

  const offer = icpData?.offer || "";
  const icps = icpData?.result || [];
  const vps = valuePropData?.result || [];
  const userName = profileData?.role ? `${profileData.role} at ${profileData.company}` : "";
  const industry = onboardingData?.industry || "";

  const generate = useCallback(async () => {
    const currentGenId = ++generationIdRef.current;
    setError("");
    setLoading(true);
    setResult(null);

    const icpSummary = icps.map((icp: any, i: number) =>
      `ICP ${i + 1}: ${icp.name}. Pain Points: ${(icp.painPoints || []).slice(0, 4).join(", ")}. Psychology: ${icp.psychology || ""}. Where: ${Array.isArray(icp.whereTheyHangOut) ? icp.whereTheyHangOut.join(", ") : ""}`
    ).join("\n");

    const topVP = vps[0] ? `${vps[0].corePromise || vps[0].desiredOutcome}` : offer;

    const prompt = `You are a world-class B2B Outreach Strategist. Generate a STRATEGIC OUTREACH PLAYBOOK (not scripts or templates).

- Client: ${userName}
- Offer: ${offer}
- Value Prop: ${topVP}
- Industry: ${industry}
- Selected Angle: ${angle}
- ICPs:
${icpSummary}

For EACH of the 3 ICPs, generate a strategic playbook with these sections:

1. "icpContext": { "who": string, "mindset": string, "careAbout": [3 strings], "ignore": [3 strings] }

2. "strategicApproach": { "bestAngle": string, "positioningStyle": string (peer/expert/challenger/insider), "whatNotToDo": [3 strings] }

3. "touchpointStrategy": {
  "compliment": { "when": string, "type": string, "avoid": string },
  "voiceNote": { "stage": string, "whyItWorks": string, "tone": string },
  "loom": { "trigger": string, "content": string, "personalization": string },
  "caseStudy": { "trustStage": string, "typeOfProof": string, "format": string },
  "leadMagnet": { "timing": string, "type": string, "conversionMoment": string },
  "curiosity": { "hooks": [3 strings], "infoGaps": [2 strings], "psychTriggers": [2 strings] }
}

4. "followUpSystem": { "totalTouches": number (5-8), "delayDays": [array of numbers], "escalationLogic": string, "toneEvolution": string }

5. "messageDistribution": [array of objects with "touch" (number) and "type" (string, e.g. "Curiosity", "Compliment", "Insight", "Case study", "CTA")]

6. "whatToAvoid": [4-5 specific mistakes for this ICP]

Return ONLY valid JSON (no markdown):
{
  "playbooks": [
    { "icpName": string, "icpContext": ..., "strategicApproach": ..., "touchpointStrategy": ..., "followUpSystem": ..., "messageDistribution": [...], "whatToAvoid": [...] },
    ... (3 total)
  ]
}`;

    try {
      const timeoutP = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 60000));
      const raw = await Promise.race([callGemini(prompt), timeoutP]) as string;
      if (currentGenId !== generationIdRef.current) return;

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
      onSave({ angle, result: parsed });
      toast({ title: "✓ Saved", duration: 3000 });
    } catch (e: any) {
      if (currentGenId !== generationIdRef.current) return;
      setError(e.message === "timeout" ? "This is taking too long. Please try again." : (e.message || "Failed"));
    } finally {
      if (currentGenId === generationIdRef.current) setLoading(false);
    }
  }, [angle, offer, icps, vps, userName, industry, onSave, toast]);

  const playbooks = result?.playbooks || [];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Strategic <span className="accent-text">Outreach</span> Playbook</h2>
      <p className="text-muted-foreground mb-8 text-sm">Tactical, psychological outreach strategy per ICP</p>

      <div className="glass-card p-5 mb-6">
        <label className="text-sm text-muted-foreground">Outreach Angle</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ANGLES.map(a => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              className={`text-sm px-4 py-2 rounded-md border transition-all ${
                angle === a ? "tag-selected border-primary" : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <Button onClick={generate} className="accent-bg hover:opacity-90 w-full h-11 font-semibold mt-4">
          {result ? "Regenerate Playbook" : "Generate Outreach Playbook"}
        </Button>
      </div>

      {loading && <LoadingSpinner text="Building your outreach playbook..." />}
      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {playbooks.length > 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* ICP Tabs */}
          <div className="flex gap-1 mb-6">
            {playbooks.map((pb: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === idx ? "accent-bg" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                ICP {idx + 1}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {(() => {
                const pb = playbooks[activeTab];
                if (!pb) return null;
                return (
                  <>
                    {/* ICP Context */}
                    <div className="glass-card p-5">
                      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">🎯 ICP Context — {pb.icpName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground">Who they are</span>
                          <p className="text-sm mt-0.5">{pb.icpContext?.who}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Mindset</span>
                          <p className="text-sm mt-0.5">{pb.icpContext?.mindset}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">They care about</span>
                          <ul className="mt-1 space-y-0.5">
                            {pb.icpContext?.careAbout?.map((c: string, i: number) => (
                              <li key={i} className="text-sm text-emerald-400">✓ {c}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">They ignore</span>
                          <ul className="mt-1 space-y-0.5">
                            {pb.icpContext?.ignore?.map((c: string, i: number) => (
                              <li key={i} className="text-sm text-destructive">✗ {c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Approach */}
                    <div className="glass-card p-5">
                      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">🧠 Strategic Approach</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        <div className="bg-secondary p-3 rounded-md">
                          <span className="text-xs text-muted-foreground">Best Angle</span>
                          <p className="text-sm font-semibold accent-text mt-0.5">{pb.strategicApproach?.bestAngle}</p>
                        </div>
                        <div className="bg-secondary p-3 rounded-md">
                          <span className="text-xs text-muted-foreground">Positioning Style</span>
                          <p className="text-sm font-semibold mt-0.5">{pb.strategicApproach?.positioningStyle}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">What NOT to do</span>
                        <ul className="mt-1 space-y-1">
                          {pb.strategicApproach?.whatNotToDo?.map((w: string, i: number) => (
                            <li key={i} className="text-sm text-destructive/80">✗ {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Touchpoint Strategy */}
                    <div className="glass-card p-5">
                      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">💬 Touchpoint Strategy</h3>
                      <div className="space-y-3">
                        {pb.touchpointStrategy && Object.entries(pb.touchpointStrategy).map(([key, val]: [string, any]) => {
                          if (!val) return null;
                          const labels: Record<string, string> = {
                            compliment: "When to Compliment",
                            voiceNote: "Voice Note",
                            loom: "Loom Video",
                            caseStudy: "Case Study",
                            leadMagnet: "Lead Magnet",
                            curiosity: "Building Curiosity",
                          };
                          return (
                            <Collapsible key={key}>
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-center justify-between bg-secondary p-3 rounded-md hover:bg-muted transition-colors">
                                  <span className="text-sm font-medium">{labels[key] || key}</span>
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="p-3 space-y-2">
                                  {typeof val === "object" && !Array.isArray(val) && Object.entries(val).map(([k, v]: [string, any]) => (
                                    <div key={k}>
                                      <span className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                      {Array.isArray(v) ? (
                                        <ul className="mt-0.5 space-y-0.5">
                                          {v.map((item: string, i: number) => <li key={i} className="text-sm">• {item}</li>)}
                                        </ul>
                                      ) : (
                                        <p className="text-sm">{v}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </div>

                    {/* Follow-up System */}
                    <div className="glass-card p-5">
                      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">🔁 Follow-up System</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="bg-secondary p-3 rounded-md text-center">
                          <span className="text-2xl font-bold accent-text">{pb.followUpSystem?.totalTouches || "—"}</span>
                          <p className="text-xs text-muted-foreground mt-1">Total Touches</p>
                        </div>
                        <div className="bg-secondary p-3 rounded-md col-span-1 sm:col-span-3">
                          <span className="text-xs text-muted-foreground">Delay (days)</span>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {pb.followUpSystem?.delayDays?.map((d: number, i: number) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded tag-selected border border-primary">Day {d}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div><span className="text-xs text-muted-foreground">Escalation</span><p className="text-sm">{pb.followUpSystem?.escalationLogic}</p></div>
                        <div><span className="text-xs text-muted-foreground">Tone Evolution</span><p className="text-sm">{pb.followUpSystem?.toneEvolution}</p></div>
                      </div>
                    </div>

                    {/* Message Distribution */}
                    {pb.messageDistribution && (
                      <div className="glass-card p-5">
                        <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">🧱 Message Distribution</h3>
                        <div className="flex flex-wrap gap-2">
                          {pb.messageDistribution.map((m: any, i: number) => (
                            <div key={i} className="bg-secondary px-3 py-2 rounded-md flex items-center gap-2">
                              <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold accent-bg">{m.touch}</span>
                              <span className="text-sm">{m.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What to Avoid */}
                    {pb.whatToAvoid && (
                      <div className="glass-card p-5">
                        <h3 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">🚫 What to Avoid</h3>
                        <ul className="space-y-1.5">
                          {pb.whatToAvoid.map((w: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-destructive shrink-0">✗</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {playbooks.length > 0 && !loading && (
        <div className="mt-8 flex justify-end">
          <Button onClick={() => { onSave({ angle, result }); onNext(); }} className="accent-bg hover:opacity-90 h-12 px-8 font-semibold">
            Next Step → Finish & Download PDF
          </Button>
        </div>
      )}
    </motion.div>
  );
}
