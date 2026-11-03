
interface AuditSealProps {
verified: boolean;
}

function AuditSeal({ verified }: AuditSealProps) {
const sealColor = verified ? "#16a34a" : "#dc2626";
const statusText = verified ? "VERIFIED" : "UNVERIFIED";

return ( <div className="audit-seal-container">
<svg
className="audit-seal"
viewBox="0 0 120 120"
width="120"
height="120"
role="img"
aria-label={`Audit ${statusText.toLowerCase()}`}
> <circle
       cx="60"
       cy="60"
       r="48"
       fill="none"
       stroke={sealColor}
       strokeWidth="4"
     />

    <circle
      cx="60"
      cy="60"
      r="38"
      fill="none"
      stroke={sealColor}
      strokeWidth="2"
      strokeDasharray="4 3"
    />

    {verified ? (
      <path
        d="M40 61 L53 74 L81 45"
        fill="none"
        stroke={sealColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <line
          x1="42"
          y1="42"
          x2="78"
          y2="78"
          stroke={sealColor}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="78"
          y1="42"
          x2="42"
          y2="78"
          stroke={sealColor}
          strokeWidth="7"
          strokeLinecap="round"
        />
      </>
    )}
  </svg>

  <span
    className={`audit-seal-status ${
      verified ? "verified" : "unverified"
    }`}
  >
    {statusText}
  </span>
</div>


);
}

export default AuditSeal;
