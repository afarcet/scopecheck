"use client";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export function QRButton({ url }: { url: string }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          background: "var(--bg3)", color: "var(--white-mid)", border: "1px solid var(--border2)",
          fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "8px 12px", cursor: "pointer",
        }}
      >
        ▣ QR
      </button>

      {show && (
        <div
          onClick={() => setShow(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            zIndex: 1000, cursor: "pointer",
          }}
        >
          <div style={{ background: "#fff", padding: "24px", marginBottom: "20px" }}>
            <QRCodeCanvas value={url} size={260} />
          </div>
          <p style={{ fontSize: "12px", color: "var(--white-mid)", letterSpacing: "0.06em" }}>{url}</p>
          <p style={{ fontSize: "10px", color: "var(--white-dimmer)", marginTop: "12px" }}>tap anywhere to close</p>
        </div>
      )}
    </>
  );
}
