import React from "react";

/**
 * BalanceBayDemo
 * ----------------------------------------------------------------------------
 * Self-contained iMessage-style demo of an EliseAI ResidentAI text thread.
 * - No external dependencies (no Tailwind, no CSS files) — safe to drop into
 *   any React app, including Webflow's React/code-component setup.
 * - All styling is inline so it renders identically regardless of host CSS.
 * - Conversation is data-driven via the `messages` prop; defaults are included.
 *
 * Usage:
 *   import BalanceBayDemo from "./BalanceBayDemo";
 *   <BalanceBayDemo />                         // uses default thread
 *   <BalanceBayDemo contactName="Elise · Balance Bay" />
 *   <BalanceBayDemo messages={customArray} />  // override the conversation
 */

export type MessageSender = "them" | "me";

export interface MessageLink {
  label: string;
  href: string;
}

export interface Message {
  /** "them" = property (gray, left), "me" = resident (blue, right) */
  from: MessageSender;
  /** Body text. Use \n for line breaks. */
  text: string;
  /** Adds extra spacing above to mark a new exchange. */
  gap?: boolean;
  /** Optional clickable link appended after the text. */
  link?: MessageLink;
}

export interface BalanceBayDemoProps {
  contactName?: string;
  phoneNumber?: string;
  avatarInitial?: string;
  messages?: Message[];
}

const DEFAULT_MESSAGES: Message[] = [
  {
    from: "them",
    text:
      "Hi Ginny! My name is Elise. I'll be your resident assistant going forward. If you need help with maintenance, amenities, general questions about the property, or your renewal process, just let me know!",
  },
  { from: "me", text: "My dishwasher isn't working", gap: true },
  { from: "me", text: "Also the light in living room is flickering" },
  {
    from: "them",
    gap: true,
    text:
      "Thank you for letting me know about the dishwasher not working and the flickering light in your living room. I've submitted a work order for the flickering light in your living room (ref #32393216) and will submit a work order for the dishwasher issue.\n\nDoes the maintenance team have permission to enter your apartment if you're not present?",
  },
  { from: "me", text: "Yes they can", gap: true },
  {
    from: "them",
    gap: true,
    text:
      "Thank you for confirming permission to enter. I understand your dishwasher is not working and the light in your living room is flickering. The maintenance team is aware of both issues and will process your requests as soon as possible. We will follow up as soon as we have an update.",
  },
  {
    from: "them",
    gap: true,
    text:
      "Hi Ginny! Great news! The work on the dishwasher and flickering light in your living room (ref #32393216) is completed.\n\nWe'd love to hear how your recent maintenance service was. Could you answer a couple quick questions?\n\n1. On a scale of 1 to 5, how satisfied are you with the maintenance service you received? (1 = very dissatisfied, 5 = very satisfied)\n2. Any comments or feedback you'd like to share?",
  },
  {
    from: "me",
    gap: true,
    text:
      "5 work was completed quickly, the tech was really nice, thanks for making it happen fast",
  },
  {
    from: "them",
    gap: true,
    text:
      "Thank you for sharing your feedback, Ginny. Please let me know if you have any further questions or need additional assistance.",
  },
  {
    from: "them",
    gap: true,
    text:
      "Hi Ginny, it's almost time for renewals!\n\nOn a scale of 1-5, how likely are you to renew for another year? (1 = very unlikely, 5 = very likely)\n\nOn a scale of 1-5, how reasonable do you feel your current rent is for the value of your home and community? (1 = very unreasonable, 5 = very reasonable)\n\nIs there anything you'd like to share with us as you decide?",
  },
  {
    from: "me",
    gap: true,
    text:
      "4, work orders are completed quickly, though I wish the appliances are newer",
  },
  {
    from: "them",
    gap: true,
    text:
      "Thank you for sharing your feedback, Ginny. I appreciate you letting us know about wanting more updated appliances. Your feedback is important to us, and I will make sure your concerns are noted.",
  },
  {
    from: "them",
    gap: true,
    text:
      "Hi Ginny,\n\nThis is Elise from Balance Bay. We wanted to reach out because your lease is coming up for renewal - it's currently set to end on 08/26/2027.\n\nWe'd love to have you stay! Your renewal offers are ready and waiting for you.\n\nView your options here: ",
    link: {
      label: "r.eliseai.com/renewals/db0a137a",
      href: "https://r.eliseai.com/renewals/db0a137a",
    },
  },
];

