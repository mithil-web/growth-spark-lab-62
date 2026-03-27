import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "./LoadingSpinner";
import { callGemini } from "@/lib/workshop-store";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Upload, ArrowLeft, Image } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Step5Props {
  data: any;
  icpData: any;
  valuePropData: any;
  onSave: (data: any) => void;
  onNext: () => void;
  onBack?: () => void;
}

const FOLLOW_UP_PROMPTS = [
  "Now optimise the mobile layout. Make all sections stack vertically, increase font sizes, and ensure CTA buttons are full-width.",
  "Add 3 trust signals: client logos, testimonial carousel with photo+name+result, and a 'Featured In' press bar.",
  "Create a detailed testimonials section with 6 testimonials including client name, role, company, and specific result.",
  "Add SEO: meta title, meta description, Open Graph tags, structured data (JSON-LD), and alt text for all images.",
  "Design a pricing section with 3 tiers: Starter, Growth, Enterprise. Include feature comparison and FAQ.",
];

const GENERAL_FAQS = [
  { q: "What is the Website Builder step?", a: "It generates a ready-to-paste prompt you can use in AI Studio to build a high-converting landing page based on your ICP and value prop data." },
  { q: "Can I customise the output?", a: "Yes. Use the follow-up prompts below to refine specific sections like mobile layout, testimonials, or SEO." },
  { q: "What if my brand has specific guidelines?", a: "Upload a design reference screenshot. The prompt will adapt the layout structure while using your defined colors." },
];

const AI_STUDIO_FAQS = [
  { q: "How do I use Google AI Studio?", a: "1. Open aistudio.google.com/apps\n2. Paste the generated prompt\n3. Optionally upload a design screenshot\n4. Click Generate" },
  { q: "How do I deploy the generated site?", a: "1. Copy the generated code from AI Studio\n2. Create a new repo on GitHub\n3. Connect to Vercel or Netlify\n4. Deploy with one click" },
  { q: "What model should I use?", a: "Use Gemini 2.0 Flash for speed, or Gemini Pro for higher quality output. Both work well for website generation." },
];

const LOVABLE_FAQS = [
  { q: "Can I paste the prompt into Lovable?", a: "Yes. Lovable can interpret the prompt and generate a full React site with Tailwind CSS styling." },
  { q: "How do I optimize credits?", a: "Use specific, detailed prompts. Avoid regenerating the entire site — use follow-up prompts to refine individual sections." },
  { q: "What's the best iteration strategy?", a: "Generate once, then iterate section by section. Fix layout first, then copy, then design polish." },
];

