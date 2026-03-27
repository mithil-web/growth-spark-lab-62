import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, RotateCcw, Copy, Check, Users, Target, Zap, MessageSquare, Globe, ArrowRight, Clock, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FinalScreenProps {
  sessionData: any;
  onDownloadPDF: () => void;
  onRestart: () => void;
}

export function FinalScreen({ sessionData, onDownloadPDF, onRestart }: FinalScreenProps) {
  const icps = sessionData?.icp_data?.result || [];
  const vps = sessionData?.value_prop_data?.result || [];
  const outreach = sessionData?.outreach_data?.result || {};
  const gtm = sessionData?.gtm_data?.result || {};
  const website = sessionData?.website_data || {};
  const profile = sessionData?.profile_data || {};
  const playbooks = outreach?.playbooks || [];
  const strategies = gtm?.icpStrategies || [];
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const bestMagnet = strategies[0]?.leadMagnets?.find((lm: any) => lm.bestStart) || strategies[0]?.leadMagnets?.[0];

  const copyFullStrategy = () => {
    const lines: string[] = [];
    lines.push("=== GROWTH STRATEGY SUMMARY ===\n");

    lines.push("--- TARGET CUSTOMERS ---");
    icps.forEach((icp: any, i: number) => {
      lines.push(`${i + 1}. ${icp.name}`);
      if (icp.painPoints?.[0]) lines.push(`   Key pain: ${icp.painPoints[0]}`);
      if (icp.buyingTriggers?.[0]) lines.push(`   Trigger: ${icp.buyingTriggers[0]}`);
    });

    lines.push("\n--- VALUE PROPOSITION ---");
    vps.forEach((vp: any, i: number) => {
      lines.push(`ICP ${i + 1} (${vp.icpName || ""}): ${vp.corePromise || ""}`);
      if (vp.positioning) lines.push(`   Positioning: ${vp.positioning}`);
    });

    lines.push("\n--- OUTREACH ---");
    playbooks.forEach((pb: any) => {
      lines.push(`${pb.icpName}: ${pb.strategicApproach?.bestAngle || ""} angle, ${pb.strategicApproach?.positioningStyle || ""} style`);
    });

    if (website.generatedPrompt) {
      lines.push("\n--- WEBSITE PROMPT ---");
      lines.push(website.generatedPrompt.slice(0, 500) + "...");
    }

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "✓ Strategy copied to clipboard", duration: 2000 });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pt-20 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-[28px] font-extrabold mb-2">Your Growth System Is <span className="accent-text">Ready</span></h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">Here's a complete snapshot of your strategy. You can start executing immediately.</p>
      </div>

      {/* Strategy Snapshot */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Strategy Snapshot
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Target Customers</span>
            <ul className="mt-1 space-y-0.5">
              {icps.slice(0, 3).map((icp: any, i: number) => (
                <li key={i} className="text-sm text-foreground">→ {icp.name}</li>
              ))}
              {icps.length === 0 && <li className="text-sm text-muted-foreground italic">Not completed</li>}
            </ul>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Core Positioning</span>
            <p className="text-sm text-foreground mt-1">{vps[0]?.positioning || vps[0]?.corePromise || "Not generated yet"}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Primary Growth Focus</span>
            <p className="text-sm text-foreground mt-1">
              {strategies[0]?.channels?.[0]?.name
                ? `${strategies[0].channels.filter((c: any) => c.startHere).map((c: any) => c.name).join(" + ") || strategies[0].channels[0].name} + Partner-Led Growth`
                : "Not generated yet"}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Outreach Approach</span>
            <p className="text-sm text-foreground mt-1">
              {playbooks[0]?.strategicApproach
                ? `${playbooks[0].strategicApproach.bestAngle} angle, ${playbooks[0].strategicApproach.positioningStyle} style`
                : "Not generated yet"}
            </p>
          </div>
        </div>
      </div>

      {/* ICP Breakdown */}
      {icps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[16px] font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Target Customer Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {icps.slice(0, 3).map((icp: any, i: number) => (
              <div key={i} className="glass-card p-4">
                <h4 className="text-sm font-semibold accent-text mb-2">{icp.name}</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Key Pain</span>
                    <p className="text-xs text-foreground">{icp.painPoints?.[0] || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Buying Trigger</span>
                    <p className="text-xs text-foreground">{icp.buyingTriggers?.[0] || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Best Channel</span>
                    <p className="text-xs text-foreground">{icp.whereTheyHangOut?.[0] || strategies[i]?.channels?.[0]?.name || "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value Prop Summary */}
      {vps.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Value Proposition Summary
          </h3>
          <div className="space-y-3">
            {vps.slice(0, 3).map((vp: any, i: number) => (
              <div key={i} className="bg-secondary p-4 rounded-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-[10px] text-muted-foreground uppercase">{vp.icpName || `ICP ${i + 1}`}</span>
                    <p className="text-sm font-semibold mt-0.5">{vp.corePromise}</p>
                    {vp.positioning && <p className="text-xs text-muted-foreground mt-1 italic">"{vp.positioning}"</p>}
                  </div>
                  {vp.coreAngle && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded tag-selected border border-primary shrink-0">
                      {typeof vp.coreAngle === 'string' ? vp.coreAngle.split(':')[0] : vp.coreAngle}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GTM Execution Snapshot */}
      {strategies.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Growth Execution Snapshot
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Primary Channels</span>
              <ul className="mt-1 space-y-0.5">
                {(strategies[0]?.channels || []).slice(0, 3).map((ch: any, i: number) => (
                  <li key={i} className="text-sm text-foreground flex gap-1.5 items-center">
                    {ch.startHere && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    {ch.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Execution Plan</span>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">Week 1–2 → Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">Week 3–4 → Launch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">Week 5+ → Scale</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Best Lead Magnet</span>
              {bestMagnet ? (
                <div className="mt-1">
                  <p className="text-sm font-medium text-foreground">{bestMagnet.name}</p>
                  <span className="text-[10px] text-primary uppercase">{bestMagnet.type}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 italic">Not generated</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Outreach System Summary */}
      {playbooks.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Outreach System Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Recommended Flow</span>
              <div className="mt-2 space-y-1.5">
                {["Connection Request", "Warm Engagement (like + comment)", "Message 1: Curiosity / Insight", "Follow-up 1: Value Add", "Follow-up 2: Loom or Lead Magnet", "Follow-up 3: Soft CTA or Graceful Close"].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold accent-bg shrink-0">{i + 1}</span>
                    <span className="text-xs text-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Timing</span>
                <p className="text-sm text-foreground mt-1">2–5 day delay between steps</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                <p className="text-xs text-muted-foreground">"Do not overload with multiple assets. Test one sequence at a time and adapt based on what gets replies."</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Per-ICP Angles</span>
                <div className="mt-1 space-y-0.5">
                  {playbooks.slice(0, 3).map((pb: any, i: number) => (
                    <p key={i} className="text-xs text-foreground">
                      <span className="text-primary">{pb.icpName}:</span> {pb.strategicApproach?.bestAngle || "—"} / {pb.strategicApproach?.positioningStyle || "—"}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Website Strategy Snapshot */}
      {website.generatedPrompt && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Website Strategy Snapshot
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Website Type</span>
              <p className="text-sm text-foreground mt-1">{profile.company ? `Company (${profile.company})` : "Personal Brand"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Key Sections</span>
              <ul className="mt-1 space-y-0.5 text-xs text-foreground">
                <li>→ Hero + Problem</li>
                <li>→ Solution + Value Prop</li>
                <li>→ FAQ + CTA</li>
              </ul>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Conversion Elements</span>
              <ul className="mt-1 space-y-0.5 text-xs text-foreground">
                <li>→ Interactive Tools</li>
                <li>→ Trust Signals</li>
                <li>→ Sticky Navigation</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">Primary: {website.primaryColor || "#FFC947"}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">Secondary: {website.secondaryColor || "#111111"}</span>
          </div>
        </div>
      )}

      {/* What To Do Next */}
      <div className="glass-card p-6 mb-8 border-primary">
        <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-primary" /> What To Do Next
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: "1", title: "Set up your outbound system", desc: "Connect LinkedIn, prepare your profile, and set up tracking" },
            { step: "2", title: "Test 2–3 outreach sequences", desc: "Start with the Clean and Simple sequence and adapt" },
            { step: "3", title: "Launch your lead magnet", desc: "Publish your top lead magnet and drive traffic to it" },
          ].map((item) => (
            <div key={item.step} className="bg-secondary p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold accent-bg">{item.step}</span>
                <span className="text-sm font-semibold">{item.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
        <Button onClick={onDownloadPDF} className="accent-bg hover:opacity-90 h-12 px-8 font-semibold">
          <Download className="w-4 h-4 mr-2" />
          Download Full Strategy PDF
        </Button>
        <Button variant="outline" onClick={copyFullStrategy} className="h-12 px-6 border-border text-muted-foreground hover:text-foreground">
          {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Full Strategy"}
        </Button>
        <Button variant="outline" onClick={onRestart} className="h-12 px-6 border-border text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Workshop
        </Button>
      </div>
    </motion.div>
  );
}