# Audit Trail: Comprehensive System Capabilities & Functionality Guide

This document provides an exhaustive reference of all the features, operations, safeguards, and user-facing capabilities implemented in the **Audit Trail** Event-Sourced Logistics Ledger.

---

## 1. Executive Summary

**Audit Trail** is an enterprise-grade, tamper-evident logistics platform engineered specifically for cold-chain pharmaceutical distribution, high-value tech transit, and regulated supply chains. It replaces traditional, lossy CRUD database operations with an **append-only event store**, **cryptographic SHA-256 hash chaining**, **CQRS (Command Query Responsibility Segregation)**, and **deterministic state reconstruction**.

---

## 2. Core Architectural Functionalities

### 2.1 Append-Only Event Store (Zero Overwrites)
* **Permanent History**: The database never issues `UPDATE` or `DELETE` commands. Every lifecycle transition is committed as an immutable domain event.
* **Granular Event Types**:
  * `CONTAINER_CREATED`: Genesis block establishing container ID, dimensions, origin, destination, cargo manifest, baseline temperature limits, and initial security seal.
  * `LOADED_ON_CARRIER`: Logs handoff to intermodal transport (Flight, Cargo Vessel, Refrigerated Truck, Rail) with carrier name, voyage/flight number, departure hub, and designated custodian.
  * `TELEMETRY_RECORDED`: Ingests periodic IoT sensor feeds including ambient temperature (°C), relative humidity (%), battery health (%), GPS/location, and shock/impact alarms.
  * `TEMPERATURE_SPIKE`: Automatically synthesized by business rules whenever ambient temperature exceeds safe limits (`minTempLimit` or `maxTempLimit`).
  * `CUSTOMS_INSPECTED`: Formal border checkpoint logging with port code, inspector name, inspection verdict (`PASSED`, `FLAGGED_FOR_AUDIT`, `QUARANTINED`), and physical seal condition.
  * `SEAL_VERIFIED`: Security seal status tracking (`INTACT`, `BROKEN`, `REPLACED`, `UNASSIGNED`).
  * `ARRIVED_AT_DESTINATION`: Concludes transit, recording destination hub arrival, final cargo condition (`PRISTINE`, `COMPROMISED`, `PENDING_SURVEY`), receiver identity, and digital signature.
  * `CARGO_UNLOADED` / `INVENTORY_DISPATCHED`: Manages post-arrival inventory drawdown and unit quantity adjustments.

### 2.2 CQRS Architecture (Clean Split of Reads and Writes)
* **Write Pipeline (Commands)**:
  * Ingests intent via strongly typed JSON payloads (`/api/commands/shipments/*`).
  * Validates structure and types with strict **Zod** schemas.
  * Enforces business invariants and checks Optimistic Concurrency Control (`expectedVersion`).
  * Computes cryptographic hashes and appends to the `events` collection.
  * Returns lightweight execution acknowledgments (version, hash, timestamp) without expensive read payloads.
* **Read Pipeline (Queries)**:
  * Serves sub-millisecond dashboard queries via pre-computed projections (`shipment_projections`).
  * Performs dynamic on-the-fly event stream replay for historical investigations and audit certifications.
* **Read Model Self-Healing & Full Replay**:
  * Endpoint `POST /api/queries/rebuild-projections` enables complete system recovery or projection schema migration by purging read tables and replaying all raw events from Genesis.

### 2.3 Deterministic State Reconstruction (Pure Reducer Fold)
* **No Static State Dependency**: Aggregate state is not stored as fixed ground truth; it is a mathematical derivation of its event history:
  $$\text{State}_N = \text{fold}(\text{Events}_{1 \dots N})$$
* **Arbitrary Historic State Querying**: State can be projected up to any historical version ($V$) or ISO timestamp ($T$), allowing auditors to answer questions such as:
  * *"Who held custody of this container on Tuesday at 14:32 UTC?"*
  * *"What was the recorded ambient temperature when the container entered Dubai airspace?"*

---

## 3. Cryptographic Security & Tamper Evidence

### 3.1 SHA-256 Hash Chaining (Blockchain-Lite)
* **Canonical JSON Stringification**: JSON payloads are sorted recursively by key prior to hashing (`canonicalJsonStringify`), ensuring identical hash output regardless of platform or JSON key ordering.
* **Cryptographic Block Chaining**: Every event computes its hash from its own metadata plus the cryptographic digest of the prior event:
  $$\text{eventHash} = \text{SHA-256}(\text{prevHash} \parallel \text{aggregateId} \parallel \text{version} \parallel \text{eventType} \parallel \text{timestamp} \parallel \text{canonicalPayload})$$