export function Step5Website({ data, icpData, valuePropData, onSave, onNext, onBack }: Step5Props) {
  const [form, setForm] = useState({
    brandName: data?.brandName || "",
    primaryColor: data?.primaryColor || "#FFC947",
    secondaryColor: data?.secondaryColor || "#111111",
  });
  const [designRef, setDesignRef] = useState<string | null>(data?.designRef || null);
  const [generatedPrompt, setGeneratedPrompt] = useState(data?.generatedPrompt || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDesignRef(reader.result as string);
      toast({ title: "✓ Design reference uploaded", duration: 2000 });
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!form.brandName.trim()) { setError("Brand name is required"); return; }
    setError("");
    setLoading(true);
    setGeneratedPrompt("");

    const icps = icpData?.result || [];
    const vps = valuePropData?.result || [];
    const offer = icpData?.offer || "";
    const icpSummary = icps.map((icp: any, i: number) =>
      `ICP ${i + 1}: ${icp.name}. Pain Points: ${(icp.painPoints || []).slice(0, 3).join(", ")}`
    ).join("\n");
    const topVP = vps[0] ? `${vps[0].corePromise || vps[0].desiredOutcome}` : offer;

    const designInstruction = designRef
      ? "\n\nIMPORTANT: A design reference image has been provided. Use it for STRUCTURE and LAYOUT only. Do NOT copy colors from the reference. Use ONLY the brand colors specified above."
      : "";

    const prompt = `You are a world-class conversion rate optimisation expert and B2B web designer.

Generate a comprehensive, ready-to-paste prompt for building a high-converting landing page.

Inputs:
- Brand Name: ${form.brandName}
- Primary Colour: ${form.primaryColor}
- Secondary Colour: ${form.secondaryColor}
- Core Offer: ${offer}
- Value Proposition: ${topVP}
- Target ICPs and Pain Points:
${icpSummary}
${designInstruction}

The generated website must have EXACTLY these 8 sections in this order:
1. Hero Section
2. Problem Section
3. Solution Section
4. Value Proposition Section
5. Free Resource Section (MANDATORY): 3 interactive tool-based resources (NOT ebooks/PDFs)
6. CTA Section
7. FAQ Section: 8 questions
8. Footer: TJ's LinkedIn, Instagram, Newsletter, Calendly, Myntmore Notion

Design rules:
- Dark theme with given colours
- Minimal, high-contrast design
- Font: Inter or Outfit
- All copy must be FINAL

Output a detailed, ready-to-paste prompt. Do NOT return JSON. Return plain text.`;

    try {
      const timeoutP = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 60000));
      const raw = await Promise.race([callGemini(prompt), timeoutP]) as string;
      setGeneratedPrompt(raw);
      onSave({ ...form, generatedPrompt: raw, designRef });
      toast({ title: "✓ Saved", duration: 3000 });
    } catch (e: any) {
      setError(e.message === "timeout" ? "This is taking too long. Please try again." : (e.message || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", duration: 2000 });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Build Your <span className="accent-text">Website</span></h2>
      <p className="text-muted-foreground mb-8 text-sm">Generate a ready-to-use website prompt</p>

      <div className="glass-card p-6 space-y-4 mb-6">
        <div>
          <Label className="text-sm text-muted-foreground">Brand / Business Name *</Label>
          <Input value={form.brandName} onChange={e => update("brandName", e.target.value)} className="mt-1 bg-secondary border-border focus:border-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Primary Colour</Label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={form.primaryColor} onChange={e => update("primaryColor", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <span className="text-sm text-muted-foreground font-mono">{form.primaryColor}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Secondary Colour</Label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={form.secondaryColor} onChange={e => update("secondaryColor", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <span className="text-sm text-muted-foreground font-mono">{form.secondaryColor}</span>
            </div>
          </div>
        </div>

        {/* Design Reference Upload */}
        <div>
          <Label className="text-sm text-muted-foreground">Design Reference (optional)</Label>
          <p className="text-xs text-muted-foreground mb-2">Upload a screenshot of a site you like. We'll use its structure, not its colors.</p>
          <div className="mt-1">
            {designRef ? (
              <div className="relative">
                <img src={designRef} alt="Design reference" className="w-full max-h-48 object-cover rounded-md border border-border" />
                <button onClick={() => setDesignRef(null)} className="absolute top-2 right-2 bg-card/80 text-foreground p-1 rounded text-xs hover:bg-card">✕</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-20 rounded-md border border-dashed border-border bg-secondary cursor-pointer hover:border-muted-foreground transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Drop image or click to upload</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Pinterest Link */}
        <a
          href="https://www.pinterest.com/search/pins/?q=website%20design%20inspiration"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Image className="w-4 h-4" />
          Explore design inspiration on Pinterest →
        </a>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {!loading && !generatedPrompt && (
        <Button onClick={generate} className="accent-bg hover:opacity-90 w-full h-11 font-semibold">
          Generate Website Prompt
        </Button>
      )}

      {loading && <LoadingSpinner text="Generating your website prompt..." />}

      {generatedPrompt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generated Prompt</h3>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedPrompt)} className="text-muted-foreground hover:text-primary">
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground bg-secondary p-4 rounded-md overflow-auto max-h-80 whitespace-pre-wrap">{generatedPrompt}</pre>
          </div>

          <a
            href="https://aistudio.google.com/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors font-medium text-sm"
          >
            Open Google AI Studio <ExternalLink className="w-4 h-4" />
          </a>

          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground">Paste the prompt into AI Studio. For best results, upload a screenshot of a website you love.</p>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Refine Your Output</h3>
            <div className="space-y-2">
              {FOLLOW_UP_PROMPTS.map((p, i) => (
                <div key={i} className="flex items-start gap-2 bg-secondary p-3 rounded-md">
                  <p className="text-xs text-muted-foreground flex-1">{p}</p>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(p)} className="shrink-0 text-muted-foreground hover:text-primary">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Frequently Asked Questions</h3>
            <Tabs defaultValue="general">
              <TabsList className="bg-secondary w-full">
                <TabsTrigger value="general" className="flex-1 text-xs">General</TabsTrigger>
                <TabsTrigger value="aistudio" className="flex-1 text-xs">AI Studio & Deploy</TabsTrigger>
                <TabsTrigger value="lovable" className="flex-1 text-xs">Lovable</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <Accordion type="single" collapsible>
                  {GENERAL_FAQS.map((faq, i) => (
                    <AccordionItem key={i} value={`g-${i}`} className="border-border">
                      <AccordionTrigger className="text-sm text-foreground hover:no-underline py-3">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="aistudio">
                <Accordion type="single" collapsible>
                  {AI_STUDIO_FAQS.map((faq, i) => (
                    <AccordionItem key={i} value={`a-${i}`} className="border-border">
                      <AccordionTrigger className="text-sm text-foreground hover:no-underline py-3">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="lovable">
                <Accordion type="single" collapsible>
                  {LOVABLE_FAQS.map((faq, i) => (
                    <AccordionItem key={i} value={`l-${i}`} className="border-border">
                      <AccordionTrigger className="text-sm text-foreground hover:no-underline py-3">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>

          <Button onClick={generate} variant="ghost" className="w-full text-muted-foreground">Regenerate</Button>
        </motion.div>
      )}

      {generatedPrompt && (
        <div className="mt-8 flex items-center justify-between">
          {onBack ? (
            <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : <div />}
          <Button onClick={() => { onSave({ ...form, generatedPrompt, designRef }); onNext(); }} className="accent-bg hover:opacity-90 h-12 px-8 font-semibold">
            Next Step →
          </Button>
        </div>
      )}
    </motion.div>
  );
}
