import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const INDUSTRIES = [
  "SaaS", "Fintech", "Healthtech", "Edtech", "E-commerce", "D2C", "Agencies",
  "Consulting", "Coaching", "Real Estate", "Manufacturing", "Logistics", "HR Tech",
  "Martech", "Legal", "Finance", "Healthcare", "Recruitment", "IT Services",
  "AI / ML Startups", "B2B Services", "B2B SaaS", "Other"
];

const BUSINESS_TYPES = ["Service-based", "Product-based", "Hybrid", "Other"];
const REVENUE_OPTIONS = ["Pre-revenue", "Less than $5K", "$5K to $20K", "$20K to $50K", "$50K+", "Other"];

const GOAL_OPTIONS = [
  { label: "More leads", desc: "Generate more qualified prospects" },
  { label: "Better conversion", desc: "Turn prospects into customers" },
  { label: "Brand authority", desc: "Become the go-to in your space" },
  { label: "All of the above", desc: "Full-stack growth" },
];

const GEO_OPTIONS = ["India", "US", "UK", "Europe", "Southeast Asia", "Global", "Other"];

interface Step1Props {
  data: any;
  onSave: (data: any) => void;
  onNext: () => void;
}

export function Step1Onboarding({ data, onSave, onNext }: Step1Props) {
  const [form, setForm] = useState({
    linkedinUrl: data?.linkedinUrl || "",
    industry: data?.industry || "",
    industryOther: data?.industryOther || "",
    businessType: data?.businessType || "",
    businessTypeOther: data?.businessTypeOther || "",
    revenue: data?.revenue || "",
    revenueOther: data?.revenueOther || "",
    goal: data?.goal || "",
    goalOther: data?.goalOther || "",
    geography: data?.geography || [] as string[],
    geographyOther: data?.geographyOther || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: any) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  const toggleGeo = (g: string) => {
    setForm(p => ({
      ...p,
      geography: p.geography.includes(g) ? p.geography.filter((x: string) => x !== g) : [...p.geography, g]
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.linkedinUrl.trim()) errs.linkedinUrl = "LinkedIn URL is required";
    if (!form.industry) errs.industry = "Industry is required";
    if (form.industry === "Other" && !form.industryOther.trim()) errs.industryOther = "Please specify your industry";
    if (!form.businessType) errs.businessType = "Business type is required";
    if (form.businessType === "Other" && !form.businessTypeOther.trim()) errs.businessTypeOther = "Please specify your business type";
    if (!form.revenue) errs.revenue = "Revenue is required";
    if (form.revenue === "Other" && !form.revenueOther.trim()) errs.revenueOther = "Please specify your revenue";
    if (!form.goal) errs.goal = "Primary goal is required";
    if (form.goal === "Other" && !form.goalOther.trim()) errs.goalOther = "Please specify your goal";
    if (form.geography.length === 0) errs.geography = "Select at least one region";
    if (form.geography.includes("Other") && !form.geographyOther.trim()) errs.geographyOther = "Please specify your region";
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
    onNext();
  };

  const SelectField = ({ label, field, options, otherField }: { label: string; field: string; options: string[]; otherField?: string }) => (
    <div>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <select
        value={(form as any)[field]}
        onChange={(e) => update(field, e.target.value)}
        className="w-full mt-1.5 h-10 px-3 rounded-md bg-secondary border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[field] && <p className="text-destructive text-xs mt-1">{errors[field]}</p>}
      {(form as any)[field] === "Other" && otherField && (
        <div className="mt-2">
          <Input
            placeholder="Please specify"
            value={(form as any)[otherField]}
            onChange={(e) => update(otherField, e.target.value)}
            className="bg-secondary border-border focus:border-primary"
          />
          {errors[otherField] && <p className="text-destructive text-xs mt-1">{errors[otherField]}</p>}
        </div>
      )}
    </div>
  );

  // Summary for right panel
  const summaryItems = [
    { label: "Industry", value: form.industry === "Other" ? form.industryOther : form.industry },
    { label: "Business", value: form.businessType === "Other" ? form.businessTypeOther : form.businessType },
    { label: "Revenue", value: form.revenue === "Other" ? form.revenueOther : form.revenue },
    { label: "Goal", value: form.goal === "Other" ? form.goalOther : form.goal },
    { label: "Markets", value: form.geography.join(", ") },
  ].filter(s => s.value);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Tell us about your <span className="accent-text">business</span></h2>
      <p className="text-muted-foreground mb-8 text-sm">This helps us personalise your strategy</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT — Inputs */}
        <div className="space-y-6">
          {/* Business Basics */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Business Basics</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">LinkedIn Profile URL</Label>
                <Input
                  value={form.linkedinUrl}
                  onChange={(e) => update("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="mt-1.5 bg-secondary border-border focus:border-primary"
                />
                {errors.linkedinUrl && <p className="text-destructive text-xs mt-1">{errors.linkedinUrl}</p>}
              </div>
              <SelectField label="Industry" field="industry" options={INDUSTRIES} otherField="industryOther" />
              <SelectField label="Business Type" field="businessType" options={BUSINESS_TYPES} otherField="businessTypeOther" />
              <SelectField label="Current Monthly Revenue" field="revenue" options={REVENUE_OPTIONS} otherField="revenueOther" />
            </div>
          </div>

          {/* Growth Objective */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Growth Objective</h3>
            <Label className="text-sm text-muted-foreground">Primary Goal</Label>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map(g => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => update("goal", g.label)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    form.goal === g.label
                      ? "tag-selected border-primary"
                      : "bg-secondary border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className={`text-sm font-medium ${form.goal === g.label ? "text-primary" : "text-foreground"}`}>{g.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
            {errors.goal && <p className="text-destructive text-xs mt-2">{errors.goal}</p>}
            {form.goal === "Other" && (
              <div className="mt-3">
                <Input placeholder="Please specify your goal" value={form.goalOther} onChange={(e) => update("goalOther", e.target.value)} className="bg-secondary border-border focus:border-primary" />
                {errors.goalOther && <p className="text-destructive text-xs mt-1">{errors.goalOther}</p>}
              </div>
            )}
          </div>

          {/* Market Focus */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Market Focus</h3>
            <Label className="text-sm text-muted-foreground">Target Geography</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {GEO_OPTIONS.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGeo(g)}
                  className={`text-sm px-4 py-2 rounded-md border transition-all ${
                    form.geography.includes(g)
                      ? "tag-selected border-primary"
                      : "bg-secondary border-border hover:border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.geography && <p className="text-destructive text-xs mt-2">{errors.geography}</p>}
            {form.geography.includes("Other") && (
              <div className="mt-3">
                <Input placeholder="Please specify your region" value={form.geographyOther} onChange={(e) => update("geographyOther", e.target.value)} className="bg-secondary border-border focus:border-primary" />
                {errors.geographyOther && <p className="text-destructive text-xs mt-1">{errors.geographyOther}</p>}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Summary Panel */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Your Profile</h3>
              {summaryItems.length === 0 ? (
                <p className="text-xs text-muted-foreground">Start filling in your details...</p>
              ) : (
                <div className="space-y-3">
                  {summaryItems.map(s => (
                    <div key={s.label}>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="text-sm text-foreground font-medium">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground italic">We're tailoring your strategy based on these inputs...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} className="accent-bg hover:opacity-90 h-12 px-8 font-semibold">
          Next Step →
        </Button>
      </div>
    </motion.div>
  );
}
