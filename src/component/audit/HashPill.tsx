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

const shortHash =
hash.length > 16
? `${hash.slice(0, 8)}...${hash.slice(-8)}`
: hash;

return ( <button
   type="button"
   className="hash-pill"
   onClick={handleCopy}
   title="Click to copy full hash"
 > <span>{shortHash}</span> <span className="hash-copy-label">
{copied ? "Copied!" : "Copy"} </span> </button>
);
}

export default HashPill;
