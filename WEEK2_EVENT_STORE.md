# Week 2 Milestone Report: Append-Only Event Store & Cryptographic Hash Chaining

**Project:** Audit Trail — Event-Sourced Logistics Ledger & Forensic Dashboard  
**Milestone Version:** `v2.0-week2-event-store`  
**Focus:** Append-Only Persistence, Cryptographic SHA-256 Hash Chaining, Database Immutability Enforcement, Chronological Timeline UI.

---

## 1. Objectives & Overview

In Week 2, the core Event Sourcing persistence engine and tamper-evident cryptographic chain were designed and implemented.

Traditional database models rely on destructive `UPDATE` statements that erase previous states. Under our Event Sourcing architecture:
1. State mutations are committed exclusively as immutable events.
2. Every event links to its chronological predecessor using a SHA-256 digest (`prevHash -> eventHash`).
3. Modifying even a single character or millisecond in past events cascades through the chain, instantly invalidating all downstream block hashes.

```
+------------------------------------+       +------------------------------------+
| Block 1 (Genesis)                  |       | Block 2                            |
| version: 1                         |       | version: 2                         |
| prevHash: "0000...0000" (64 Zeros) | ----> | prevHash: hash(Block 1)            |
| eventHash: 9e8a71c...              |       | eventHash: 4b21d9f...              |
+------------------------------------+       +------------------------------------+
```

---

## 2. Technical Architecture & Cryptographic Engine

### 2.1 Cryptographic Hash Formula
For every event $k$:
$$\text{eventHash}_k = \text{SHA-256}(\text{prevHash}_k \parallel \text{aggregateId} \parallel \text{version}_k \parallel \text{eventType} \parallel \text{timestamp} \parallel \text{canonicalJson}(\text{payload}))$$

- **Canonical JSON Serialization (`src/domain/crypto/hashChaining.ts`)**:
  JSON object keys are recursively sorted before hashing to eliminate inconsistencies caused by JavaScript object key enumeration order across platforms.
- **Genesis Block Anchor**:
  Event version 1 is permanently anchored to 64 hex zeros:
  `0000000000000000000000000000000000000000000000000000000000000000`

### 2.2 Schema & Database Immutability Defense (`src/eventStore/EventModel.ts`)
The `events` MongoDB collection strictly prevents mutations at the ORM layer:
- **Compound Unique Index**: `{ aggregateId: 1, version: 1 }` guarantees monotonic version sequence with zero duplicates.
- **Mongoose Guard Hooks**:
  Pre-save and query middleware intercept and abort all mutating operations:
  ```typescript
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne',
              'deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
    throw new ImmutabilityViolationError('Audit Trail Event Store is append-only. Mutations strictly forbidden.');
  });
  ```
- **Simulate Tamper Attack Endpoint (`POST /api/commands/shipments/simulate-tamper-attack`)**:
  Demonstrates the database defense in real time by triggering a direct `updateOne` and proving that it is caught and rejected with an HTTP 403 response.

### 2.3 Chronological Timeline UI (`src/components/ChronologicalTimeline.tsx`)
- Renders events in vertical order with colored indicator nodes by event type.
- Shows actor metadata, timestamp (UTC), expandable raw JSON payload view, and SHA-256 hash pills with one-click copy.

---

## 3. Verification & Unit Tests (`src/tests/eventSourcing.test.ts`)

```bash
npm test
```
- **Test 1:** Deterministic SHA-256 calculation outputs valid 64-character hex strings.
- **Test 2:** Full-chain verification verifies unbroken linkage from Genesis to Version $N$.
- **Test 3:** Tampering detection: intentionally altering an in-memory event payload fails chain validation and pinpoints the exact compromised version.
- **Test 4:** Direct `updateOne` and `deleteOne` database operations are intercepted by Mongoose hooks and throw `ImmutabilityViolationError`.

---

## 4. Git Release Reference
- **Commit Message:** `feat(week2): implement append-only event store, SHA-256 hash chaining and chronological timeline UI`
- **Git Tag:** `v2.0-week2-event-store`
