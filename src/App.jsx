import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#0F1117",
  surface: "#181B25",
  surfaceHover: "#1E2230",
  border: "#2A2E3D",
  accent: "#4F8CFF",
  accentSoft: "#4F8CFF22",
  green: "#34D399",
  greenSoft: "#34D39922",
  amber: "#FBBF24",
  amberSoft: "#FBBF2422",
  red: "#F87171",
  redSoft: "#F8717122",
  purple: "#A78BFA",
  purpleSoft: "#A78BFA22",
  cyan: "#22D3EE",
  cyanSoft: "#22D3EE22",
  text: "#E8EAF0",
  textMuted: "#9CA3B0",
  textDim: "#6B7280",
};

const shapeMap = {
  oval: { label: "Oval / Pill", desc: "Start / End" },
  rectangle: { label: "Rectangle", desc: "Process / Action" },
  diamond: { label: "Diamond", desc: "Decision" },
  parallelogram: { label: "Parallelogram", desc: "Input / Output" },
  hexagon: { label: "Hexagon", desc: "Preparation" },
  document: { label: "Document", desc: "Document / Report" },
  largeBlock: { label: "Large Block", desc: "Complex Process" },
};

const sections = [
  {
    id: "lead-entry",
    title: "1. Lead Entry & Trigger",
    color: COLORS.accent,
    colorSoft: COLORS.accentSoft,
    steps: [
      {
        shape: "oval",
        text: "NEW LEAD ENTERS SYSTEM",
        subtext: "Lead arrives from: Google Ads, Facebook Ads, Thumbtack, Other Channels",
        color: COLORS.accent,
      },
      {
        shape: "rectangle",
        text: "Lead Captured in GoHighLevel (GHL)",
        subtext: "Lead goes to 'New Leads' pipeline stage. Contact info, source, and timestamp recorded.",
        color: COLORS.accent,
      },
      {
        shape: "hexagon",
        text: "GHL Triggers n8n Workflow",
        subtext: "Webhook fires to n8n when new contact is created. Lead data passed: name, phone, email, source.",
        color: COLORS.accent,
      },
      {
        shape: "rectangle",
        text: "n8n Triggers Retell AI Voice Agent",
        subtext: "n8n sends outbound call request to Retell API with lead phone number and context data.",
        color: COLORS.accent,
      },
    ],
  },
  {
    id: "call-attempt",
    title: "2. First Call Attempt",
    color: COLORS.purple,
    colorSoft: COLORS.purpleSoft,
    steps: [
      {
        shape: "parallelogram",
        text: "AI DIALS LEAD",
        subtext: "Retell AI initiates outbound call to the lead's phone number.",
        color: COLORS.purple,
      },
      {
        shape: "diamond",
        text: "DOES THE LEAD ANSWER?",
        subtext: "Branch into two paths depending on whether the call is picked up.",
        color: COLORS.purple,
        branches: ["YES → Go to Section 3 (AI Sales Call)", "NO → Go to Section 5 (No-Answer Flow)"],
      },
    ],
  },
  {
    id: "ai-call",
    title: "3. AI Sales Call (Lead Answers)",
    color: COLORS.green,
    colorSoft: COLORS.greenSoft,
    steps: [
      {
        shape: "largeBlock",
        text: "AI SALES CONVERSATION",
        subtext: "This is a large process block. The AI agent performs the following during the call:",
        color: COLORS.green,
        subpoints: [
          "Greets lead by name & references their source (e.g. 'Hi Stacy, you submitted a request on Thumbtack for mobile car detailing')",
          "Asks qualifying questions: What car do you drive? (Year, Make, Model, Trim, Color)",
          "Asks: Interior, exterior, or both?",
          "Explains the 3 service packages:\n  • Panda X (Express Detail)\n  • Revive (Full Interior & Exterior)\n  • Black (Full Detail + 2-Stage Deep Clean + Ceramic Sealant)",
          "Mentions available add-ons: Pet hair removal, baby car seat cleaning, etc.",
          "Provides pricing based on car details and package selected",
          "Handles objections (e.g. 'That's expensive' → offer Express package or a discount code)",
          "Confirms lead interest and readiness to book",
        ],
      },
      {
        shape: "diamond",
        text: "IS THE LEAD READY TO BOOK?",
        subtext: "Determine if lead wants to proceed or needs more time.",
        color: COLORS.green,
        branches: ["YES → Send booking link", "HESITANT → Offer discount / alternate package", "NO → Move to nurture"],
      },
      {
        shape: "rectangle",
        text: "Send Booking Link via SMS",
        subtext: "AI triggers SMS: 'Here's your booking link. Enter your car details to see exact price and availability.' Link goes to Panda Hub website booking flow.",
        color: COLORS.green,
      },
      {
        shape: "diamond",
        text: "DOES LEAD NEED HUMAN HELP?",
        subtext: "AI detects if the lead has complex questions or requests a real person.",
        color: COLORS.green,
        branches: [
          "NO → Continue AI flow",
          "YES (During business hours) → Transfer to live agent",
          "YES (After hours) → Create ticket in GHL for Ryan",
        ],
      },
    ],
  },
  {
    id: "post-call",
    title: "4. Post-Call & Booking Tracking",
    color: COLORS.cyan,
    colorSoft: COLORS.cyanSoft,
    steps: [
      {
        shape: "rectangle",
        text: "Log Call Data",
        subtext: "n8n logs to Google Sheets / Airtable: Lead name, phone, email, source, call duration, package discussed, objections raised, outcome.",
        color: COLORS.cyan,
      },
      {
        shape: "rectangle",
        text: "Save Call Transcript",
        subtext: "Full AI call transcript saved for quality review and training improvement.",
        color: COLORS.cyan,
      },
      {
        shape: "rectangle",
        text: "Update GHL Pipeline Stage",
        subtext: "Move lead to appropriate stage: 'Booking Link Sent' or 'Quotation Given' or 'Not Interested'.",
        color: COLORS.cyan,
      },
      {
        shape: "diamond",
        text: "DID THE LEAD BOOK?",
        subtext: "Check booking status after a set period (e.g. 1 day).",
        color: COLORS.cyan,
        branches: ["YES → Move to 'Booked' stage, stop follow-ups", "NO → Enter Follow-Up Nurture Sequence (Section 6)"],
      },
    ],
  },
  {
    id: "no-answer",
    title: "5. No-Answer Flow (Lead Doesn't Pick Up)",
    color: COLORS.amber,
    colorSoft: COLORS.amberSoft,
    steps: [
      {
        shape: "parallelogram",
        text: "SEND INITIAL SMS",
        subtext: "'Hey [Name], I tried calling regarding your Thumbtack request for mobile car detailing. Would you prefer a call or text?'",
        color: COLORS.amber,
      },
      {
        shape: "diamond",
        text: "DOES LEAD REPLY?",
        subtext: "Wait for a response within a defined window (e.g. a few hours).",
        color: COLORS.amber,
        branches: [
          "REPLIES 'Call' → AI calls again → Go to Section 3",
          "REPLIES 'Text' → Continue via SMS conversation (AI texting)",
          "NO REPLY → Enter Follow-Up Sequence (Section 6)",
        ],
      },
      {
        shape: "largeBlock",
        text: "AI SMS CONVERSATION (If Lead Prefers Text)",
        subtext: "AI continues the sales process over SMS:",
        color: COLORS.amber,
        subpoints: [
          "Asks about their car (year, make, model)",
          "Explains packages via text",
          "Answers questions",
          "Sends pricing and booking link",
          "Handles objections via text",
        ],
      },
    ],
  },
  {
    id: "nurture",
    title: "6. Follow-Up Nurture Sequence",
    color: COLORS.red,
    colorSoft: COLORS.redSoft,
    steps: [
      {
        shape: "hexagon",
        text: "ENTER NURTURE AUTOMATION",
        subtext: "Lead enters automated follow-up sequence in GHL. Pipeline stage: 'Quotation'.",
        color: COLORS.red,
      },
      {
        shape: "largeBlock",
        text: "SMS FOLLOW-UP SEQUENCE",
        subtext: "Automated drip sequence:",
        color: COLORS.red,
        subpoints: [
          "Day 1: Check booking status → If not booked → SMS: 'Hi [Name], just checking in — did you get a chance to look at the booking link?'",
          "Day 3: SMS: 'Still interested in getting your [Car] detailed? Here's your link again: [link]'",
          "Day 5: SMS with incentive: 'We have a special offer this week — [X]% off your first detail. Book now: [link]'",
          "Day 7+: Final attempt or mark as cold lead",
        ],
      },
      {
        shape: "diamond",
        text: "DOES LEAD BOOK AT ANY POINT?",
        subtext: "System checks booking status before each follow-up.",
        color: COLORS.red,
        branches: [
          "YES → Stop sequence, move to 'Booked'",
          "OPT OUT → Stop sequence, mark 'Opted Out'",
          "NO RESPONSE after full sequence → Mark 'Cold Lead'",
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "7. Analytics & ROI Tracking",
    color: COLORS.purple,
    colorSoft: COLORS.purpleSoft,
    steps: [
      {
        shape: "document",
        text: "GOOGLE SHEETS / AIRTABLE DASHBOARD",
        subtext: "All lead and conversion data flows here for ROI calculation.",
        color: COLORS.purple,
      },
      {
        shape: "largeBlock",
        text: "TRACKED METRICS",
        subtext: "Key columns and data points:",
        color: COLORS.purple,
        subpoints: [
          "Lead date, name, phone, email",
          "Lead source (Thumbtack, Google, FB, etc.)",
          "Lead cost (source-specific)",
          "AI call outcome (booked, quoted, no answer, not interested)",
          "Package selected & booking value",
          "Motivation / Budget / Intent score",
          "AI operational cost per lead",
          "Revenue generated",
          "Profitability per lead and per source",
          "Conversion rate (e.g. 200 bookings / 1000 leads = 20%)",
        ],
      },
      {
        shape: "rectangle",
        text: "Custom Analytics Dashboard",
        subtext: "Visual dashboard showing: conversion funnel, cost per acquisition, revenue by source, AI vs human performance, and overall ROI.",
        color: COLORS.purple,
      },
      {
        shape: "oval",
        text: "CONTINUOUS OPTIMIZATION",
        subtext: "Review data weekly. Improve AI scripts, adjust follow-up timing, refine discount strategy, and scale what works.",
        color: COLORS.purple,
      },
    ],
  },
];

function ShapeIcon({ shape, color, size = 24 }) {
  const s = size;
  const h = s * 0.7;
  const fill = color + "33";
  const stroke = color;

  const shapes = {
    oval: (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <ellipse cx={s / 2} cy={h / 2} rx={s / 2 - 1} ry={h / 2 - 1} fill={fill} stroke={stroke} strokeWidth="1.5" />
      </svg>
    ),
    rectangle: (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <rect x="1" y="1" width={s - 2} height={h - 2} rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      </svg>
    ),
    diamond: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${s / 2},1 ${s - 1},${s / 2} ${s / 2},${s - 1} 1,${s / 2}`} fill={fill} stroke={stroke} strokeWidth="1.5" />
      </svg>
    ),
    parallelogram: (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <polygon points={`${s * 0.2},${h - 1} 1,1 ${s * 0.8},1 ${s - 1},${h - 1}`} fill={fill} stroke={stroke} strokeWidth="1.5" />
      </svg>
    ),
    hexagon: (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <polygon points={`${s * 0.25},1 ${s * 0.75},1 ${s - 1},${h / 2} ${s * 0.75},${h - 1} ${s * 0.25},${h - 1} 1,${h / 2}`} fill={fill} stroke={stroke} strokeWidth="1.5" />
      </svg>
    ),
    document: (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <path d={`M1,1 L${s - 1},1 L${s - 1},${h * 0.75} Q${s * 0.5},${h * 0.6} 1,${h - 1} Z`} fill={fill} stroke={stroke} strokeWidth="1.5" />
      </svg>
    ),
    largeBlock: (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <rect x="1" y="1" width={s - 2} height={h - 2} rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray="3,2" />
      </svg>
    ),
  };
  return shapes[shape] || shapes.rectangle;
}

function StepCard({ step, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderLeft: `3px solid ${step.color}`,
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 12,
        cursor: step.subpoints || step.branches ? "pointer" : "default",
        transition: "all 0.2s",
      }}
      onClick={() => (step.subpoints || step.branches) && setExpanded(!expanded)}
      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.surfaceHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.surface)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <ShapeIcon shape={step.shape} color={step.color} size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 4,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            {step.text}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: COLORS.textMuted,
              lineHeight: 1.5,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {step.subtext}
          </div>

          {(step.subpoints || step.branches) && (
            <div
              style={{
                fontSize: 11,
                color: step.color,
                marginTop: 6,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: 0.8,
              }}
            >
              {expanded ? "▾ Click to collapse" : "▸ Click to expand details"}
            </div>
          )}

          {expanded && step.subpoints && (
            <div style={{ marginTop: 10, paddingLeft: 4 }}>
              {step.subpoints.map((sp, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: COLORS.textMuted,
                    padding: "6px 0 6px 16px",
                    borderLeft: `2px solid ${step.color}44`,
                    marginBottom: 4,
                    lineHeight: 1.5,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    whiteSpace: "pre-line",
                  }}
                >
                  <span style={{ color: step.color, fontWeight: 600, marginRight: 6 }}>{i + 1}.</span>
                  {sp}
                </div>
              ))}
            </div>
          )}

          {expanded && step.branches && (
            <div style={{ marginTop: 10, paddingLeft: 4 }}>
              {step.branches.map((br, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: COLORS.text,
                    padding: "6px 12px",
                    background: step.color + "12",
                    border: `1px solid ${step.color}33`,
                    borderRadius: 6,
                    marginBottom: 4,
                    lineHeight: 1.4,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ↳ {br}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ section, index }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          marginBottom: collapsed ? 0 : 14,
          padding: "10px 16px",
          background: section.colorSoft,
          border: `1px solid ${section.color}33`,
          borderRadius: 10,
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: section.color + "22",
            border: `2px solid ${section.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: section.color,
            fontFamily: "'JetBrains Mono', monospace",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.text,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            {section.title}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {section.steps.length} steps
          </div>
        </div>
        <div style={{ color: section.color, fontSize: 18, fontWeight: 300, transition: "transform 0.2s", transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}>
          ▾
        </div>
      </div>

      {!collapsed && (
        <div style={{ paddingLeft: 8 }}>
          {section.steps.map((step, i) => (
            <div key={i}>
              <StepCard step={step} index={i} />
              {i < section.steps.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
                  <div style={{ width: 2, height: 16, background: section.color + "44" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Shape Legend — Use in Canva
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {Object.entries(shapeMap).map(([key, val]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: COLORS.bg,
              borderRadius: 6,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <ShapeIcon shape={key} color={COLORS.accent} size={20} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.text, fontFamily: "'Inter', sans-serif" }}>
                {val.label}
              </div>
              <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
                {val.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorTheme() {
  const theme = [
    { name: "Lead Entry / Triggers", hex: "#4F8CFF", use: "Blue" },
    { name: "Call Decision Points", hex: "#A78BFA", use: "Purple" },
    { name: "AI Sales Call (Answered)", hex: "#34D399", use: "Green" },
    { name: "Post-Call / Tracking", hex: "#22D3EE", use: "Cyan" },
    { name: "No-Answer / SMS Flow", hex: "#FBBF24", use: "Amber" },
    { name: "Nurture / Follow-Up", hex: "#F87171", use: "Red" },
    { name: "Analytics / ROI", hex: "#A78BFA", use: "Purple" },
  ];

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Color Theme for Canva
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {theme.map((t, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: COLORS.bg,
              borderRadius: 6,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: t.hex,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.text, fontFamily: "'Inter', sans-serif" }}>
                {t.name}
              </div>
              <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
                {t.hex}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Improvements() {
  const items = [
    {
      title: "Instant Speed-to-Lead",
      desc: "The AI triggers a call within seconds of lead entry — near-instant response. Add a visible SLA timer in your dashboard to track actual response times. Thumbtack leads contacted instantly convert 3-5x better than those reached after even a few minutes.",
    },
    {
      title: "Lead Scoring & Tiered Pitching",
      desc: "Score leads in n8n based on source, service type, and engagement signals. Each tier gets a tailored sales approach:",
      tiers: [
        { label: "High Score", color: "#34D399", text: "Premium, confident pitch — lead with the Black package, emphasize value and quality, minimal discounting" },
        { label: "Mid Score", color: "#FBBF24", text: "Balanced consultative approach — walk through all three packages, compare features, let the lead choose" },
        { label: "Low Score", color: "#F87171", text: "Softer curiosity-driven pitch — focus on affordability, highlight the Express package, offer discount incentives upfront" },
      ],
    },
    {
      title: "Voicemail Detection + Drop",
      desc: "If the AI detects voicemail, drop a pre-recorded message instead of silence. 'Hi, this is Panda Hub following up on your car detailing request...'",
    },
    {
      title: "Smart Retry Logic",
      desc: "If no answer, retry the call 2-3 times at different intervals (e.g. 30 min, 3 hours, next day) before switching to SMS-only.",
    },
    {
      title: "Callback Scheduling",
      desc: "Allow leads to text back a preferred callback time. AI or n8n schedules the call automatically.",
    },
    {
      title: "A/B Test SMS Templates",
      desc: "Rotate between different SMS scripts and track which has better reply/booking rates. Feed this data into your analytics dashboard.",
    },
    {
      title: "Post-Booking Upsell",
      desc: "After a lead books, send an automated SMS offering add-ons (pet hair removal, ceramic coating upgrade) before their appointment.",
    },
    {
      title: "Win-Back Campaign",
      desc: "For 'Cold Leads' that never booked, run a monthly re-engagement SMS with a seasonal offer or discount.",
    },
  ];

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 14,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Suggested Improvements
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "12px 14px",
              background: COLORS.bg,
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
              + {item.title}
            </div>
            <div style={{ fontSize: 11.5, color: COLORS.textMuted, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
              {item.desc}
            </div>
            {item.tiers && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                {item.tiers.map((tier, ti) => (
                  <div key={ti} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: tier.color, background: tier.color + "18",
                      padding: "2px 7px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap", marginTop: 1, flexShrink: 0,
                    }}>{tier.label}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45, fontFamily: "'Inter', sans-serif" }}>
                      {tier.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PandaHubFlow() {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.text,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: COLORS.accent,
              marginBottom: 8,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Panda Hub · AI Sales & Automation System
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: COLORS.text,
              margin: "0 0 8px 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Complete System Flowchart
          </h1>
          <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            End-to-end automation flow from lead entry through AI sales calls, follow-ups, booking, and ROI tracking. Click on any section or step to explore the full details.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <a
              href="https://wa.me/15878536069"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 8,
                background: COLORS.green, color: "#0F1117",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact
            </a>
            <a
              href="https://docs.google.com/document/d/1-SktDv7a-NL4S9yxpzzD8tRPvbF-HwibfLx4On8dv8c/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 8,
                background: "transparent", color: COLORS.accent,
                border: `1.5px solid ${COLORS.accent}`,
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accentSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Explore Document
            </a>
          </div>
        </div>

        {/* Sections */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: COLORS.textDim,
              marginBottom: 16,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Flow Steps — Click sections & steps to expand
          </div>
        </div>

        {sections.map((section, i) => (
          <div key={section.id}>
            <SectionBlock section={section} index={i} />
            {i < sections.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", margin: "0 0 16px 0" }}>
                <svg width="20" height="24" viewBox="0 0 20 24">
                  <path d="M10 0 L10 18 M4 14 L10 20 L16 14" fill="none" stroke={COLORS.textDim} strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Improvements */}
        <Improvements />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            borderTop: `1px solid ${COLORS.border}`,
            marginTop: 20,
          }}
        >
          <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            Prepared by Waqar Hussain · AI & Automation Consultant · For Reza Ahmadi, Panda Hub
          </div>
        </div>
      </div>
    </div>
  );
}
