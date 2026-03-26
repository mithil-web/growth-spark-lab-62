import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "./LoadingSpinner";
import { callGemini } from "@/lib/workshop-store";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Plus, X, Search } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const INDUSTRIES = [
  "SaaS", "Fintech", "Healthtech", "Edtech", "E-commerce", "D2C", "Agencies",
  "Consulting", "Coaching", "Real Estate", "Manufacturing", "Logistics", "HR Tech",
  "Martech", "Legal", "Finance", "Healthcare", "Recruitment", "IT Services",
  "AI / ML Startups", "B2B Services", "B2B SaaS", "Other"
];

const ROLES = [
  "Founder / Co-Founder", "CEO / CXO", "Head of Growth", "Head of Sales",
  "Head of Marketing", "SDR / BDR Manager", "Enterprise Sales Leader",
  "Partnerships Manager", "Operations Head", "Strategy Lead", "Other"
];

const SIZES = ["1–10", "10–50", "50–200", "200–500", "500–1000", "1000+", "Other"];

interface IcpInput {
  roles: string[];
  sizes: string[];
  industries: string[];
}

interface Step3Props {
  data: any;
  onSave: (data: any) => void;
  onNext: () => void;
}

function SearchableMultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const toggle = (o: string) => {
    onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]);
  };
  const remove = (o: string) => onChange(selected.filter(x => x !== o));

  return (
    <div ref={ref} className="relative">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        onClick={() => setOpen(true)}
        className="mt-1 min-h-[40px] flex flex-wrap gap-1.5 items-center p-2 rounded-md bg-secondary border border-border cursor-pointer hover:border-muted-foreground transition-colors"
      >
        {selected.length === 0 && <span className="text-sm text-muted-foreground">Select {label.toLowerCase()}...</span>}
        {selected.map(s => (
          <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded tag-selected border">
            {s}
            <button type="button" onClick={(e) => { e.stopPropagation(); remove(s); }} className="hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-56 overflow-hidden">
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-44">
            {filtered.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => toggle(o)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  selected.includes(o) ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Step3ICP({ data, onSave, onNext }: Step3Props) {
  const emptyIcp = (): IcpInput => ({ roles: [], sizes: [], industries: [] });
  const [icpCount, setIcpCount] = useState(data?.inputs?.length || 3);
  const [icps, setIcps] = useState<IcpInput[]>(() => {
    const inputs = data?.inputs || [];
    while (inputs.length < 3) inputs.push(emptyIcp());
    return inputs;
  });
  const [openIcp, setOpenIcp] = useState(0);
  const [offer, setOffer] = useState(data?.offer || "");
  const [result, setResult] = useState<any[]>(data?.result || []);
  const [niche, setNiche] = useState(data?.niche || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const updateIcp = (idx: number, field: keyof IcpInput, value: string[]) => {
    setIcps(p => p.map((icp, i) => i === idx ? { ...icp, [field]: value } : icp));
  };

  const generate = async () => {
    if (!offer.trim()) { setError("Please enter your core offer"); return; }
    for (let i = 0; i < icpCount; i++) {
      if (icps[i].roles.length === 0) { setError(`ICP ${i + 1}: select at least one role`); return; }
      if (icps[i].sizes.length === 0) { setError(`ICP ${i + 1}: select at least one company size`); return; }
      if (icps[i].industries.length === 0) { setError(`ICP ${i + 1}: select at least one industry`); return; }
    }
    setError("");
    setLoading(true);
    setResult([]);

    const prompt = `You are an expert B2B Growth Strategist. Generate 3 deep, strategic Ideal Customer Profiles (ICPs).

Core Offer: ${offer}
${Array.from({ length: icpCount }, (_, i) => `ICP ${i + 1} Inputs: Roles: ${icps[i].roles.join(", ")}, Company Sizes: ${icps[i].sizes.join(", ")}, Industries: ${icps[i].industries.join(", ")}`).join("\n")}

For EACH ICP generate:
1. ICP Name (descriptive)
2. Who They Are (3-4 bullet points)
3. Core Responsibilities (as a list)
4. Pain Points (at least 5 to 7 specific bullet points)
5. Goals and Desires (as a list)
6. Buying Triggers (as a list)
7. Objections (as a list)
8. Psychology (brief)
9. Where They Hang Out (as a list of platforms)
10. How to Position (messaging angle)

Rules:
- Make each ICP DISTINCT.
- Use specific, believable insights. No generic text.
- Pain Points for all 3 ICPs MUST be filled.

Return ONLY a valid JSON array of exactly 3 objects (no markdown, no code blocks). Each object must have: name, whoTheyAre (array), coreResponsibilities (array), painPoints (array), goalsDesires (array), buyingTriggers (array), objections (array), psychology (string), whereTheyHangOut (array), howToPosition (string).`;

    try {
      const timeoutP = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 60000));
      const raw = await Promise.race([callGemini(prompt), timeoutP]) as string;
      let parsed;
      try {
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      } catch {
        setError("Failed to parse AI response. Please try again.");
        setLoading(false);
        return;
      }
      setResult(parsed);
      onSave({ inputs: icps, offer, result: parsed, niche });
      toast({ title: "✓ Saved", description: "ICPs generated and saved", duration: 3000 });
    } catch (e: any) {
      setError(e.message === "timeout" ? "This is taking too long. Please try again." : (e.message || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  // Display: Tabbed ICP output
  const [activeTab, setActiveTab] = useState(0);

  const sections = [
    { key: "whoTheyAre", label: "Who They Are", icon: "👤" },
    { key: "coreResponsibilities", label: "Responsibilities", icon: "📋" },
    { key: "painPoints", label: "Pain Points", icon: "🔥" },
    { key: "goalsDesires", label: "Goals", icon: "🎯" },
    { key: "buyingTriggers", label: "Buying Triggers", icon: "⚡" },
    { key: "objections", label: "Objections", icon: "🛡️" },
    { key: "whereTheyHangOut", label: "Where to Reach", icon: "📍" },
    { key: "howToPosition", label: "Positioning", icon: "💎" },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Define Your <span className="accent-text">Ideal Customers</span></h2>
      <p className="text-muted-foreground mb-8 text-sm">Build 3 detailed ICPs for your business</p>

      {/* Accordion ICP Inputs */}
      <div className="space-y-3 mb-6">
        {Array.from({ length: icpCount }, (_, idx) => (
          <Collapsible key={idx} open={openIcp === idx} onOpenChange={(open) => open && setOpenIcp(idx)}>
            <CollapsibleTrigger className="w-full">
              <div className={`glass-card p-4 flex items-center justify-between cursor-pointer transition-colors ${openIcp === idx ? "border-primary" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${openIcp === idx ? "accent-bg" : "bg-secondary text-muted-foreground"}`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium text-sm">ICP {idx + 1}</span>
                  {icps[idx].roles.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({icps[idx].roles.length} roles, {icps[idx].sizes.length} sizes, {icps[idx].industries.length} industries)
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openIcp === idx ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="glass-card p-5 mt-1 space-y-4 border-primary">
                <SearchableMultiSelect label="Roles" options={ROLES} selected={icps[idx].roles} onChange={v => updateIcp(idx, "roles", v)} />
                <SearchableMultiSelect label="Company Size" options={SIZES} selected={icps[idx].sizes} onChange={v => updateIcp(idx, "sizes", v)} />
                <SearchableMultiSelect label="Industries" options={INDUSTRIES} selected={icps[idx].industries} onChange={v => updateIcp(idx, "industries", v)} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <div className="glass-card p-5 mb-6">
        <Label className="text-sm text-muted-foreground">Core Offer / What you sell *</Label>
        <Textarea value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. We help B2B companies generate leads via LinkedIn outreach and cold email" className="mt-1.5 bg-secondary border-border focus:border-primary" />
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {!loading && result.length === 0 && (
        <Button onClick={generate} className="accent-bg hover:opacity-90 w-full h-11 font-semibold">
          Generate ICP Profiles
        </Button>
      )}

      {loading && <LoadingSpinner text="Generating your ICPs... this takes ~20 seconds" />}

      {/* ICP OUTPUT — Tabbed */}
      {result.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {result.map((icp: any, idx: number) => (
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

          {/* Active ICP Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold accent-text mb-6">{result[activeTab]?.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.map(s => {
                    const val = result[activeTab]?.[s.key];
                    if (!val) return null;

                    // Pain points get special highlight treatment
                    if (s.key === "painPoints" && Array.isArray(val)) {
                      return (
                        <div key={s.key} className="md:col-span-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.icon} {s.label}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {val.map((item: string, i: number) => (
                              <div key={i} className="bg-secondary p-3 rounded-md text-sm text-foreground border-l-2 border-primary">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Objections: collapsible
                    if (s.key === "objections") {
                      return (
                        <div key={s.key} className="md:col-span-2">
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 cursor-pointer hover:text-foreground">
                              {s.icon} {s.label}
                              <ChevronDown className="w-3 h-3" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              {Array.isArray(val) ? (
                                <ul className="space-y-1.5 mt-1">
                                  {val.map((item: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {item}</li>)}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">{val}</p>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    }

                    // Where they hang out: tags
                    if (s.key === "whereTheyHangOut" && Array.isArray(val)) {
                      return (
                        <div key={s.key}>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.icon} {s.label}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {val.map((item: string, i: number) => (
                              <span key={i} className="text-xs px-2 py-1 rounded tag-selected border border-primary">{item}</span>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Positioning: highlight box
                    if (s.key === "howToPosition") {
                      return (
                        <div key={s.key} className="md:col-span-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.icon} {s.label}</h4>
                          <div className="bg-primary/10 border border-primary/30 p-4 rounded-md text-sm text-foreground">
                            {val}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={s.key}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.icon} {s.label}</h4>
                        {Array.isArray(val) ? (
                          <ul className="space-y-1">
                            {val.map((item: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {item}</li>)}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">{val}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {(!result[activeTab]?.painPoints || result[activeTab].painPoints.length === 0) && (
                  <p className="text-destructive text-sm mt-4">⚠️ Pain points missing for this ICP</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="glass-card p-5 mt-4">
            <Label className="text-sm text-muted-foreground">Niche Refinement (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Narrow your niche for the Website Builder step.</p>
            <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. AI-powered SaaS for HR teams" className="bg-secondary border-border focus:border-primary" />
          </div>

          <Button onClick={generate} variant="ghost" className="w-full mt-4 text-muted-foreground">Regenerate ICPs</Button>
        </motion.div>
      )}

      {result.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Button onClick={() => { onSave({ inputs: icps, offer, result, niche }); onNext(); }} className="accent-bg hover:opacity-90 h-12 px-8 font-semibold">
            Next Step →
          </Button>
        </div>
      )}
    </motion.div>
  );
}
