/**
 * MASTER CONTINUOUS DAEMON ORCHESTRATOR
 * 
 * Manages and supervises all 5 autonomous daemon workers:
 * 1. Plaid FinTech & Underwriting Daemon
 * 2. AWS Cloud Infrastructure & Bedrock AI Daemon
 * 3. Modern Treasury Multi-Rail & Ledgers Daemon
 * 4. ATTOM Data Property Intelligence Daemon
 * 5. Mapbox GL Geospatial & GPS Dispatch Daemon
 */

import { plaidDaemon } from './plaid.daemon';
import { awsDaemon } from './aws.daemon';
import { modernTreasuryDaemon } from './modern-treasury.daemon';
import { attomDaemon } from './attom.daemon';
import { mapboxDaemon } from './mapbox.daemon';
import { frboMicroComplianceDaemon } from './frbo-micro-compliance.daemon';
import { parcelComplianceDaemon } from './parcel-compliance.daemon';
import { logger } from '../utils/logger';

export class DaemonOrchestrator {
  private isRunning = false;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();

    console.log('\n========================================================================');
    console.log('🚀 AWS RENTALS: MASTER CONTINUOUS DAEMON ORCHESTRATOR STARTED');
    console.log('   Supervising: Plaid • AWS Cloud • Modern Treasury • ATTOM Data • Mapbox GL');
    console.log('                USA FRBO Micro-Compliance • Parcel-Level Assessor Daemon');
    console.log('   Mode: Non-Stop Persistent Autonomous Daemon Engine (7 Workers)');
    console.log('========================================================================\n');

    // Start all 7 daemons
    plaidDaemon.start();
    awsDaemon.start();
    modernTreasuryDaemon.start();
    attomDaemon.start();
    mapboxDaemon.start();
    frboMicroComplianceDaemon.start();
    parcelComplianceDaemon.start();

    // Visual heartbeat status report every 30 seconds
    this.heartbeatTimer = setInterval(() => this.printHeartbeat(), 30_000);
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    console.log('\n🛑 Shutting down continuous daemons gracefully...');
    plaidDaemon.stop();
    awsDaemon.stop();
    modernTreasuryDaemon.stop();
    attomDaemon.stop();
    mapboxDaemon.stop();
    frboMicroComplianceDaemon.stop();
    parcelComplianceDaemon.stop();
    console.log('✅ All 7 daemons stopped.\n');
  }

  private printHeartbeat(): void {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const plaidState = plaidDaemon.getState();
    const awsState = awsDaemon.getState();
    const mtState = modernTreasuryDaemon.getState();
    const attomState = attomDaemon.getState();
    const mapboxState = mapboxDaemon.getState();
    const frboState = frboMicroComplianceDaemon.getState();
    const parcelState = parcelComplianceDaemon.getState();

    console.log('\n────────────────────────────────────────────────────────────────────────');
    console.log(`💓 [DAEMON ORCHESTRATOR HEARTBEAT] Uptime: ${uptimeSec}s | All 7 Daemons ONLINE`);
    console.log(` • Plaid:           ${plaidState.metrics.balancesChecked} Balances Checked | ${plaidState.metrics.signalRiskEvaluated} Signal ML Evaluated | ${plaidState.metrics.payrollIncomesVerified} Incomes Verified`);
    console.log(` • AWS Cloud:       ${awsState.metrics.s3ObjectsVerified} S3 KMS Encrypted | ${awsState.metrics.bedrockPromptsProcessed} Bedrock AI Inferences | DB Latency: ${awsState.metrics.dbLatencyMs}ms`);
    console.log(` • Modern Treasury: ${mtState.metrics.paymentOrdersProcessed} Rails Executed (${mtState.metrics.fedNowInstantCount} FedNow, ${mtState.metrics.rtpDisbursementsCount} RTP) | $${mtState.metrics.ledgerBalancedUsd.toFixed(2)} Balanced`);
    console.log(` • ATTOM Data:      ${attomState.metrics.avmRefreshed} AVM Valuations Indexed | ${attomState.metrics.hazardZonesVerified} Hazard Zones Audited`);
    console.log(` • Mapbox GL:       ${mapboxState.metrics.gpsPingsBroadcasted} GPS Telemetry Pings | Active Dispatch: ${mapboxState.activeDispatch.status} (${mapboxState.activeDispatch.etaMinutes}m ETA)`);
    console.log(` • FRBO Direct:     ${frboState.metrics.deedTitlesVerified} Deeds Verified | ${frboState.metrics.municipalLicensesAudited} Municipal Licenses | ${frboState.metrics.zeroCommissionLeasesConfirmed} $0-Commission Leases`);
    console.log(` • Parcel Assessor: ${parcelState.metrics.taxAssessorAudits} Taxes Clean | ${parcelState.metrics.femaFirmPanelsVerified} FIRM Flood Panels | ${parcelState.metrics.permitsAudited} Permits Verified`);
    console.log('────────────────────────────────────────────────────────────────────────\n');
  }
}

export const orchestrator = new DaemonOrchestrator();

// Run immediately if main module
if (typeof require !== 'undefined' && require.main === module) {
  orchestrator.start();

  const handleShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Gracefully stopping orchestrator.`);
    orchestrator.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    logger.error('Orchestrator uncaught exception, keeping daemon running:', err);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Orchestrator unhandled rejection, keeping daemon running:', reason);
  });
}
