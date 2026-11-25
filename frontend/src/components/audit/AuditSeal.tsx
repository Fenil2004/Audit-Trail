import type { VerificationStatus } from "../../data/fetchAuditEvents";

interface AuditSealProps {
  status: VerificationStatus | "CHECKING" | "UNVERIFIED";
  message: string;
}

export default function AuditSeal({
  status,
  message,
}: AuditSealProps) {
  const verified = status === "VERIFIED";
  const tampered = status === "TAMPERED";
  const checking = status === "CHECKING";

  const label = checking
    ? "CHECKING"
    : verified
      ? "VERIFIED"
      : tampered
        ? "TAMPERED"
        : "UNVERIFIED";

  const accent = verified
    ? "#34d399"
    : tampered
      ? "#fb7185"
      : "#fbbf24";

  return (
    <section className="seal-card">
      <div className="seal-heading">
        <p className="eyebrow">SECURITY STATUS</p>

        <span className={`seal-indicator ${label.toLowerCase()}`}>
          {label}
        </span>
      </div>

      <svg
        className="audit-seal"
        viewBox="0 0 220 220"
        role="img"
        aria-label={`Audit integrity status: ${label}`}
      >
        <circle
          cx="110"
          cy="110"
          r="96"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          opacity="0.5"
        />

        <circle
          cx="110"
          cy="110"
          r="82"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        <circle
          cx="110"
          cy="110"
          r="65"
          fill="#111c2e"
          stroke="#334155"
          strokeWidth="2"
        />

        <path
          d="M110 65 L145 80 V108 C145 132 130 148 110 158 C90 148 75 132 75 108 V80 Z"
          fill="none"
          stroke={accent}
          strokeWidth="3"
        />

        {verified ? (
          <path
            d="M91 108 L104 121 L130 94"
            fill="none"
            stroke={accent}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M96 95 L124 123 M124 95 L96 123"
            fill="none"
            stroke={accent}
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}

        <text
          x="110"
          y="184"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          letterSpacing="2"
          fill="#e2e8f0"
        >
          {label}
        </text>
      </svg>

      <h3>
        {checking
          ? "Checking Integrity"
          : verified
            ? "Integrity Verified"
            : tampered
              ? "Integrity Compromised"
              : "Verification Required"}
      </h3>

      <p className="seal-description">{message}</p>
    </section>
  );
}