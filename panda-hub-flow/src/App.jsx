import { useState } from "react";

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
  orange: "#FB923C",
  orangeSoft: "#FB923C22",
  pink: "#F472B6",
  pinkSoft: "#F472B622",
  lime: "#A3E635",
  limeSoft: "#A3E63522",
  text: "#E8EAF0",
  textMuted: "#9CA3B0",
  textDim: "#6B7280",
};

const sections = [
  {
    id: "lead-entry",
    title: "1. Lead Entry, Scoring & Trigger",
    color: COLORS.accent,
    colorSoft: COLORS.accentSoft,
    steps: [
      {
        shape: "oval",
        text: "NEW LEAD ENTERS SYSTEM",
        subtext: "Lead arrives from: Google Ads, Facebook Ads, Thumbtack, or other channels.",
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
        text: "GHL Triggers n8n Workflow (Instant)",
        subtext: "Webhook fires to n8n within seconds of lead creation. Lead data passed: name, phone, email, source. Speed-to-lead is critical \u2014 the AI calls within seconds, not minutes.",
        color: COLORS.accent,
      },
      {
        shape: "largeBlock",
        text: "LEAD SCORING (n8n)",
        subtext: "n8n scores the lead based on source quality, service type, time of day, and engagement signals. The score determines the AI's sales approach:",
        color: COLORS.accent,
        subpoints: [
          "HIGH SCORE \u2014 Premium, confident pitch. Lead with the Black package, emphasize value and quality, minimal discounting.",
          "MID SCORE \u2014 Balanced consultative approach. Walk through all three packages, compare features, let the lead choose.",
          "LOW SCORE \u2014 Softer curiosity-driven pitch. Focus on affordability, highlight the Express package, offer discount incentives upfront.",
        ],
      },
      {
        shape: "diamond",
        text: "IS IT BUSINESS HOURS?",
        subtext: "Check whether the lead arrived during or outside business hours.",
        color: COLORS.accent,
        branches: [
          "YES \u2192 Proceed to AI call immediately",
          "NO \u2192 Send after-hours SMS: 'Hey, this is regarding your Thumbtack request. I know it\u2019s outside business hours, but I can still give you a quick call right now if you\u2019re available.' Then proceed to call if they respond, or queue for next morning.",
        ],
      },
      {
        shape: "rectangle",
        text: "n8n Triggers Retell AI Voice Agent",
        subtext: "n8n sends outbound call request to Retell API with lead phone number, lead score, and context data including the tier-specific pitch strategy.",
        color: COLORS.accent,
      },
    ],
  },
  {
    id: "knowledge-base",
    title: "2. AI Knowledge Base & Context Layer",
    color: COLORS.pink,
    colorSoft: COLORS.pinkSoft,
    steps: [
      {
        shape: "largeBlock",
        text: "PRIMARY KNOWLEDGE BASE (Retell Agent)",
        subtext: "Core information the AI uses on every single call. This is directly embedded in the agent\u2019s prompt and instructions:",
        color: COLORS.pink,
        subpoints: [
          "All 3 service packages with full descriptions and pricing logic (Panda X, Revive, Black)",
          "Add-on services and pricing (pet hair removal, baby car seat, etc.)",
          "Complete booking flow steps \u2014 what each page looks like, what to say at each step",
          "Objection handling scripts and discount guardrails",
          "Vehicle qualification questions (year, make, model, trim, color)",
          "Address, water/electricity supply requirements",
          "Available time slots, detailer (Pro) selection process",
        ],
      },
      {
        shape: "largeBlock",
        text: "SECONDARY KNOWLEDGE BASE (Vector DB)",
        subtext: "Additional company and operational information stored in a vector database. The AI retrieves this on-demand when a customer asks less common questions:",
        color: COLORS.pink,
        subpoints: [
          "Company background, history, and mission",
          "Service area coverage and locations",
          "Team information and credentials",
          "Frequently asked questions (warranty, insurance, products used, etc.)",
          "Policies (cancellation, rescheduling, weather, etc.)",
          "Seasonal promotions or special offers",
        ],
      },
      {
        shape: "rectangle",
        text: "Context Injection (Before Every AI Response)",
        subtext: "Before the AI generates any response \u2014 on a call or via SMS \u2014 the system fetches the latest call summary and SMS history from GHL. This ensures the AI always has full context and never repeats questions or contradicts previous conversations.",
        color: COLORS.pink,
      },
    ],
  },
  {
    id: "call-attempt",
    title: "3. Call Attempts & Retry Logic",
    color: COLORS.purple,
    colorSoft: COLORS.purpleSoft,
    steps: [
      {
        shape: "parallelogram",
        text: "AI DIALS LEAD (Attempt 1)",
        subtext: "Retell AI initiates the first outbound call within seconds of lead entry.",
        color: COLORS.purple,
      },
      {
        shape: "diamond",
        text: "DOES THE LEAD ANSWER?",
        subtext: "Branch into two paths depending on whether the call is picked up.",
        color: COLORS.purple,
        branches: [
          "YES \u2192 Go to Section 4 (AI Sales Call)",
          "NO \u2192 Check: Is this Attempt 1, 2, or 3?",
        ],
      },
      {
        shape: "largeBlock",
        text: "HARD CAP: 3 CALL ATTEMPTS",
        subtext: "If the lead doesn\u2019t answer, the system retries exactly 3 times at increasing intervals. After 3 attempts, the system permanently switches to SMS-only (unless the customer explicitly requests a callback).",
        color: COLORS.purple,
        subpoints: [
          "Attempt 1: Immediately on lead entry",
          "Attempt 2: 30 minutes after Attempt 1 (if no answer and no SMS reply)",
          "Attempt 3: 3 hours after Attempt 2 (if still no engagement)",
          "If all 3 attempts fail \u2192 Send SMS and switch to SMS-only permanently",
          "Exception: If the customer explicitly texts back asking for a call, the AI can call again regardless of attempt count",
        ],
      },
      {
        shape: "diamond",
        text: "VOICEMAIL DETECTED?",
        subtext: "If the AI detects voicemail on any attempt, it drops a pre-recorded message instead of silence.",
        color: COLORS.purple,
        branches: [
          "YES \u2192 Drop voicemail: 'Hi, this is Panda Hub following up on your car detailing request. I\u2019ll send you a text with details shortly.'",
          "NO (Just no answer / ring out) \u2192 Wait for next retry interval",
        ],
      },
    ],
  },
  {
    id: "ai-call",
    title: "4. AI Sales Call (Lead Answers)",
    color: COLORS.green,
    colorSoft: COLORS.greenSoft,
    steps: [
      {
        shape: "rectangle",
        text: "SMS Booking Link Fires Immediately",
        subtext: "The moment the call connects, the system sends the booking link via SMS \u2014 before any questions are asked. This ensures the customer has the link in hand from the very start.",
        color: COLORS.green,
      },
      {
        shape: "largeBlock",
        text: "AI SALES CONVERSATION",
        subtext: "The AI agent conducts the full sales conversation. The pitch approach adapts based on the lead score assigned in Section 1:",
        color: COLORS.green,
        subpoints: [
          "Greets lead by name & references their source (e.g. 'Hi Stacy, you submitted a request on Thumbtack for mobile car detailing')",
          "Asks qualifying questions: What car do you drive? (Year, Make, Model, Trim, Color)",
          "Asks: Interior, exterior, or both?",
          "Explains the 3 service packages:\n  \u2022 Panda X (Express Detail)\n  \u2022 Revive (Full Interior & Exterior)\n  \u2022 Black (Full Detail + 2-Stage Deep Clean + Ceramic Sealant)",
          "Mentions available add-ons: Pet hair removal, baby car seat cleaning, etc.",
          "Provides pricing based on car details and package selected",
          "Handles objections using tier-appropriate strategy (see discount guardrails below)",
          "Guides lead toward opening the booking link \u2014 transition into Guided Booking Flow (Section 5)",
        ],
      },
      {
        shape: "largeBlock",
        text: "DISCOUNT GUARDRAILS",
        subtext: "Strict rules for when the AI can and cannot offer a discount:",
        color: COLORS.green,
        subpoints: [
          "Only offer a discount if a genuine price objection is raised by the customer",
          "Only on first contact \u2014 never offer discounts on follow-up calls or SMS",
          "Only if no previous discount has already been given to this lead",
          "If conditions are met: offer a lower-tier package first, then a discount code as a last resort",
          "Discount codes are pulled from a pre-loaded pool but presented as personally generated for the customer during the call",
        ],
      },
      {
        shape: "diamond",
        text: "DOES LEAD NEED HUMAN HELP?",
        subtext: "AI detects if the lead has complex questions or explicitly requests a real person.",
        color: COLORS.green,
        branches: [
          "NO \u2192 Continue AI flow into Guided Booking (Section 5)",
          "YES (During business hours) \u2192 Transfer to live agent immediately",
          "YES (After hours) \u2192 Create ticket in GHL for Ryan to follow up",
        ],
      },
    ],
  },
  {
    id: "guided-booking",
    title: "5. Guided Booking Flow (On-Call Walkthrough)",
    color: COLORS.orange,
    colorSoft: COLORS.orangeSoft,
    steps: [
      {
        shape: "rectangle",
        text: "Transition: AI Guides Customer to Open the Link",
        subtext: "Instead of just giving the price and ending the call, the AI actively keeps the customer on the phone and walks them through the booking. Example: 'Perfect, I\u2019ve sent you a link where you can instantly see the pricing and all available packages for your vehicle. Once you open it, click See My Price and I\u2019ll stay on the phone with you to walk you through it.'",
        color: COLORS.orange,
      },
      {
        shape: "largeBlock",
        text: "STEP-BY-STEP BOOKING WALKTHROUGH",
        subtext: "The AI knows what each page in the booking flow looks like and guides the customer through each step while staying on the phone (typically 3\u20135 minutes):",
        color: COLORS.orange,
        subpoints: [
          "Step 1: 'Go ahead and click See My Price on the page.'",
          "Step 2: 'Now enter your vehicle details \u2014 year, make, model, and trim. I can help if you\u2019re not sure.'",
          "Step 3: 'You should now see three packages. Do you see Panda X, Revive, and Black? Which one are you leaning toward?'",
          "Step 4: 'Great choice. If you\u2019d like any add-ons like pet hair removal, you can select them now.'",
          "Step 5: 'Now enter your service address and confirm water and electricity access.'",
          "Step 6: 'Pick a date and time that works for you from the calendar.'",
          "Step 7: 'You\u2019ll see available Pros in your area \u2014 go ahead and choose one.'",
          "Step 8: 'Now you\u2019ll need to create an account \u2014 just your name, email, and phone. This saves your vehicle and address for future bookings.'",
          "Step 9: 'You\u2019re at checkout! Go ahead and enter your payment details and confirm.'",
        ],
      },
      {
        shape: "rectangle",
        text: "Live Discount Strategy (At Checkout)",
        subtext: "If the customer hesitates at checkout, the AI offers a closing incentive: 'Since you went through the booking process with me, I can generate a special 10% discount code for you right now that you can apply before confirming.' Code is from a pre-loaded pool but presented as personally generated.",
        color: COLORS.orange,
      },
      {
        shape: "diamond",
        text: "WHAT WAS THE OUTCOME?",
        subtext: "Three possible funnel outcomes from the guided booking flow:",
        color: COLORS.orange,
        branches: [
          "BEST CASE \u2192 Customer completed full booking + payment on the call \u2192 Move to 'Booked' stage",
          "MEDIUM CASE \u2192 Customer created an account but didn\u2019t book yet \u2192 Push to Klaviyo for email sequences + AI SMS follow-ups (captured: name, email, phone, vehicle, address)",
          "WORST CASE \u2192 Customer opened the link and engaged but didn\u2019t create account \u2192 Enter standard nurture sequence (Section 8)",
        ],
      },
    ],
  },
  {
    id: "post-call",
    title: "6. Post-Call Processing Pipeline",
    color: COLORS.cyan,
    colorSoft: COLORS.cyanSoft,
    steps: [
      {
        shape: "rectangle",
        text: "Save Full Call Transcript",
        subtext: "The complete call transcript from Retell is saved for quality review and AI training improvement.",
        color: COLORS.cyan,
      },
      {
        shape: "rectangle",
        text: "Claude Generates Call Summary",
        subtext: "The transcript is sent to Claude which generates a structured summary: customer intent, package discussed, objections raised, outcome, next steps, and any special notes. This happens in the background automatically.",
        color: COLORS.cyan,
      },
      {
        shape: "rectangle",
        text: "Summary Saved to GHL Contact Record",
        subtext: "The Claude-generated summary is saved to the lead\u2019s contact record in GHL. This ensures all future interactions (AI or human) have full context. This must complete before any SMS follow-up begins.",
        color: COLORS.cyan,
      },
      {
        shape: "rectangle",
        text: "Log All Call Data to Analytics",
        subtext: "n8n logs to Google Sheets / Airtable: Lead name, phone, email, source, lead score, call duration, package discussed, objections raised, discount offered, outcome, booking value.",
        color: COLORS.cyan,
      },
      {
        shape: "rectangle",
        text: "Update GHL Pipeline Stage & Tags",
        subtext: "Move lead to appropriate stage: 'Booked', 'Account Created', 'Booking Link Sent', 'Quotation Given', or 'Not Interested'. Apply relevant tags for segmentation.",
        color: COLORS.cyan,
      },
      {
        shape: "diamond",
        text: "DID THE LEAD BOOK?",
        subtext: "Check the booking outcome from the call.",
        color: COLORS.cyan,
        branches: [
          "YES (Booked + Paid) \u2192 Move to 'Booked' stage, trigger post-booking upsell (Section 9)",
          "ACCOUNT CREATED (No booking) \u2192 Push to Klaviyo email sequences + AI SMS follow-ups",
          "NO (Engaged but didn\u2019t book) \u2192 Enter Follow-Up Nurture Sequence (Section 8)",
        ],
      },
    ],
  },
  {
    id: "no-answer",
    title: "7. No-Answer Flow (After All 3 Attempts Exhausted)",
    color: COLORS.amber,
    colorSoft: COLORS.amberSoft,
    steps: [
      {
        shape: "parallelogram",
        text: "SEND SMS AFTER FINAL ATTEMPT",
        subtext: "'Hey [Name], I tried reaching you a few times about your Thumbtack request for mobile car detailing. Would you prefer a call or text? Here\u2019s a link to see pricing for your vehicle: [booking link]'",
        color: COLORS.amber,
      },
      {
        shape: "diamond",
        text: "DOES LEAD REPLY?",
        subtext: "Wait for a response within a defined window.",
        color: COLORS.amber,
        branches: [
          "REPLIES 'Call' \u2192 AI calls again (exception to 3-attempt rule since customer requested it) \u2192 Go to Section 4",
          "REPLIES 'Text' \u2192 Continue via AI SMS conversation below",
          "NO REPLY \u2192 Enter Follow-Up Nurture Sequence (Section 8)",
        ],
      },
      {
        shape: "largeBlock",
        text: "AI SMS CONVERSATION (Text-Based Sales)",
        subtext: "AI continues the full sales process over SMS with full context injection (fetches call summary + SMS history from GHL before every response):",
        color: COLORS.amber,
        subpoints: [
          "Asks about their car (year, make, model)",
          "Explains packages via text",
          "Answers questions",
          "Sends pricing and booking link",
          "Handles objections via text (same discount guardrails apply)",
          "Tries to guide them into the booking flow and account creation",
        ],
      },
      {
        shape: "rectangle",
        text: "Callback Scheduling",
        subtext: "If the lead texts a preferred callback time, the AI or n8n automatically schedules the call for that time. The scheduled call bypasses the 3-attempt limit since the customer explicitly requested it.",
        color: COLORS.amber,
      },
    ],
  },
  {
    id: "nurture",
    title: "8. Follow-Up Nurture Sequence",
    color: COLORS.red,
    colorSoft: COLORS.redSoft,
    steps: [
      {
        shape: "hexagon",
        text: "ENTER NURTURE AUTOMATION",
        subtext: "Lead enters automated follow-up sequence in GHL. Pipeline stage: 'Quotation'. Context injection ensures AI has full history before every message.",
        color: COLORS.red,
      },
      {
        shape: "largeBlock",
        text: "SMS FOLLOW-UP SEQUENCE (A/B Tested)",
        subtext: "Automated drip sequence. Multiple SMS templates are rotated and A/B tested to identify which scripts convert best:",
        color: COLORS.red,
        subpoints: [
          "Day 1: Check booking status \u2192 If not booked \u2192 SMS: 'Hi [Name], just checking in \u2014 did you get a chance to look at the booking link?'",
          "Day 3: SMS: 'Still interested in getting your [Car] detailed? Here\u2019s your link again: [link]'",
          "Day 5: SMS with incentive: 'We have a special offer this week \u2014 [X]% off your first detail. Book now: [link]'",
          "Day 7+: Final attempt or mark as cold lead",
          "A/B testing tracks open rates, reply rates, and booking conversion rates per template variant",
        ],
      },
      {
        shape: "diamond",
        text: "DOES LEAD BOOK AT ANY POINT?",
        subtext: "System checks booking status before each follow-up.",
        color: COLORS.red,
        branches: [
          "YES \u2192 Stop sequence, move to 'Booked', trigger post-booking upsell (Section 9)",
          "ACCOUNT CREATED \u2192 Push to Klaviyo for email nurture sequences",
          "OPT OUT \u2192 Stop sequence immediately, mark 'Opted Out'",
          "NO RESPONSE after full sequence \u2192 Mark 'Cold Lead', enter win-back pool (Section 10)",
        ],
      },
    ],
  },
  {
    id: "post-booking",
    title: "9. Post-Booking Upsell & Klaviyo Handoff",
    color: COLORS.lime,
    colorSoft: COLORS.limeSoft,
    steps: [
      {
        shape: "rectangle",
        text: "Trigger Post-Booking Upsell SMS",
        subtext: "After a lead books, an automated SMS is sent offering add-ons before their appointment: 'Your appointment is confirmed! Want to add pet hair removal or a ceramic coating upgrade? Reply YES to add it to your booking.'",
        color: COLORS.lime,
      },
      {
        shape: "rectangle",
        text: "Push to Klaviyo (Existing System)",
        subtext: "For leads who created an account (with or without booking), their data is pushed to Klaviyo which handles ongoing email nurture sequences. Klaviyo is already established and running \u2014 this is a handoff, not a new build.",
        color: COLORS.lime,
      },
    ],
  },
  {
    id: "win-back",
    title: "10. Win-Back Campaigns (Cold Leads)",
    color: COLORS.red,
    colorSoft: COLORS.redSoft,
    steps: [
      {
        shape: "rectangle",
        text: "Monthly Win-Back SMS Campaign",
        subtext: "Cold leads who never booked receive a monthly re-engagement SMS with a seasonal offer or discount. Example: 'Hey [Name], spring cleaning season is here! Get 15% off your first Panda Hub detail. Book now: [link]'",
        color: COLORS.red,
      },
      {
        shape: "diamond",
        text: "DOES LEAD RE-ENGAGE?",
        subtext: "Track whether cold leads respond to win-back campaigns.",
        color: COLORS.red,
        branches: [
          "YES \u2192 Re-enter the system as a warm lead, AI follows up",
          "NO \u2192 Remain in cold pool, try again next month",
          "OPT OUT \u2192 Remove permanently",
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "11. Analytics & ROI Tracking",
    color: COLORS.purple,
    colorSoft: COLORS.purpleSoft,
    steps: [
      {
        shape: "document",
        text: "GOOGLE SHEETS / AIRTABLE DATA LOG",
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
          "Lead score (High / Mid / Low)",
          "Lead cost (source-specific)",
          "AI call outcome (booked, account created, quoted, no answer, not interested)",
          "Number of call attempts used (1, 2, or 3)",
          "Package selected & booking value",
          "Discount given (yes/no, code, amount)",
          "Motivation / Budget / Intent score",
          "AI operational cost per lead",
          "Revenue generated",
          "Profitability per lead and per source",
          "Conversion rate (e.g. 200 bookings / 1000 leads = 20%)",
          "A/B test results per SMS template variant",
        ],
      },
      {
        shape: "rectangle",
        text: "Custom Analytics Dashboard",
        subtext: "Visual dashboard showing: conversion funnel, cost per acquisition, revenue by source, AI vs human performance, lead score distribution, discount usage, A/B test winners, and overall ROI.",
        color: COLORS.purple,
      },
      {
        shape: "oval",
        text: "CONTINUOUS OPTIMIZATION",
        subtext: "Review data weekly. Improve AI scripts, adjust follow-up timing, refine discount strategy, update lead scoring weights, promote winning A/B templates, and scale what works.",
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
    oval: <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}><ellipse cx={s/2} cy={h/2} rx={s/2-1} ry={h/2-1} fill={fill} stroke={stroke} strokeWidth="1.5"/></svg>,
    rectangle: <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}><rect x="1" y="1" width={s-2} height={h-2} rx="3" fill={fill} stroke={stroke} strokeWidth="1.5"/></svg>,
    diamond: <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`${s/2},1 ${s-1},${s/2} ${s/2},${s-1} 1,${s/2}`} fill={fill} stroke={stroke} strokeWidth="1.5"/></svg>,
    parallelogram: <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}><polygon points={`${s*0.2},${h-1} 1,1 ${s*0.8},1 ${s-1},${h-1}`} fill={fill} stroke={stroke} strokeWidth="1.5"/></svg>,
    hexagon: <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}><polygon points={`${s*0.25},1 ${s*0.75},1 ${s-1},${h/2} ${s*0.75},${h-1} ${s*0.25},${h-1} 1,${h/2}`} fill={fill} stroke={stroke} strokeWidth="1.5"/></svg>,
    document: <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}><path d={`M1,1 L${s-1},1 L${s-1},${h*0.75} Q${s*0.5},${h*0.6} 1,${h-1} Z`} fill={fill} stroke={stroke} strokeWidth="1.5"/></svg>,
    largeBlock: <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}><rect x="1" y="1" width={s-2} height={h-2} rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray="3,2"/></svg>,
  };
  return shapes[shape] || shapes.rectangle;
}