* **Genesis Anchor**: Event Version 1 is permanently anchored to a 64-character zero string (`0000000000000000000000000000000000000000000000000000000000000000`).
* **Cascade Invalidation**: Altering even one byte or timestamp in an earlier event invalidates every subsequent hash in the ledger, making retroactive tampering mathematically impossible without detection.

### 3.2 Automated Cryptographic Ledger Verification
* **Full-Chain Auditor Engine** (`GET /api/queries/shipments/:id/audit-verification`):
  * Sequentially traverses all events from Version 1 to $N$.
  * Verifies monotonic version sequence continuity (no gaps: $1, 2, 3 \dots$).
  * Confirms `prevHash` of block $k$ matches `eventHash` of block $k-1$.
  * Recalculates `eventHash` from raw canonical fields to guarantee zero content alteration.
  * Outputs verification report: `isValid`, `totalEvents`, `genesisHash`, `latestHash`, and exact `brokenAtVersion` if an anomaly exists.

### 3.3 Database-Level Immutability Defense
* **Driver-Level Guard Hooks**: Mongoose pre-save and pre-query hooks actively intercept and reject all mutation methods:
  * `updateOne`, `updateMany`, `findOneAndUpdate`, `replaceOne`
  * `deleteOne`, `deleteMany`, `findOneAndDelete`
* **Automated Exception**: Rejects forbidden actions with an explicit `ImmutabilityViolationError` (HTTP 403 Forbidden).
* **Simulate Tamper Attack Endpoint** (`POST /api/commands/shipments/simulate-tamper-attack`):
  * Provides a live diagnostic test where the system attempts a direct database update and returns proof of the intercepted exception.

---

## 4. Concurrency Protection (OCC)

### 4.1 Optimistic Concurrency Control (OCC)
* **Write Collision Safeguard**: Prevents multiple operators, automated IoT sensors, or edge gateways from overwriting each other’s updates.
* **Expected Version Checking**: Every state-changing command requires an `expectedVersion` parameter. If the client’s `expectedVersion` does not match the current aggregate version, the write is immediately aborted.
* **Database Invariant**: MongoDB compound unique index `{ aggregateId: 1, version: 1 }` guarantees that duplicate version numbers can never be inserted even under extreme concurrency.
* **HTTP 409 Conflict Response**: Aborted writes return a structured `ConcurrencyConflictError` containing `expectedVersion` and `currentVersion`, prompting the client to fetch fresh state and re-evaluate.

### 4.2 Interactive OCC Collision Simulator
* An interactive UI simulator that allows users to test the OCC safeguard with a single click.
* Submits a command intentionally referencing a stale version ($V - 1$) and visualizes the instantaneous HTTP 409 rejection and diagnostic error payload in real time.

---

## 5. Time-Travel & Historical State Scrubbing

### 5.1 Interactive Time-Travel Scrubber ("Rewind Time")
* **Range Scrubber Slider**: A horizontal slider spanning from Genesis (Version 1) to Current Version ($N$).
* **Side-by-Side State Comparison**: Dragging the slider dynamically folds events up to the selected version, rendering:
  * **Historic Reconstructed State**: Location, status, ambient temperature, custodian, and active carrier at that exact historical moment.
  * **Current Live State**: Modern live telemetry for direct baseline comparison.
* **One-Click Controls**:
  * **Reset to Live** (`RotateCcw`): Jumps instantly back to latest live state.
  * **Jump to Genesis** (`SkipBack`): Jumps directly to Version 1 container creation.

### 5.2 Animated Event Playback Mode
* Built-in automated replay engine (`Play` / `Pause`).
* Automatically advances through the event stream at 1.4-second intervals, providing a visual demonstration of the shipment’s lifecycle progression from origin packaging to final destination.

---

## 6. Cold-Chain IoT Telemetry & Excursions

### 6.1 Real-Time Telemetry Tracking
* Ingests sensor data feeds including temperature in Celsius, relative humidity percentage, IoT tag battery percentage, and shock/impact events.
* Maintains high-performance time-series data for charting and forensic correlation.

### 6.2 Automated Temperature Excursion Detection
* Server-side evaluation against container threshold limits (`minTempLimit` and `maxTempLimit`).
* Automatically calculates excursion delta (e.g. `+19.2°C` above threshold).
* Classifies excursion severity (`WARNING` vs. `CRITICAL`).
* Synthesizes and appends an explicit `TEMPERATURE_SPIKE` domain event with detailed risk assessment.
* Flags read projections with `status = "EXCURSION_ALERT"` and increments `excursionCount`.

### 6.3 Recharts Time-Series Telemetry Chart
* High-contrast dark-mode visualization of temperature and humidity curves over time.
* **Safety Boundary Reference Lines**: Horizontal dashed indicators marking certified temperature limits.
* **Event Milestone Markers**: Pinned annotations marking exactly when lifecycle events occurred (e.g., loaded onto aircraft, temperature breach, customs inspection).
* **Interactive Tooltip**: Hover inspection showing exact version, event type, location, temperature, humidity, and operator notes.

