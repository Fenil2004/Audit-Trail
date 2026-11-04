import { useState } from "react";

interface HashPillProps {
  hash: string;
}

function HashPill({ hash }: HashPillProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy hash:", error);
    }
  };

  if (!hash) {
    return <span className="hash-pill">No Hash</span>;
  }

  return (
    <button
      type="button"
      className="hash-pill"
      onClick={handleCopy}
      title="Click to copy full hash"
      aria-label="Copy SHA-256 hash"
    >
      {copied ? "Copied!" : `${hash.slice(0, 12)}...`}
    </button>
  );
}

export default HashPill;