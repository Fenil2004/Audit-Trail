import { eventStoreRepository } from '../eventStore/eventStoreRepository';
import { projectionWorker } from '../projections/projectionWorker';
import { EventTypes } from '../domain/events/eventTypes';
import { EventModel } from '../eventStore/EventModel';

export async function seedDatabase() {
  const existingCount = await EventModel.countDocuments();
  if (existingCount > 0) {
    console.log(`[Seed] Database already contains ${existingCount} events. Skipping seed.`);
    return;
  }

  console.log('[Seed] Seeding production demonstration aggregates...');

  // --------------------------------------------------------------------------
  // 1. SHIP-PHARMA-9021: Ultra-Cold mRNA Vaccines (Frankfurt -> Dubai -> Singapore)
  // Features critical temperature spike during tarmac transfer!
  // --------------------------------------------------------------------------
  const pharmaId = 'SHIP-PHARMA-9021';
  const baseTime = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000); // 4 days ago

  const pharmaEvents = [
    {
      aggregateId: pharmaId,
      eventType: EventTypes.CONTAINER_CREATED,
      expectedVersion: 0,
      timestamp: new Date(baseTime.getTime() + 0 * 3600000),
      payload: {
        containerNumber: 'CONT-BIO-7720-X',
        origin: 'Frankfurt BioPharma Logistics Center (FRA)',
        destination: 'Singapore Changi Medical Cold Storage (SIN)',
        cargoDescription: '10,000 Doses Ultra-Cold mRNA Pediatric Vaccines',
        quantityUnits: 10000,
        minTempLimit: -25.0,
        maxTempLimit: -15.0,
        sealNumber: 'SEAL-DE-994821',
      },
      metadata: {
        actor: 'Dr. Klaus Becker',
        role: 'LOGISTICS_DIRECTOR',
        reason: 'Initial packaging and cryogenic verification in dry ice chamber',
      },
    },
    {
      aggregateId: pharmaId,
      eventType: EventTypes.LOADED_ON_CARRIER,
      expectedVersion: 1,
      timestamp: new Date(baseTime.getTime() + 6 * 3600000),
      payload: {
        carrierName: 'Lufthansa Cargo',
        carrierType: 'FLIGHT',
        voyageOrFlightNumber: 'LH-8402',
        departureHub: 'Frankfurt Airport Hub 1',
        custodian: 'LH Cold Logistics Handling',
      },
      metadata: {
        actor: 'Markus Weber',
        role: 'RAMP_SUPERVISOR',
        reason: 'Container transferred to temperature-controlled air cargo pallet',
      },
    },
    {
      aggregateId: pharmaId,
      eventType: EventTypes.TELEMETRY_RECORDED,
      expectedVersion: 2,
      timestamp: new Date(baseTime.getTime() + 12 * 3600000),
      payload: {
        location: 'In Flight - Cruising Altitude 36,000ft over Alps',
        temperature: -21.4,
        humidity: 14.2,
        batteryLevelPct: 99,
        shockDetected: false,
      },
      metadata: {
        actor: 'Sensitech IoT Tag #SN-8821',
        role: 'IOT_TELEMETRY',
      },
    },
    {
      aggregateId: pharmaId,
      eventType: EventTypes.TELEMETRY_RECORDED,
      expectedVersion: 3,
      timestamp: new Date(baseTime.getTime() + 18 * 3600000),
      payload: {
        location: 'Dubai International Cargo Tarmac (DXB)',
        temperature: -18.2,
        humidity: 32.0,
        batteryLevelPct: 97,
        shockDetected: false,
      },
      metadata: {
        actor: 'Sensitech IoT Tag #SN-8821',
        role: 'IOT_TELEMETRY',
      },
    },
    // CRITICAL DISPUTE EVENT: Temperature Spike Excursion!
    {
      aggregateId: pharmaId,
      eventType: EventTypes.TEMPERATURE_SPIKE,
      expectedVersion: 4,
      timestamp: new Date(baseTime.getTime() + 21 * 3600000),
      payload: {
        recordedTemperature: 4.2,
        thresholdExceeded: 'MAX_EXCEEDED',
        thresholdLimit: -15.0,
        location: 'Dubai Tarmac Ramp 4B (Direct Sun Exposure)',
        severity: 'CRITICAL',
        potentialCargoRisk:
          'Excursion of +19.2°C above certified threshold (-15°C). Ground handling reefer failure during tarmac transit.',
        humidity: 48.5,
      },
      metadata: {
        actor: 'Sensitech CryoGuard Sensor Alarm',
        role: 'EMERGENCY_ALARM',
        reason: 'High ambient temperature alarm triggered automatically',
      },
    },
    {
      aggregateId: pharmaId,
      eventType: EventTypes.LOADED_ON_CARRIER,
      expectedVersion: 5,
      timestamp: new Date(baseTime.getTime() + 26 * 3600000),
      payload: {
        carrierName: 'Emirates SkyCargo',
        carrierType: 'FLIGHT',
        voyageOrFlightNumber: 'EK-348',
        departureHub: 'Dubai Cargo Mega Terminal',
        custodian: 'Emirates Pharma Transshipment Team',
      },
      metadata: {
        actor: 'Rashid Al Mansoori',
        role: 'TRANSFER_AGENT',
        reason: 'Emergency dry ice replenishment applied and loaded into active reefer hold',
      },
    },
    {
      aggregateId: pharmaId,
      eventType: EventTypes.TELEMETRY_RECORDED,
      expectedVersion: 6,
      timestamp: new Date(baseTime.getTime() + 32 * 3600000),
      payload: {
        location: 'In Flight - Indian Ocean Transit',
        temperature: -19.8,
        humidity: 18.0,
        batteryLevelPct: 93,
        shockDetected: false,
      },
      metadata: {
        actor: 'Sensitech IoT Tag #SN-8821',
        role: 'IOT_TELEMETRY',
      },
    },
    {
      aggregateId: pharmaId,
      eventType: EventTypes.CUSTOMS_INSPECTED,
      expectedVersion: 7,
      timestamp: new Date(baseTime.getTime() + 40 * 3600000),
      payload: {
        portCode: 'SGSIN',
        inspectorName: 'HSA Officer Cheryl Tan',
        inspectionResult: 'FLAGGED_FOR_AUDIT',
        sealIntact: true,
        notes: 'Cold-chain seal intact, but container flagged due to Dubai tarmac temperature excursion log.',
      },
      metadata: {
        actor: 'Singapore Health Sciences Authority (HSA)',
        role: 'CUSTOMS_OFFICER',
      },
    },
    {
      aggregateId: pharmaId,
      eventType: EventTypes.ARRIVED_AT_DESTINATION,
      expectedVersion: 8,
      timestamp: new Date(baseTime.getTime() + 46 * 3600000),
      payload: {
        destinationHub: 'Singapore Changi Medical Cold Storage (SIN)',
        finalCondition: 'COMPROMISED',
        receivedBy: 'Dr. Wei Ling Tan, Quality Assurance Lead',
        receiverSignature: 'SIG_SHA256_e82f91a0b3c4',
      },
      metadata: {
        actor: 'Dr. Wei Ling Tan',
        role: 'RECEIVER_QA',
        reason: 'Quarantined in bio-freezer pending forensic ledger audit and insurer claim',
      },
    },
  ];

  for (const evt of pharmaEvents) {
    const appended = await eventStoreRepository.appendEvent(evt as any);
    await projectionWorker.projectEvent(appended);
  }

  // --------------------------------------------------------------------------
  // 2. SHIP-ELEC-4401: High-Value Semiconductor Silicon Wafers (Taipei -> Los Angeles)
  // --------------------------------------------------------------------------
  const elecId = 'SHIP-ELEC-4401';
  const elecBase = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const elecEvents = [
    {
      aggregateId: elecId,
      eventType: EventTypes.CONTAINER_CREATED,
      expectedVersion: 0,
      timestamp: new Date(elecBase.getTime() + 0 * 3600000),
      payload: {
        containerNumber: 'CONT-SEMI-300MM-9',
        origin: 'Hsinchu Science Park Cleanroom Facility, Taiwan',
        destination: 'Long Beach Advanced Logistics Port, CA, USA',
        cargoDescription: '5,000 3nm Microprocessor Silicon Wafers',
        quantityUnits: 5000,
        minTempLimit: 15.0,
        maxTempLimit: 24.0,
        sealNumber: 'SEAL-TW-440192',
      },
      metadata: {
        actor: 'Chen Wei-Ting',
        role: 'FAB_LOGISTICS_LEAD',
      },
    },
    {
      aggregateId: elecId,
      eventType: EventTypes.LOADED_ON_CARRIER,
      expectedVersion: 1,
      timestamp: new Date(elecBase.getTime() + 8 * 3600000),
      payload: {
        carrierName: 'Evergreen Marine Vessel Ever Given II',
        carrierType: 'VESSEL',
        voyageOrFlightNumber: 'EVG-0442W',
        departureHub: 'Port of Kaohsiung Berth 78',
        custodian: 'Capt. Hiroshi Tanaka',
      },
      metadata: {
        actor: 'Kaohsiung Port Dispatch',
        role: 'PORT_DISPATCHER',
      },
    },
    {
      aggregateId: elecId,
      eventType: EventTypes.TELEMETRY_RECORDED,
      expectedVersion: 2,
      timestamp: new Date(elecBase.getTime() + 20 * 3600000),
      payload: {
        location: 'Pacific Ocean (28.4° N, 162.1° W)',
        temperature: 19.8,
        humidity: 42.1,
        batteryLevelPct: 96,
        shockDetected: false,
      },
      metadata: {
        actor: 'Orbcomm Satellite Transponder',
        role: 'IOT_DEVICE',
      },
    },
    {
      aggregateId: elecId,
      eventType: EventTypes.TELEMETRY_RECORDED,
      expectedVersion: 3,
      timestamp: new Date(elecBase.getTime() + 36 * 3600000),
      payload: {
        location: 'Approaching Channel Islands, California',
        temperature: 20.4,
        humidity: 44.0,
        batteryLevelPct: 92,
        shockDetected: false,
      },
      metadata: {
        actor: 'Orbcomm Satellite Transponder',
        role: 'IOT_DEVICE',
      },
    },
  ];

  for (const evt of elecEvents) {
    const appended = await eventStoreRepository.appendEvent(evt as any);
    await projectionWorker.projectEvent(appended);
  }
}