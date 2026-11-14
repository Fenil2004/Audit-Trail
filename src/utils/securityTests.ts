import type { AuditEvent } from "../types/audit";
import { detectTampering } from "./detectTampering";

export async function runSecurityTests(events: AuditEvent[]) {
  console.log("Starting Security Tests...");

  // Test 1: Original chain
  console.log(
    "Valid Chain:",
    await detectTampering(events)
  );

  // Test 2: Modified actor
  const modifiedActor = events.map((event, index) =>
    index === 1
      ? { ...event, actor: "Unknown User" }
      : { ...event }
  );

  console.log(
    "Modified Actor:",
    await detectTampering(modifiedActor)
  );

  // Test 3: Modified description
  const modifiedDescription = events.map((event, index) =>
    index === 1
      ? { ...event, description: "Modified event" }
      : { ...event }
  );

  console.log(
    "Modified Description:",
    await detectTampering(modifiedDescription)
  );

  // Test 4: Modified hash
  const modifiedHash = events.map((event, index) =>
    index === 1
      ? { ...event, hash: "a".repeat(64) }
      : { ...event }
  );

  console.log(
    "Modified Hash:",
    await detectTampering(modifiedHash)
  );

  // Test 5: Broken previous hash
  const brokenLink = events.map((event, index) =>
    index === 1
      ? { ...event, previousHash: "b".repeat(64) }
      : { ...event }
  );

  console.log(
    "Broken Link:",
    await detectTampering(brokenLink)
  );
}