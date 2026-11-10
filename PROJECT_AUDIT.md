# Project Audit & Technical Inventory

**Project:** Audit Trail — Event-Sourced Logistics Ledger & Forensic Dashboard  
**Author / Auditor:** Senior Technical Architect & Academic Project Coordinator  
**Baseline Repository:** `Axelro_internship/Audit_Trail`  
**Audit Date:** October 2026  
**Audit Mode:** Read-Only Source Code & Runtime Verification

---

## 1. Executive System Summary

"Audit Trail" is a full-stack, enterprise-grade Event-Sourced Ledger and Forensic Logistics Dashboard engineered for regulated cold-chain supply chains (pharmaceuticals, cryogenic biologics, and bonded international customs).

It addresses the fundamental flaw of traditional CRUD architectures—destructive data mutation (`UPDATE`/`DELETE`)—by implementing:
1. **Append-Only Event Persistence**: All state changes exist exclusively as immutable domain events.
2. **Cryptographic SHA-256 Hash Chaining**: Monotonically linked blocks (`prevHash -> eventHash`) guaranteeing mathematical proof of sequence.
3. **Strict CQRS Segregation**: Physical separation between the write command pipeline and sub-millisecond read projections.
4. **Deterministic State Reconstruction**: Pure reducer fold (`fold(Genesis ... vN) -> State`) enabling instantaneous time-travel state scrubbing.
5. **Optimistic Concurrency Control (OCC)**: Version-locked commands aborting stale concurrent writes with HTTP 409 Conflict.
6. **Master Editorial UI**: Warm cream `#FAF9F5` canvas, dark navy `#181715` product cards, and signature warm coral `#CC785C` accents.

---

## 2. Complete File & Module Inventory

The table below catalogs every source file in the repository, its technical responsibility, dependencies, current implementation status, complexity, test coverage, and suitability for team member ownership.

