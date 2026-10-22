interface AuditSealProps {
  verified: boolean;
}

export default function AuditSeal({
  verified,
}: AuditSealProps) {
  const label = verified ? "VERIFIED" : "UNVERIFIED";

  return (
    <section className="seal-card">
      <p className="eyebrow">CRYPTOGRAPHIC INTEGRITY</p>

      <svg
        className="audit-seal"
        viewBox="0 0 220 220"
        role="img"
        aria-label={`Audit integrity status: ${label}`}
      >
        <defs>
          <linearGradient id="seal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        <circle
          cx="110"
          cy="110"
          r="98"
          fill="none"
          stroke="url(#seal-gradient)"
          strokeWidth="2"
        />

        <circle
          cx="110"
          cy="110"
          r="84"
          fill="none"
          stroke="url(#seal-gradient)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />

        <circle
          cx="110"
          cy="110"
          r="65"
          fill="#101827"
          stroke="#334155"
          strokeWidth="2"
        />

        <path
          d="M110 65 L145 80 V108 C145 132 130 148 110 158 C90 148 75 132 75 108 V80 Z"
          fill="none"
          stroke={verified ? "#67e8f9" : "#fb7185"}
          strokeWidth="3"
        />

        {verified ? (
          <path
            d="M91 108 L104 121 L130 94"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M96 95 L124 123 M124 95 L96 123"
            fill="none"
            stroke="#fb7185"
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

      <h3>{verified ? "Integrity Verified" : "Verification Required"}</h3>

      <p className="seal-description">
        {verified
          ? "The current verification check passed."
          : "The audit integrity check has not passed."}
      </p>

      <div className={`seal-status ${verified ? "is-verified" : "is-unverified"}`}>
        <span className="status-dot" />
        {label}
      </div>
    </section>
  );
}