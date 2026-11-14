interface AuditSealProps {
  status: "checking" | "verified" | "unverified";
}

function AuditSeal({ status }: AuditSealProps) {
  const verified = status === "verified";
  const checking = status === "checking";

  return (
    <div
      className={`audit-seal ${
        checking ? "checking" : verified ? "verified" : "unverified"
      }`}
      role="status"
      aria-label={
        checking
          ? "Checking audit"
          : verified
          ? "Audit verified"
          : "Audit verification failed"
      }
    >
      <svg
        width="70"
        height="70"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        />

        {checking ? (
          <text
            x="50"
            y="62"
            textAnchor="middle"
            fontSize="38"
            fill="currentColor"
          >
            ...
          </text>
        ) : verified ? (
          <path
            d="M28 51 L43 66 L73 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <path
              d="M35 35 L65 65"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M65 35 L35 65"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      <h3>
        {checking
          ? "Checking..."
          : verified
          ? "Verified"
          : "Tampering Detected"}
      </h3>

      <p>
        {checking
          ? "Verifying shipment records..."
          : verified
          ? "Audit verification successful"
          : "Audit verification failed"}
      </p>
    </div>
  );
}

export default AuditSeal;