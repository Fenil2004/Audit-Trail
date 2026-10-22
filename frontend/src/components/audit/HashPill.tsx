import { useState } from "react";

interface HashPillProps {
  hash: string;
}

export default function HashPill({ hash }: HashPillProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="hash-container">
      <button
        type="button"
        className="hash-pill"
        onClick={() => setExpanded((value) => !value)}
        title="Click to show or hide the full hash"
        aria-expanded={expanded}
      >
        <span className="hash-icon" aria-hidden="true">
          #
        </span>

        <span>
          {expanded ? hash : `${hash.slice(0, 10)}...${hash.slice(-8)}`}
        </span>

        <span className="hash-expand" aria-hidden="true">
          {expanded ? "−" : "+"}
        </span>
      </button>

      <button
        type="button"
        className="copy-hash-button"
        onClick={copyHash}
        aria-label="Copy SHA-256 hash"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}