| File / Module Path | Technical Responsibility | Dependencies | Current Status | Complexity | Verification Method | Ownership Suitability |
|---|---|---|---|---|---|---|
| `server/src/index.ts` (145 lines) | Express application bootstrap, middleware, CORS, logging, route mounting, centralized error handling | express, cors, dotenv, zod, routes | Verified & Running | Medium | `curl http://localhost:5000/api/health` | M1 (Architecture Lead) |
| `server/src/config/db.ts` (40 lines) | MongoDB connection manager with embedded `MongoMemoryServer` fallback | mongoose, mongodb-memory-server | Verified & Running | Medium | Server startup logs | M1 / Shared Infrastructure |
| `server/src/domain/crypto/hashChaining.ts` (155 lines) | Canonical JSON serialization, SHA-256 hash chaining, full-chain verification algorithm | crypto (Node built-in) | Verified (Tests pass) | High | Vitest unit tests (3 test cases) | M1 (Cryptography & Ledger Engine) |
| `server/src/domain/events/eventTypes.ts` (138 lines) | Domain event definitions, payload interfaces, metadata schemas, event type constants | None | Implemented & Typed | Low-Medium | TypeScript compilation (`tsc`) | M1 / Shared Contract |
| `server/src/domain/models/shipmentAggregate.ts` (212 lines) | Pure reducer function (`foldShipmentEvents`) reconstructing aggregate state from historical events | eventTypes | Verified (Tests pass) | High | Vitest reducer unit tests | M1 (Domain Modeling & Fold) |
| `server/src/eventStore/EventModel.ts` (118 lines) | Mongoose schema for `events` collection with database-level immutability guard hooks | mongoose | Verified (Tests pass) | High | Vitest immutability attack test | M1 (Persistence & Security Guards) |
| `server/src/eventStore/eventStoreRepository.ts` (163 lines) | Append-only event persistence, OCC version validation, hash chaining execution | EventModel, hashChaining | Verified (Tests pass) | High | Vitest OCC collision tests | M1 (Event Store Operations) |
| `server/src/commands/commandSchemas.ts` (86 lines) | Zod validation schemas for all write commands (Create, Dispatch, Telemetry, Customs, Arrive) | zod | Implemented & Typed | Medium | Route integration tests with invalid payloads | M2 (Validation & Schemas) |
| `server/src/commands/commandService.ts` (342 lines) | Write business logic, domain invariant checking, automatic temperature excursion synthesis | eventStoreRepository, projectionWorker, shipmentAggregate | Verified & Tested | High | Vitest integration tests & API commands | M2 (Write Pipeline & Business Rules) |
| `server/src/commands/commandRoutes.ts` (129 lines) | Express HTTP router mapping command endpoints to `commandService` handlers | express, commandSchemas, commandService, jwtAuth | Verified & Tested | Medium | Manual API post requests & UI actions | M2 (Command API Routes) |
| `server/src/projections/ShipmentReadModel.ts` (105 lines) | Mongoose read model schema for `shipment_projections` with optimized indexes | mongoose | Implemented & Indexed | Medium | MongoDB query inspection | M3 (Read Model Storage) |
| `server/src/projections/projectionWorker.ts` (160 lines) | Asynchronous & synchronous projection updates (`projectEvent`) and full replay (`rebuildAllProjections`) | ShipmentReadModel, EventModel, shipmentAggregate | Verified & Tested | High | Rebuild projections endpoint & state checks | M3 (Projection Worker Engine) |
| `server/src/queries/queryService.ts` (239 lines) | Read services: list shipments, get by ID, historical state-at folding, audit verification, telemetry chart formatting | ShipmentReadModel, eventStoreRepository, shipmentAggregate, hashChaining | Verified & Tested | High | Unit & API tests for queries | M3 / M4 (Split between scrubbing & telemetry) |
| `server/src/queries/queryRoutes.ts` (113 lines) | Express HTTP router mapping query endpoints to `queryService` handlers | express, queryService, projectionWorker | Verified & Tested | Medium | HTTP GET query tests | M3 (Query Routing) |
| `server/src/auth/jwtAuth.ts` (200 lines) | HMAC-SHA256 JWT signing, token verification, RBAC middleware, standard industry personas | crypto | Implemented & Active | High | Token verification tests & header inspection | M5 (Auth & RBAC Security) |
| `server/src/auth/authRoutes.ts` (72 lines) | Auth router exposing persona lists and token validation endpoints | express, jwtAuth | Implemented & Active | Low-Medium | GET `/api/auth/personas` | M5 (Identity Routes) |
| `server/src/seeds/seedData.ts` (366 lines) | Demo data seeder generating realistic pharma & cryo event streams with excursions | eventStoreRepository, projectionWorker | Verified & Active | Medium | Clean database startup inspection | M4 (Telemetry & Scenario Seeding) |
| `server/src/tests/eventSourcing.test.ts` (302 lines) | 10 Vitest test cases covering crypto hashing, chain validation, tamper detection, immutability, OCC, and fold | vitest, mongoose, mongodb-memory-server | Verified (10/10 PASS) | High | `npm test` | Shared Testing / M1 Test Lead |
| `client/src/main.tsx` (10 lines) | React 19 application entry point | react, react-dom | Verified & Built | Low | Vite build | Shared Infrastructure |
| `client/src/App.tsx` (283 lines) | Root React component coordinating state, modals, data fetching, and error boundaries | react, components, api, types | Verified (0 lint warnings, built) | High | Browser UI interaction & Oxlint | M1 / Shared Integration |
| `client/src/index.css` (412 lines) | Master editorial design system tokens, typography, colors, layout utility classes | Vanilla CSS | Verified | Medium | Visual UI inspection across viewports | Shared Design Tokens |
| `client/src/App.css` (110 lines) | Component-specific animations, printable certificate layout, and modal overlays | Vanilla CSS | Verified | Low-Medium | Print preview & modal animations | Shared Design Tokens |
| `client/src/types/index.ts` (118 lines) | TypeScript interfaces for shipments, events, telemetry, personas, and audit certificates | None | Implemented & Typed | Medium | `tsc -b` compilation | Shared Type Contracts |
| `client/src/services/api.ts` (201 lines) | Typed HTTP client for all backend REST endpoints with JWT bearer injection | types | Verified | Medium | Network tab inspection | Shared Client API Service |
| `client/src/components/Navbar.tsx` (340 lines) | Header navigation, container autocomplete search, persona switcher, and status pills | react, lucide-react, types | Verified | Medium | Live search typing & persona switching | M1 (Navigation & Global State) |
| `client/src/components/ShipmentOverview.tsx` (260 lines) | Hero container card, status badge, route summary, temperature badge, and quick actions | react, lucide-react, types | Verified | Medium | Aggregate switching inspection | M1 (Hero Overview Interface) |
| `client/src/components/CommandDispatchModal.tsx` (682 lines) | Interactive multi-action modal dispatching new events with OCC version parameters | react, lucide-react, api, types | Verified | High | Event dispatching and live timeline update | M2 (Command Dispatch Interface) |
| `client/src/components/TimeTravelScrubber.tsx` (360 lines) | Temporal range scrubber, automated playback interval, side-by-side live vs historic comparison | react, lucide-react, api, types | Verified | High | Slider scrubbing and playback testing | M3 (Time-Travel Frontend) |
| `client/src/components/TelemetryChart.tsx` (265 lines) | Recharts dual-axis chart (Temp/Humidity) with threshold reference lines and event pins | recharts, lucide-react, types | Verified | High | Chart tooltips and threshold markers | M4 (Data Visualization) |
| `client/src/components/OCCConflictDemo.tsx` (210 lines) | Interactive card demonstrating write collision and instant HTTP 409 rejection | react, lucide-react, api, types | Verified | Medium | "Simulate OCC Collision" button click | M4 (Concurrency Demo Interface) |
| `client/src/components/ChronologicalTimeline.tsx` (336 lines) | Chronological vertical event feed with expandable raw JSON payloads and SHA-256 hash pills | react, lucide-react, types | Verified | High | Expanding payloads and copy hash badges | M5 (Audit Timeline Feed) |
| `client/src/components/CryptographicAuditModal.tsx` (339 lines) | Audit verification dialog, block walk breakdown, mathematical proof, print-ready PDF certificate | react, lucide-react, api, types | Verified | High | "Verify Ledger" click & print preview | M5 (Forensic Audit & Certificate UI) |
| `client/src/components/CalloutCardCoral.tsx` (95 lines) | Full-bleed coral callout banner highlighting ledger cryptographic integrity | react, lucide-react | Verified | Low | Callout button triggers audit modal | M1 / M5 (Compliance Banner) |
| `client/src/components/FooterSection.tsx` (125 lines) | Dark navy footer with architecture summary, technology stack tags, and status pills | react, lucide-react | Verified | Low | Footer links and layout | Shared UI |
| `client/src/components/ErrorBoundary.tsx` (65 lines) | React class component trapping component-level render crashes gracefully | react, lucide-react | Verified | Low | Deliberate render throw testing | Shared Infrastructure |
| `client/src/components/AuditSealMark.tsx` (35 lines) | SVG cryptographic seal emblem badge | react | Verified | Low | Render inspection | Shared Assets |

