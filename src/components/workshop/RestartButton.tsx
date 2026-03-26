import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface RestartButtonProps {
  onRestart: () => void;
}

export function RestartButton({ onRestart }: RestartButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setShowConfirm(true)}
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Restart
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Restart Workshop?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              This will clear all your progress. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setShowConfirm(false); onRestart(); }}>
                Yes, restart
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