function StepCard({ step }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${step.color}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, cursor: step.subpoints || step.branches ? "pointer" : "default", transition: "all 0.2s" }}
      onClick={() => (step.subpoints || step.branches) && setExpanded(!expanded)}
      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.surfaceHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.surface)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ flexShrink: 0, marginTop: 2 }}><ShapeIcon shape={step.shape} color={step.color} size={28} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>{step.text}</div>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, lineHeight: 1.5, fontFamily: "'Inter', system-ui, sans-serif" }}>{step.subtext}</div>
          {(step.subpoints || step.branches) && (
            <div style={{ fontSize: 11, color: step.color, marginTop: 6, fontFamily: "'JetBrains Mono', monospace", opacity: 0.8 }}>
              {expanded ? "\u25BE Click to collapse" : "\u25B8 Click to expand details"}
            </div>
          )}
          {expanded && step.subpoints && (
            <div style={{ marginTop: 10, paddingLeft: 4 }}>
              {step.subpoints.map((sp, i) => (
                <div key={i} style={{ fontSize: 12, color: COLORS.textMuted, padding: "6px 0 6px 16px", borderLeft: `2px solid ${step.color}44`, marginBottom: 4, lineHeight: 1.5, fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: "pre-line" }}>
                  <span style={{ color: step.color, fontWeight: 600, marginRight: 6 }}>{i + 1}.</span>{sp}
                </div>
              ))}
            </div>
          )}
          {expanded && step.branches && (
            <div style={{ marginTop: 10, paddingLeft: 4 }}>
              {step.branches.map((br, i) => (
                <div key={i} style={{ fontSize: 12, color: COLORS.text, padding: "6px 12px", background: step.color + "12", border: `1px solid ${step.color}33`, borderRadius: 6, marginBottom: 4, lineHeight: 1.4, fontFamily: "'JetBrains Mono', monospace" }}>
                  \u21B3 {br}
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
      <div onClick={() => setCollapsed(!collapsed)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: collapsed ? 0 : 14, padding: "10px 16px", background: section.colorSoft, border: `1px solid ${section.color}33`, borderRadius: 10, transition: "all 0.2s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: section.color + "22", border: `2px solid ${section.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: section.color, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{index + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>{section.title}</div>
          <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{section.steps.length} steps</div>
        </div>
        <div style={{ color: section.color, fontSize: 18, fontWeight: 300, transition: "transform 0.2s", transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}>{"\u25BE"}</div>
      </div>
      {!collapsed && (
        <div style={{ paddingLeft: 8 }}>
          {section.steps.map((step, i) => (
            <div key={i}>
              <StepCard step={step} />
              {i < section.steps.length - 1 && <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}><div style={{ width: 2, height: 16, background: section.color + "44" }} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PandaHubFlow() {
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: COLORS.accent, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Panda Hub \u00B7 AI Sales & Automation System</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0", letterSpacing: "-0.03em", lineHeight: 1.2 }}>Complete System Flowchart</h1>
          <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            End-to-end automation flow covering lead entry, AI sales calls, guided booking walkthrough, follow-ups, post-booking upsells, win-back campaigns, and ROI tracking. Click on any section or step to explore details.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <a href="https://wa.me/15878536069" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 8, background: COLORS.green, color: "#0F1117", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em", transition: "opacity 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact
            </a>
            <a href="https://docs.google.com/document/d/1-SktDv7a-NL4S9yxpzzD8tRPvbF-HwibfLx4On8dv8c/edit?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 8, background: "transparent", color: COLORS.accent, border: `1.5px solid ${COLORS.accent}`, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accentSoft; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Explore Document
            </a>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.textDim, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Flow Steps \u2014 Click sections & steps to expand</div>
        </div>
        {sections.map((section, i) => (
          <div key={section.id}>
            <SectionBlock section={section} index={i} />
            {i < sections.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", margin: "0 0 16px 0" }}>
                <svg width="20" height="24" viewBox="0 0 20 24"><path d="M10 0 L10 18 M4 14 L10 20 L16 14" fill="none" stroke={COLORS.textDim} strokeWidth="1.5" /></svg>
              </div>
            )}
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "20px 0", borderTop: `1px solid ${COLORS.border}`, marginTop: 20 }}>
          <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>Prepared by Waqar Hussain \u00B7 AI & Automation Consultant \u00B7 For Reza Ahmadi, Panda Hub</div>
        </div>
      </div>
    </div>
  );
}
