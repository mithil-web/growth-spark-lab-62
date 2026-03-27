import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Search, ChevronDown } from "lucide-react";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  hasOther?: boolean;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}

export function MultiSelect({
  label, options, selected, onChange, placeholder,
  searchable = true, hasOther = true, otherValue = "", onOtherChange,
}: MultiSelectProps) {
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

  const allOptions = hasOther && !options.includes("Other") ? [...options, "Other"] : options;
  const filtered = allOptions.filter(o => o.toLowerCase().includes(search.toLowerCase()));

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
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground flex items-center justify-between w-full">
            {placeholder || `Select ${label.toLowerCase()}...`}
            <ChevronDown className="w-4 h-4" />
          </span>
        )}
        {selected.map(s => (
          <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded tag-selected border">
            {s}
            <button type="button" onClick={(e) => { e.stopPropagation(); remove(s); }} className="hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {selected.length > 0 && <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />}
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-56 overflow-hidden">
          {searchable && (
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
          )}
          <div className="overflow-y-auto max-h-44">
            {filtered.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => toggle(o)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                  selected.includes(o) ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                  selected.includes(o) ? "bg-primary border-primary text-primary-foreground" : "border-border"
                }`}>
                  {selected.includes(o) && "✓"}
                </span>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
      {selected.includes("Other") && hasOther && onOtherChange && (
        <div className="mt-2">
          <Input
            placeholder="Enter custom values (comma separated)"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            className="bg-secondary border-border focus:border-primary text-sm"
          />
        </div>
      )}
    </div>
  );
}
