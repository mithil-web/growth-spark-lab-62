import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = "Generating... this takes ~20 seconds" }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full gradient-bg animate-spin opacity-30" />
        <Loader2 className="w-12 h-12 text-primary animate-spin absolute inset-0" />
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">{text}</p>
    </div>
  );
}
