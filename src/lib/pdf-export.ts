import jsPDF from "jspdf";

const LINKS = {
  linkedin: "https://www.linkedin.com/in/tejasjhaveri",
  instagram: "https://www.instagram.com/tejas_jhaveri",
  calendly: "https://calendly.com/founder-myntmore/30min",
  notion: "https://www.notion.so/myntmorejobboard/Myntmore-Services-a78d1e0504524ff7a8b2c46ee61a42ac",
};

function addHeader(doc: jsPDF) {
  doc.setFontSize(8);
  doc.setTextColor(120);
  const w = doc.internal.pageSize.getWidth();
  doc.text("Myntmore x B2B Growth Workshop", w - 15, 12, { align: "right" });
}

function addFooter(doc: jsPDF) {
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(100);
  const y = h - 10;
  doc.text(`LinkedIn: ${LINKS.linkedin}  |  Instagram: ${LINKS.instagram}`, 15, y);
  doc.text(`Book a Call: ${LINKS.calendly}  |  Myntmore: ${LINKS.notion}`, 15, y + 4);
}

function addHeaderFooter(doc: jsPDF) {
  addHeader(doc);
  addFooter(doc);
}

function newSection(doc: jsPDF, title: string) {
  doc.addPage();
  addHeaderFooter(doc);
  doc.setFontSize(18);
  doc.setTextColor(79, 142, 247);
  doc.text(title, 15, 25);
  return 35;
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number {
  if (!text) return y;
  doc.setFontSize(10);
  doc.setTextColor(60);
  const lines = doc.splitTextToSize(text, maxWidth);
  const pageH = doc.internal.pageSize.getHeight() - 20;
  for (const line of lines) {
    if (y > pageH) {
      doc.addPage();
      addHeaderFooter(doc);
      y = 25;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function addBulletList(doc: jsPDF, items: string[], x: number, y: number, maxWidth: number): number {
  if (!items || !Array.isArray(items)) return y;
  for (const item of items) {
    y = addWrappedText(doc, `• ${item}`, x, y, maxWidth);
    y += 1;
  }
  return y;
}

function addSubHeader(doc: jsPDF, text: string, y: number): number {
  const pageH = doc.internal.pageSize.getHeight() - 20;
  if (y > pageH) { doc.addPage(); addHeaderFooter(doc); y = 25; }
  doc.setFontSize(12);
  doc.setTextColor(123, 47, 247);
  doc.text(text, 15, y);
  return y + 7;
}

export function generatePDF(sessionData: any) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const maxW = w - 30;
  const userName = sessionData?.user_name || "Attendee";

  // Cover page
  addHeaderFooter(doc);
  doc.setFontSize(28);
  doc.setTextColor(79, 142, 247);
  doc.text("B2B Growth Strategy", w / 2, 80, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(150);
  doc.text(userName, w / 2, 95, { align: "center" });
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString(), w / 2, 105, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Powered by Myntmore", w / 2, 120, { align: "center" });

  // Table of Contents
  let y = newSection(doc, "Table of Contents");
  const tocItems = ["Profile Analysis", "ICP 1", "ICP 2", "ICP 3", "Value Propositions", "Website Prompt", "GTM Strategy", "Outreach Sequences"];
  doc.setFontSize(11);
  doc.setTextColor(60);
  tocItems.forEach((item, i) => {
    doc.text(`${i + 1}. ${item}`, 20, y);
    y += 8;
  });

  // Profile Analysis
  const profile = sessionData?.profile_data?.result;
  y = newSection(doc, "Profile Analysis");
  if (profile) {
    y = addSubHeader(doc, `Score: ${profile.finalScore}/100 — ${profile.scoreMeaning}`, y);
    y += 3;
    if (profile.scoreBreakdown) {
      for (const [key, val] of Object.entries(profile.scoreBreakdown) as any) {
        y = addWrappedText(doc, `${key}: ${val.score}/20 — ${val.explanation}`, 15, y, maxW);
        y += 2;
      }
    }
    y += 5;
    y = addSubHeader(doc, "What's Working", y);
    y = addBulletList(doc, profile.whatsWorking, 15, y, maxW);
    y += 3;
    y = addSubHeader(doc, "To Improve", y);
    y = addBulletList(doc, profile.toImprove, 15, y, maxW);
    y += 3;
    y = addSubHeader(doc, "Generated Headlines", y);
    y = addBulletList(doc, profile.headlines, 15, y, maxW);
  }

  // ICPs
  const icps = sessionData?.icp_data?.result || [];
  for (let i = 0; i < icps.length; i++) {
    const icp = icps[i];
    y = newSection(doc, `ICP ${i + 1} — ${icp.name || "Untitled"}`);
    const fields = [
      { key: "whoTheyAre", label: "Who They Are" },
      { key: "coreResponsibilities", label: "Core Responsibilities" },
      { key: "painPoints", label: "Pain Points" },
      { key: "goalsDesires", label: "Goals & Desires" },
      { key: "buyingTriggers", label: "Buying Triggers" },
      { key: "objections", label: "Objections" },
      { key: "psychology", label: "Psychology" },
      { key: "whereTheyHangOut", label: "Where They Hang Out" },
      { key: "howToPosition", label: "How to Position" },
    ];
    for (const f of fields) {
      const val = icp[f.key];
      if (!val) continue;
      y = addSubHeader(doc, f.label, y);
      if (Array.isArray(val)) {
        y = addBulletList(doc, val, 15, y, maxW);
      } else {
        y = addWrappedText(doc, val, 15, y, maxW);
      }
      y += 3;
    }
  }

  // Value Props
  const vps = sessionData?.value_prop_data?.result || [];
  y = newSection(doc, "Value Propositions");
  for (let i = 0; i < vps.length; i++) {
    const vp = vps[i];
    y = addSubHeader(doc, `ICP ${i + 1} — ${vp.icpName}`, y);
    const vpFields = ["desiredOutcome", "currentProblem", "yourMethod", "whatTheyReplace", "coreAngle", "whyThisWins"];
    for (const fk of vpFields) {
      if (vp[fk]) {
        y = addWrappedText(doc, `${fk}: ${vp[fk]}`, 15, y, maxW);
        y += 2;
      }
    }
    y += 5;
  }
  if (sessionData?.value_prop_data?.positioning) {
    y += 3;
    y = addSubHeader(doc, "Core Positioning Statement", y);
    y = addWrappedText(doc, sessionData.value_prop_data.positioning, 15, y, maxW);
  }

  // Website Prompt
  y = newSection(doc, "Website Prompt");
  y = addWrappedText(doc, sessionData?.website_data?.generatedPrompt || "Not generated", 15, y, maxW);

  // GTM
  const gtm = sessionData?.gtm_data?.result;
  y = newSection(doc, "GTM Strategy");
  if (gtm) {
    if (gtm.outreachStrategy) {
      for (const os of gtm.outreachStrategy) {
        y = addSubHeader(doc, `${os.icp} — Outreach`, y);
        y = addWrappedText(doc, `Channels: ${os.channels?.join(", ")}`, 15, y, maxW);
        y += 2;
        y = addBulletList(doc, os.angles, 15, y, maxW);
        y = addBulletList(doc, os.hooks, 15, y, maxW);
        y += 3;
      }
    }
    if (gtm.partnerGrowth) {
      y = addSubHeader(doc, "Partner Outreach", y);
      y = addBulletList(doc, gtm.partnerGrowth.idealPartners, 15, y, maxW);
      y = addWrappedText(doc, `Pitch: ${gtm.partnerGrowth.pitch}`, 15, y, maxW);
      y += 3;
    }
    if (gtm.leadMagnets) {
      y = addSubHeader(doc, "Lead Magnets", y);
      for (const lm of gtm.leadMagnets) {
        y = addWrappedText(doc, `${lm.name} (${lm.format}) — ${lm.targetICP}`, 15, y, maxW);
        y = addWrappedText(doc, `  What: ${lm.whatItDoes}. Input: ${lm.userInput}. Output: ${lm.output}`, 15, y, maxW);
        y += 3;
      }
    }
  }

  // Outreach
  const outreach = sessionData?.outreach_data?.result;
  y = newSection(doc, "Outreach Sequences");
  if (outreach) {
    if (outreach.strategySummary) {
      y = addWrappedText(doc, outreach.strategySummary, 15, y, maxW);
      y += 5;
    }
    if (outreach.linkedIn) {
      y = addSubHeader(doc, "LinkedIn Sequence", y);
      y = addWrappedText(doc, `Connection Request: ${outreach.linkedIn.connectionRequest}`, 15, y, maxW);
      y += 3;
      outreach.linkedIn.followUps?.forEach((fu: string, i: number) => {
        y = addWrappedText(doc, `Follow-up ${i + 1}: ${fu}`, 15, y, maxW);
        y += 3;
      });
    }
    if (outreach.email?.emails) {
      y += 3;
      y = addSubHeader(doc, "Cold Email Sequence", y);
      for (const em of outreach.email.emails) {
        y = addWrappedText(doc, `Subject: ${em.subject}`, 15, y, maxW);
        y = addWrappedText(doc, em.body, 15, y, maxW);
        y += 5;
      }
    }
  }

  doc.save(`B2B_Growth_Strategy_${userName.replace(/\s+/g, "_")}.pdf`);
}