---

## 7. Interactive Frontend Dashboard

Built with a **Master Editorial Design System** (Warm Cream `#FAF9F5`, Dark Navy `#181715`, Terracotta Coral `#CC785C`, Serif Display Typography *Cormorant Garamond*, Monospace *JetBrains Mono*, Body *Inter*).

### 7.1 Dashboard Components & Capabilities
| Component | Functionality & Capabilities |
|---|---|
| **Top Navigation Bar** | Real-time connection pulse, aggregate selector pills/dropdown, instant ledger refresh button, and "+ Dispatch Command" trigger. |
| **Shipment Overview Hero Card** | Container status badge (`IN_TRANSIT`, `EXCURSION_ALERT`, `CUSTOMS_HOLD`, `DELIVERED`), route line, temperature readout, custodian, version indicator, hash copy utility, and quick audit triggers. |
| **Time-Travel Scrubber** | Horizontal version slider, automated animated playback, step-by-step state reconstruction, and historical vs. live comparative display. |
| **Telemetry Sensor Chart** | Dual-axis temperature & humidity curves, safe operating boundary lines, event flag pins, and custom audit tooltips. |
| **OCC Collision Demo** | Interactive race-condition simulator demonstrating HTTP 409 rejection and version lock safeguards. |
| **Chronological Event Stream** | Vertical timeline with version badges, relative and exact UTC timestamps, actor roles, copyable hash pills, and expandable raw JSON payload drawers. |
| **Cryptographic Audit Modal** | Full-chain integrity verification report, mathematical hash sequence breakdown, 1-click clipboard copy, and tamper attack test. |
| **Command Dispatch Modal** | Form to issue live domain commands: Record Telemetry, Dispatch Carrier, Customs Inspection, Arrive at Destination. |
| **Immutability Defense Banner** | Top-level alert dynamically notifying operators when an unauthorized database update attempt is caught and blocked. |
| **Regulatory Callout Card** | Highlights compliance alignment with FDA 21 CFR Part 11, GAMP 5, and EU Annex 11. |

---

## 8. Available Commands & Mutations (API & UI)

Users and automated agents can issue the following operations via the UI modal or REST endpoints:

1. **`createShipment` (`POST /api/commands/shipments/create`)**
   * Parameters: `aggregateId`, `containerNumber`, `origin`, `destination`, `cargoDescription`, `quantityUnits`, `minTempLimit`, `maxTempLimit`, `sealNumber`, `actor`, `role`.
   * Enforces that `minTempLimit < maxTempLimit` and that the aggregate ID is unique.

2. **`dispatchShipment` (`POST /api/commands/shipments/dispatch`)**
   * Parameters: `aggregateId`, `expectedVersion`, `carrierName`, `carrierType`, `voyageOrFlightNumber`, `departureHub`, `custodian`, `actor`, `role`.
   * Transitions status to `IN_TRANSIT`. Prevents dispatching containers already delivered.

3. **`recordTelemetry` (`POST /api/commands/shipments/record-telemetry`)**
   * Parameters: `aggregateId`, `expectedVersion`, `location`, `temperature`, `humidity`, `batteryLevelPct`, `shockDetected`, `actor`, `role`.
   * Evaluates limits; automatically raises `TEMPERATURE_SPIKE` if limits are breached.

4. **`inspectCustoms` (`POST /api/commands/shipments/inspect-customs`)**
   * Parameters: `aggregateId`, `expectedVersion`, `portCode`, `inspectorName`, `inspectionResult`, `sealIntact`, `notes`, `actor`, `role`.
   * Updates seal status and transitions status to `CUSTOMS_INSPECTION` if flagged or quarantined.

5. **`arriveAtDestination` (`POST /api/commands/shipments/arrive`)**
   * Parameters: `aggregateId`, `expectedVersion`, `destinationHub`, `finalCondition`, `receivedBy`, `receiverSignature`, `actor`, `role`.
   * Marks shipment as `DELIVERED`, records final receiver QA signoff and digital signature.

6. **`simulateTamperAttack` (`POST /api/commands/shipments/simulate-tamper-attack`)**
   * Parameters: `aggregateId`.
   * Diagnostic execution attempting unauthorized database mutation; returns caught error details.

---

## 9. Pre-Seeded Real-World Industry Scenarios

The system includes pre-seeded real-world demonstration aggregates:

1. **`SHIP-PHARMA-9021`: Ultra-Cold mRNA Pediatric Vaccines**
   * **Route**: Frankfurt BioPharma Center (FRA) $\rightarrow$ Dubai (DXB) $\rightarrow$ Singapore Changi (SIN).
   * **Scenario**: 10,000 doses requiring deep freeze (`-25°C` to `-15°C`). Suffers a critical temperature spike (`+4.2°C`) during tarmac transfer in Dubai direct sun exposure. Quarantined at Singapore customs for forensic audit and insurance liability attribution.

