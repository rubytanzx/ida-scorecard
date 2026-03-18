"use client";

import { useState, useEffect, useRef } from "react";
import { IconSparkles, IconX } from "@tabler/icons-react";
import ChatMessage from "./ChatMessage";
import type { Message } from "@/data/mockInteraction";

const TEXT: React.CSSProperties = {
  fontFamily: "'Open Sans', sans-serif",
  fontSize: 14,
  lineHeight: "20px",
};

interface Props {
  open?: boolean;
  messages?: Message[];
  chatBottom?: number;
}

export default function AIChatPanel({ open: externalOpen, messages = [], chatBottom = 150 }: Props) {
  // null = not explicitly set by user; defer to externalOpen
  const [userOverride, setUserOverride] = useState<boolean | null>(null);
  const open = userOverride !== null ? userOverride : !!externalOpen;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* AI Chat floating button (hidden when panel is open) */}
      {!open && <button
        aria-label="AI Chat"
        onClick={() => setUserOverride(!open)}
        style={{
          position: "fixed",
          bottom: 166,
          right: 18,
          width: 66,
          height: 66,
          borderRadius: "50%",
          border: `1px solid ${open ? "#0b6fd3" : "#E5E5E5"}`,
          background: open ? "#EBF3FC" : "#FFFFFF",
          boxShadow: "0px 2px 4px 0px rgba(12,35,60,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 50,
          color: open ? "#0b6fd3" : "#616161",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
      >
        <IconSparkles size={24} stroke={1.5} />
      </button>}

      {/* AI Co-pilot Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 96,
            bottom: chatBottom,
            right: 18,
            transition: "bottom 0.15s ease",
            width: 468,
            background: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: 16,
            boxShadow: "0px 2px 4px 0px rgba(12,35,60,0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 49,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 20px",
              borderBottom: "1px solid #E5E5E5",
              flexShrink: 0,
            }}
          >
            <IconSparkles size={24} stroke={1.5} color="#616161" />
            <span
              style={{
                flex: 1,
                fontFamily: "'Open Sans', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: "#616161",
                lineHeight: "140%",
              }}
            >
              Ask AI
            </span>
            <button
              onClick={() => setUserOverride(false)}
              style={{
                width: 24,
                height: 24,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#616161",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <IconX size={18} stroke={1.5} />
            </button>
          </div>

          {/* Conversation */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.length > 0 ? (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              // Fallback static content when no dynamic messages
              <>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      background: "#002244",
                      borderRadius: "20px 20px 0px 20px",
                      padding: 16,
                      maxWidth: "100%",
                    }}
                  >
                    <p style={{ ...TEXT, color: "#FFFFFF", margin: 0 }}>
                      I am an Operations Officer writing the new CPF for Mexico. Using FY25 scorecard
                      data, give me a ranked list of 3–5 priority Outcome Areas where Mexico has the
                      biggest gaps compared to Chile, Brazil, Colombia and Peru. For each gap, show me
                      which projects in the current portfolio are contributing to that indicator, how much,
                      and whether that contribution is growing or stalling. Flag where evidence is limited.
                      I need this as a brief I can take into a decision meeting
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ ...TEXT, color: "#1F2937", margin: 0, whiteSpace: "pre-line" }}>
                    {`I pulled the Mexico country-level data from the WBG Scorecard FY25 Explorer and compared it against four regional peers — Chile, Brazil, Colombia, and Peru — to flag where the biggest gaps are for the CPF.\n\nA few caveats up front before diving in. The Scorecard doesn't disaggregate portfolio results by country in the DATA tab (everything shows "--"), so the portfolio figures I'm referencing come from the EXPLORER view and can't be trended over time. This means I can tell you what's active, but not whether it's accelerating or stalling. I'd strongly recommend cross-referencing with Operations Portal data before the decision meeting.\n\nHere's the indicator snapshot across the peer group:`}
                  </p>

                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontFamily: "'Open Sans', sans-serif",
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "1px solid #CFCFCF" }}>
                          {["Indicator", "Mexico", "Chile", "Brazil"].map((h) => (
                            <th
                              key={h}
                              style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Poverty @ $3/d…", "2.3%", "0.5%", "3.8%"],
                          ["Poverty @ $8.3…", "27.4%", "5.7%", "23.4%"],
                          ["Children can't r…", "47.6%", "27.2%", "46.9%"],
                        ].map((row) => (
                          <tr key={row[0]} style={{ borderBottom: "1px solid #F3F4F6" }}>
                            {row.map((cell, i) => (
                              <td
                                key={i}
                                style={{ padding: "10px 12px", color: "#374151", fontWeight: i === 0 ? 500 : 400 }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
