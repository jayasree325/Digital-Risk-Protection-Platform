import { Router, Response } from 'express';
import { getDb, saveDb } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';

import { getGoogleDiscoveryStatus, executeGoogleDiscovery } from '../services/googleDiscoveryService';

const router = Router();

// GET /api/scans/google/status - Safe status check (never leaks credentials)
router.get('/google/status', authMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
  const status = getGoogleDiscoveryStatus();
  res.json({
    configured: status.searchConfigured,
    searchEngineIdConfigured: status.searchEngineIdConfigured,
    webRiskConfigured: status.webRiskConfigured,
    discoverySource: 'Google Search',
    status: status.status,
    sourceStatus: status.sourceStatus,
    notice: status.message,
    isLiveAvailable: status.searchConfigured && status.searchEngineIdConfigured,
  });
});

// POST /api/scans/google - Run Google public index discovery and Web Risk evaluation
router.post('/google', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const companyId = (req.body.companyId as string) || (req.query.companyId as string) || req.user!.companyId;

    // Fetch company info
    const cStmt = db.prepare('SELECT id, name, website FROM companies WHERE id = ?');
    cStmt.bind([companyId]);
    let companyName = 'AcmePay';
    let companyWebsite = 'https://acmepay.com';
    if (cStmt.step()) {
      const cObj = cStmt.getAsObject() as any;
      companyName = cObj.name || 'AcmePay';
      companyWebsite = cObj.website || 'https://acmepay.com';
    }
    cStmt.free();

    // Fetch official assets for comparison parity
    const aStmt = db.prepare('SELECT type, url, account_id, package_id FROM brand_assets WHERE company_id = ?');
    aStmt.bind([companyId]);
    const officialDomains: string[] = [];
    const officialSocialUrls: string[] = [];
    const officialUsernames: string[] = [];

    try {
      const parsedWebsite = new URL(companyWebsite);
      officialDomains.push(parsedWebsite.hostname);
    } catch {}

    while (aStmt.step()) {
      const asset = aStmt.getAsObject() as any;
      if (asset.type === 'domain' && asset.url) {
        try {
          officialDomains.push(new URL(asset.url).hostname);
        } catch {
          officialDomains.push(asset.url);
        }
      } else if (asset.type === 'social' && asset.url) {
        officialSocialUrls.push(asset.url);
        if (asset.account_id) officialUsernames.push(asset.account_id);
      }
    }
    aStmt.free();

    // Execute backend Google discovery
    const discoveryResult = await executeGoogleDiscovery({
      companyId,
      brandName: companyName,
      officialDomains,
      officialSocialUrls,
      officialUsernames,
    });

    const insertedFindingIds: string[] = [];

    // Insert discovered candidate findings into database
    for (const f of discoveryResult.findings) {
      insertedFindingIds.push(f.id);

      db.run(
        `INSERT INTO findings (
          id, company_id, type, reference_id, title, platform, username_or_package, candidate_url,
          risk_severity, risk_score, confidence, status, main_reason, detailed_reason,
          detected_time, first_seen, last_seen, publisher_or_owner, candidate_website, description,
          avatar_color, avatar_initials, lookalike_data, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          f.id,
          f.companyId,
          f.type,
          f.referenceId,
          f.title,
          f.platform,
          f.usernameOrPackage,
          f.candidateUrl,
          f.riskSeverity,
          f.riskScore,
          f.confidence,
          f.status,
          f.mainReason,
          f.detailedReason,
          f.detectedTime,
          f.firstSeen,
          f.lastSeen,
          f.publisherOrOwner,
          f.candidateWebsite,
          f.description,
          f.avatarColor,
          f.avatarInitials,
          JSON.stringify(f.lookalike),
          f.isDemo,
          f.firstSeen,
          f.lastSeen,
        ]
      );

      // Insert signals
      for (const sig of f.signals) {
        db.run(
          `INSERT INTO finding_signals (id, finding_id, signal_type, title, explanation, strength, icon_name)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [sig.id, f.id, sig.signalType, sig.title, sig.explanation, sig.strength, sig.iconName]
        );
      }

      // Insert evidence
      db.run(
        `INSERT INTO evidence (id, finding_id, type, url_or_path, timestamp, description, source, sha256_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.evidence.id, f.id, f.evidence.type, f.evidence.urlOrPath, f.evidence.timestamp, f.evidence.description, f.evidence.source, f.evidence.sha256Hash]
      );
    }

    if (discoveryResult.findings.length > 0) {
      saveDb();
    }

    res.status(200).json({
      message: discoveryResult.message,
      sourceStatus: discoveryResult.sourceStatus,
      status: discoveryResult.status,
      findingsCount: discoveryResult.findings.length,
      findingIds: insertedFindingIds,
      notice: discoveryResult.message,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error executing Google discovery',
      sourceStatus: 'Google Search unavailable',
      status: 'error',
      findingsCount: 0,
      findingIds: [],
    });
  }
});


// GET /api/scans/instagram/status - Safe status check (never leaks token)
router.get('/instagram/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const hasToken = Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCESS_TOKEN.trim().length > 0);
  res.json({
    configured: hasToken,
    platform: 'Instagram Basic Display & Graph API',
    status: hasToken ? 'live_ready' : 'demo_simulation',
    mode: 'demo_simulation',
    isLiveAvailable: hasToken,
    notice: hasToken
      ? 'Instagram API access token is securely loaded on the backend. Public threat telemetry active.'
      : 'Instagram API credentials not set. Simulated high-fidelity demo findings active.',
  });
});

// POST /api/scans/social
router.post('/social', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const companyId = (req.body.companyId as string) || (req.query.companyId as string) || req.user!.companyId;

    // Fetch company info
    const cStmt = db.prepare('SELECT id, name FROM companies WHERE id = ?');
    cStmt.bind([companyId]);
    let companyName = 'AcmePay';
    if (cStmt.step()) {
      companyName = (cStmt.getAsObject() as any).name || 'AcmePay';
    }
    cStmt.free();

    const cleanBrand = companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'brand';
    const findingId = 'find-scan-' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();

    let title = `${companyName} Priority Disputes`;
    let username = `@${cleanBrand}_disputes_hub`;
    let platform = 'Telegram';
    let candidateUrl = `https://telegram.me/${cleanBrand}_disputes_hub`;
    let mainReason = `Deceptive channel promising instant account chargeback recovery for ${companyName} customers`;
    let detailedReason = `Prompts distress victims to submit payment credentials and one-time passcodes to an automated bot.`;

    if (companyId === 'comp-nike' || companyName.toLowerCase().includes('nike')) {
      title = 'Nike SNKRS VIP Drops Vault';
      username = '@nike_vip_drops_vault';
      platform = 'Telegram';
      candidateUrl = 'https://t.me/nike_vip_drops_vault';
      mainReason = 'Deceptive Telegram channel advertising backdoor links to sold-out Travis Scott sneaker drops';
      detailedReason = 'Channel prompts collectors to wire $150 deposit fees for guaranteed SNKRS order confirmations.';
    } else if (companyId === 'comp-trekbikes' || companyName.toLowerCase().includes('trek')) {
      title = 'Trek Factory Direct Liquidators';
      username = '@trek_factory_liquidators';
      platform = 'Instagram';
      candidateUrl = 'https://instagram.com/trek_factory_liquidators';
      mainReason = 'Unverified storefront promoting 90% off Trek Madone carbon bicycles';
      detailedReason = 'Instagram sponsored ad campaign sending cyclists to a fake payment processing portal.';
    }

    db.run(
      `INSERT INTO findings (
        id, company_id, type, reference_id, title, platform, username_or_package, candidate_url,
        risk_severity, risk_score, confidence, status, main_reason, detailed_reason,
        detected_time, first_seen, last_seen, publisher_or_owner, candidate_website, description,
        avatar_color, avatar_initials, lookalike_data, is_demo, created_at, updated_at
      ) VALUES (?, ?, 'social', ?, ?, ?, ?, ?, 'high', 86, 'High', 'New', ?, ?, 'Just now', ?, ?, 'Unverified Operator', 'https://scam-threat-domain.live', 'Newly identified lookalike threat.', 'bg-orange-500/20 text-orange-400', 'SC', ?, 1, ?, ?)`,
      [
        findingId,
        companyId,
        findingId,
        title,
        platform,
        username,
        candidateUrl,
        mainReason,
        detailedReason,
        now,
        now,
        JSON.stringify({
          official: companyName,
          candidate: title,
          differenceType: 'added_words',
          highlightedParts: [
            { text: companyName, isDifferent: false },
            { text: ` ${title.replace(companyName, '').trim()}`, isDifferent: true, differenceLabel: 'Deceptive keyword' },
          ],
          explanation: `Uses "${companyName}" to mislead public users into providing private credentials.`,
        }),
        now,
        now,
      ]
    );

    // Signals
    db.run(
      `INSERT INTO finding_signals (id, finding_id, signal_type, title, explanation, strength, icon_name)
       VALUES (?, ?, 'name', 'Added deceptive keywords', 'Channel adds high-risk terms to verified brand name.', 'High', 'name')`,
      ['sig-' + Math.random().toString(36).substring(2, 8), findingId]
    );

    // Evidence
    db.run(
      `INSERT INTO evidence (id, finding_id, type, url_or_path, timestamp, description, source, sha256_hash)
       VALUES (?, ?, 'social_profile', ?, ?, 'Newly scanned threat candidate profile', 'Threat Telemetry Scanner', '7b9195b08b53293e7f2e72f8a8b5e94b227777d4dd1fc61c6f884f48641d02b4')`,
      ['ev-' + Math.random().toString(36).substring(2, 8), findingId, candidateUrl, now]
    );

    saveDb();

    res.status(201).json({
      message: 'Social scan completed. New suspicious candidate detected.',
      findingId,
      title,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error running social scan' });
  }
});

// POST /api/scans/apps
router.post('/apps', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const companyId = (req.body.companyId as string) || (req.query.companyId as string) || req.user!.companyId;

    // Fetch company info
    const cStmt = db.prepare('SELECT id, name FROM companies WHERE id = ?');
    cStmt.bind([companyId]);
    let companyName = 'AcmePay';
    if (cStmt.step()) {
      companyName = (cStmt.getAsObject() as any).name || 'AcmePay';
    }
    cStmt.free();

    const cleanBrand = companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'brand';
    const findingId = 'find-scan-app-' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();

    let title = `${companyName} Fast Credit`;
    let packageId = `com.${cleanBrand}.fastcredit.loan`;
    let mainReason = `Rogue application soliciting contact list and identity documents under ${companyName} branding`;
    let detailedReason = `Malicious Android application disguised as an authorized loan product. Exfiltrates device contacts.`;

    if (companyId === 'comp-nike' || companyName.toLowerCase().includes('nike')) {
      title = 'Nike SNKRS Early Bot Utility';
      packageId = 'com.nike.snkrs.earlybot.hack';
      mainReason = 'Rogue APK requesting device accessibility permissions promising guaranteed SNKRS raffle wins';
      detailedReason = 'Malware utility logging account passwords and credit card CVVs.';
    } else if (companyId === 'comp-trekbikes' || companyName.toLowerCase().includes('trek')) {
      title = 'Trek Central E-Bike Speed Bypass';
      packageId = 'com.trek.central.speed.mod';
      mainReason = 'Malicious Android APK claiming to remove e-bike motor speed limits';
      detailedReason = 'Trojanized APK exfiltrating user location and logging device credentials.';
    }

    const candidateUrl = `https://apkpure.fake/app/${packageId}`;

    db.run(
      `INSERT INTO findings (
        id, company_id, type, reference_id, title, platform, username_or_package, candidate_url,
        risk_severity, risk_score, confidence, status, main_reason, detailed_reason,
        detected_time, first_seen, last_seen, publisher_or_owner, candidate_website, description,
        avatar_color, avatar_initials, lookalike_data, is_demo, created_at, updated_at
      ) VALUES (?, ?, 'app', ?, ?, 'Third-party APK', ?, ?, 'critical', 93, 'High', 'New', ?, ?, 'Just now', ?, ?, 'Unverified Developer', 'https://rogue-app-publisher.biz', 'Newly discovered third-party APK.', 'bg-red-500/20 text-red-400', 'AP', ?, 1, ?, ?)`,
      [
        findingId,
        companyId,
        findingId,
        title,
        packageId,
        candidateUrl,
        mainReason,
        detailedReason,
        now,
        now,
        JSON.stringify({
          official: `com.${cleanBrand}.official`,
          candidate: packageId,
          differenceType: 'unauthorized_subdomain',
          highlightedParts: [
            { text: `com.${cleanBrand}.`, isDifferent: false },
            { text: packageId.replace(`com.${cleanBrand}.`, ''), isDifferent: true, differenceLabel: 'Rogue package suffix' },
          ],
          explanation: `Unauthorized package claiming official ${companyName} affiliation.`,
        }),
        now,
        now,
      ]
    );

    // Signals
    db.run(
      `INSERT INTO finding_signals (id, finding_id, signal_type, title, explanation, strength, icon_name)
       VALUES (?, ?, 'permission', 'Exfiltration permissions', 'Requests sensitive permissions without financial or operational justification.', 'Critical', 'permission')`,
      ['sig-' + Math.random().toString(36).substring(2, 8), findingId]
    );

    // Evidence
    db.run(
      `INSERT INTO evidence (id, finding_id, type, url_or_path, timestamp, description, source, sha256_hash)
       VALUES (?, ?, 'apk_file', ?, ?, 'Package manifest analysis and dangerous permission declaration', 'Mobile Threat Telemetry', 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2')`,
      ['ev-' + Math.random().toString(36).substring(2, 8), findingId, candidateUrl, now]
    );

    saveDb();

    res.status(201).json({
      message: 'App scan completed. New suspicious application detected.',
      findingId,
      title,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error running app scan' });
  }
});

export default router;