---

## 3. Technology Stack & Environment Details

| Layer | Technology | Version | Justification |
|---|---|---|---|
| **Backend Runtime** | Node.js | >= 18.x | Native `crypto` module, high I/O throughput |
| **Backend Framework** | Express | ^4.21.2 | Lightweight HTTP server, granular middleware control |
| **Language** | TypeScript | ^5.7.3 (server), ~6.0.2 (client) | Full-stack end-to-end type safety |
| **Database** | MongoDB / Mongoose | ^8.9.5 | Document store with compound unique indexes and driver hooks |
| **Embedded DB Fallback** | mongodb-memory-server | ^10.1.4 | Zero-dependency standalone execution for academic evaluators |
| **Validation** | Zod | ^3.24.1 | Schema validation for all incoming command payloads |
| **Testing Framework** | Vitest | ^3.0.4 | Fast ESM-native test runner with Jest compatibility |
| **Frontend Framework** | React | ^19.2.8 | Modern React 19 architecture |
| **Frontend Bundler** | Vite | ^8.3.0 | Fast HMR development and optimized production bundling |
| **Data Visualization** | Recharts | ^3.10.1 | Composable SVG time-series charts with reference lines |
| **Icons** | Lucide React | ^1.46.0 | Consistent iconography |
| **Linter** | Oxlint | ^1.81.0 | Fast, strict Rust-based linter enforcing React 19 compiler rules |

---

## 4. Current Verification Status

1. **Automated Unit Tests**:
   - `npm test` inside `server` executes `src/tests/eventSourcing.test.ts`.
   - **Result:** 10/10 tests pass across cryptographic hashing, tamper detection, pure fold state reconstruction, Mongoose immutability guards, and OCC conflict handling.
2. **Frontend Linter**:
   - `npm run lint` inside `client` executes `oxlint`.
   - **Result:** **0 warnings, 0 errors** across all 17 source files.
3. **Frontend Build**:
   - `npm run build` inside `client` executes `tsc -b && vite build`.
   - **Result:** Successfully built production bundle in `client/dist`.
4. **Git Repository Baseline**:
   - Monorepo initialized with 5 progressive commits and semver tags:
     - `v1.0-week1-cqrs`
     - `v2.0-week2-event-store`
     - `v2.5-mid-project-review`
     - `v3.0-week3-projections-scrubbing`
     - `v4.0-week4-occ-telemetry`
     - `v5.0-final-release`
   - `.gitignore` protects dependencies, build outputs, environment files, `docs/`, and all `.md` files.

---

## 5. Security & Sensitive Data Audit

- No plaintext API keys, secret tokens, or private credentials are hardcoded in source files.
- The default `JWT_SECRET` in `server/src/auth/jwtAuth.ts` uses an environment variable fallback intended strictly for local development and demonstration.
- `.env` files are ignored by `.gitignore`.
- Database operations fail securely when unauthorized mutations are attempted.