const COLORS = {
  phone: "#000",
  screen: "#f3f4f6",
  them: "#e9e9eb",
  themText: "#000",
  me: "#0a84ff",
  meText: "#fff",
  link: "#0a84ff",
  meLink: "#cfe5ff",
} as const;

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    padding: "24px 12px",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  },
  phone: {
    width: 390,
    maxWidth: "100%",
    background: COLORS.phone,
    borderRadius: 48,
    padding: 12,
    boxShadow: "0 0 0 2px #2a2a2e, 0 30px 80px rgba(0,0,0,.45)",
    position: "relative",
  },
  screen: {
    background: COLORS.screen,
    borderRadius: 38,
    overflow: "hidden",
    height: 780,
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  notch: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: 150,
    height: 28,
    background: "#000",
    borderRadius: "0 0 18px 18px",
    zIndex: 5,
  },
  topbar: {
    background: "rgba(247,247,247,.92)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    padding: "42px 16px 10px",
    textAlign: "center",
    borderBottom: "1px solid #d8d8dd",
    position: "sticky",
    top: 0,
    zIndex: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    margin: "0 auto 5px",
    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 20,
  },
  name: { fontSize: 15, fontWeight: 600, color: "#000" },
  sub: { fontSize: 11, color: "#8a8a8e", marginTop: 2 },
  thread: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 14px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  bubbleBase: {
    padding: "9px 14px",
    borderRadius: 20,
    fontSize: 14.5,
    lineHeight: 1.38,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    maxWidth: "100%",
  },
};

function Row({ msg }: { msg: Message }) {
  const isMe = msg.from === "me";
  const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    maxWidth: "78%",
    alignSelf: isMe ? "flex-end" : "flex-start",
    alignItems: isMe ? "flex-end" : "flex-start",
    marginTop: msg.gap ? 12 : 3,
  };
  const bubbleStyle: React.CSSProperties = {
    ...styles.bubbleBase,
    background: isMe ? COLORS.me : COLORS.them,
    color: isMe ? COLORS.meText : COLORS.themText,
    borderBottomRightRadius: isMe ? 6 : 20,
    borderBottomLeftRadius: isMe ? 20 : 6,
  };
  return (
    <div style={rowStyle}>
      <div style={bubbleStyle}>
        {msg.text}
        {msg.link && (
          <a
            href={msg.link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: isMe ? COLORS.meLink : COLORS.link,
              textDecoration: "underline",
            }}
          >
            {msg.link.label}
          </a>
        )}
      </div>
    </div>
  );
}

export default function BalanceBayDemo({
  contactName = "Elise · Balance Bay",
  phoneNumber = "+1 (254) 856-0609",
  avatarInitial = "E",
  messages = DEFAULT_MESSAGES,
}: BalanceBayDemoProps): React.ReactElement {
  return (
    <div style={styles.wrap}>
      <div style={styles.phone}>
        <div style={styles.screen}>
          <div style={styles.notch} />
          <div style={styles.topbar}>
            <div style={styles.avatar}>{avatarInitial}</div>
            <div style={styles.name}>{contactName}</div>
            <div style={styles.sub}>{phoneNumber}</div>
          </div>
          <div style={styles.thread}>
            {messages.map((msg, i) => (
              <Row key={i} msg={msg} />
            ))}
            <div style={{ height: 18 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