2. **`SHIP-ELEC-4401`: High-Value 3nm Semiconductor Silicon Wafers**
   * **Route**: Hsinchu Science Park, Taiwan $\rightarrow$ Port of Kaohsiung $\rightarrow$ Long Beach, California.
   * **Scenario**: 5,000 sensitive microprocessor wafers on container vessel *Ever Given II*. Strict room temperature corridor (`15°C` to `24°C`). Pristine voyage tracking across the Pacific Ocean.

3. **`SHIP-FRESH-1082`: Premium Organic Hass Avocados**
   * **Route**: Uruapan Packing House, Michoacán, Mexico $\rightarrow$ Laredo Border $\rightarrow$ San Antonio Distribution Center, Texas.
   * **Scenario**: 22,000 kg refrigerated agricultural produce (`4°C` to `8°C`). Intermodal highway truck transit with cleared USDA APHIS phytosanitary customs inspection.

---

## 10. Regulatory Compliance & Standards Fit

* **FDA 21 CFR Part 11**: Implements electronic audit trails, tamper-evident record keeping, monotonic sequencing, and digital signatures.
* **GAMP 5**: Complies with risk-based approaches for computerized pharmaceutical and life-sciences systems.
* **EU Annex 11**: Guarantees data integrity, non-repudiation, and verifiable event audit history for GMP-regulated operations.

---

## 11. Automated Test Suite

The system includes automated tests (`server/src/tests/eventSourcing.test.ts`) executed with **Vitest** and in-memory MongoDB:

* ✅ Deterministic SHA-256 hash generation verification.
* ✅ Cryptographic event chain continuity from Genesis to $N$.
* ✅ Tamper detection test (detects modified payload and breaks chain).
* ✅ Event deletion detection test (detects missing intermediate version).
* ✅ Event insertion detection test (detects duplicate or out-of-order versions).
* ✅ Invariant test: Mongoose pre-save hooks intercepting and blocking direct `UPDATE` queries (`ImmutabilityViolationError`).
* ✅ Invariant test: Mongoose pre-save hooks intercepting and blocking direct `DELETE` queries.
* ✅ Pure state fold reducer test: accurately reconstructs state at version $k$.
* ✅ OCC test: confirms commands with mismatched `expectedVersion` throw `ConcurrencyConflictError` (HTTP 409).
* ✅ OCC compound unique index test: confirms simultaneous duplicate version inserts are rejected.
* ✅ Projection worker test: confirms newly appended events update the read model correctly.

---

## 12. Quick Reference Summary

```
===================================================================================
CAPABILITY                      IMPLEMENTATION MECHANISM              STATUS
===================================================================================
Append-Only Event Store         MongoDB 'events' (Updates Blocked)    ACTIVE & VERIFIED
SHA-256 Hash Chaining           Node crypto (canonicalJsonStringify)  ACTIVE & VERIFIED
CQRS Write / Read Separation    Commands -> Events -> Projections     ACTIVE & VERIFIED
State Reconstruction            Pure Reducer fold(events, options)    ACTIVE & VERIFIED
Time-Travel State Scrubbing     Interactive Range Slider + API        ACTIVE & VERIFIED
Automated Lifecycle Playback    Auto-Scrubber Engine (1.4s interval)  ACTIVE & VERIFIED
OCC Concurrency Control         expectedVersion + Unique Mongo Index  ACTIVE & VERIFIED
OCC Conflict Simulation         One-click UI 409 Collision Simulator  ACTIVE & VERIFIED
Automated Temperature Alarms    Server-side invariant rule check      ACTIVE & VERIFIED
IoT Sensor Telemetry Chart      Recharts dual-axis + event pins       ACTIVE & VERIFIED
Immutability Database Guards    Mongoose pre-query & pre-save hooks   ACTIVE & VERIFIED
Tamper Attack Proof             Live diagnostic mutation test         ACTIVE & VERIFIED
Read Projection Rebuilder       Full event replay endpoint            ACTIVE & VERIFIED
Seeded Industry Aggregates      Pharma cold-chain, silicon, produce   ACTIVE & VERIFIED
Search Bar & Autocomplete       Navbar search & direct ID lookup      ACTIVE & VERIFIED
Genesis Container Creation      UI + Command API Container Genesis    ACTIVE & VERIFIED
JWT Role-Based Auth (Bonus)     HMAC-SHA256 token signer & personas   ACTIVE & VERIFIED
Audit Report PDF Export (Bonus) Court-admissible print certificate    ACTIVE & VERIFIED
===================================================================================
```
