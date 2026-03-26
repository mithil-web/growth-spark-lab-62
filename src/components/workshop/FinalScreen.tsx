import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";

interface FinalScreenProps {
  sessionData: any;
  onDownloadPDF: () => void;
  onRestart: () => void;
}

export function FinalScreen({ sessionData, onDownloadPDF, onRestart }: FinalScreenProps) {
  const icps = sessionData?.icp_data?.result || [];
  const vps = sessionData?.value_prop_data?.result || [];
  const outreach = sessionData?.outreach_data?.result || {};

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-extrabold mb-2">Workshop <span className="accent-text">Complete!</span></h2>
        <p className="text-muted-foreground text-lg">You have built a complete B2B growth strategy.</p>
      </div>

      <div className="glass-card p-6 text-left mb-8 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">ICPs Identified</h4>
          <p className="text-sm text-muted-foreground mt-1">
            3 ICPs identified{icps[0]?.name ? `, starting with ${icps[0].name}` : ""}
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">Core Positioning</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {vps[0]?.corePromise || vps[0]?.yourMethod || "Your unique method and positioning"}
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">Outreach Strategy</h4>
          <p className="text-sm text-muted-foreground mt-1 italic">
            {outreach?.playbooks?.[0]?.strategicApproach?.bestAngle
              ? `${outreach.playbooks[0].strategicApproach.bestAngle} approach for ${outreach.playbooks[0].icpName}`
              : "Your personalised outreach playbook is ready"}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onDownloadPDF} className="accent-bg hover:opacity-90 h-12 px-8 font-semibold">
          <Download className="w-4 h-4 mr-2" />
          Download Full Strategy PDF
        </Button>
        <Button variant="outline" onClick={onRestart} className="h-12 px-8 border-border text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          Start a New Workshop
        </Button>
      </div>
    </motion.div>
  );
}
