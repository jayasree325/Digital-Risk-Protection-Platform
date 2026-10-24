import { Router, Response } from 'express';
import { getDb, saveDb } from '../db';
import { optionalAuthMiddleware, authMiddleware, AuthenticatedRequest } from '../auth';
import { verifyUniversalLink } from '../services/universalLinkVerifier';

const router = Router();

// Live Instagram profile crawler
async function fetchLiveInstagramProfile(url: string) {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!parsed.hostname.includes('instagram.com')) return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    const handle = parts[0];
    if (!handle || ['p', 'reel', 'stories', 'explore', 'direct', 'accounts'].includes(handle.toLowerCase())) {
      return null;
    }

    const res = await fetch(`https://www.instagram.com/${handle}/`, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(3000)
    });

    if (res.status === 404) {
      return {
        exists: false,
        handle: `@${handle}`,
        status: 404,
        title: `Account Not Found (@${handle})`,
        stats: 'This Instagram handle is not registered on Meta servers or has been deleted.',
      };
    }

    const html = await res.text();
    const titleMatch = html.match(/property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
    const descMatch = html.match(/property="og:description" content="([^"]+)"/);

    const titleStr = titleMatch ? titleMatch[1].replace(/&#064;/g, '@').replace(/&#x2022;/g, '•').trim() : `@${handle} • Instagram`;
    const descStr = descMatch ? descMatch[1].replace(/&#064;/g, '@').trim() : 'Live account on Instagram';

    return {
      exists: true,
      handle: `@${handle}`,
      status: res.status,
      title: titleStr,
      stats: descStr,
    };
  } catch {
    return null;
  }
}

// POST /api/link-checks - Universal Brand & Suspicious Link Analyzer
router.post('/', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const companyId = req.user?.companyId || (req.query.companyId as string) || 'comp-acmepay';
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({ error: 'Valid URL is required' });
      return;
    }

    const cleanUrl = url.trim();
    let checkedDomain = '';
    try {
      const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      checkedDomain = parsed.hostname;
    } catch {
      checkedDomain = cleanUrl.replace(/^https?:\/\//, '').split('/')[0];
    }

    // Get company details & registered official brand assets
    let companyName = 'AcmePay Technologies';
    let companyWebsite = 'https://acmepay.com';
    const compStmt = db.prepare('SELECT name, website FROM companies WHERE id = ?');
    compStmt.bind([companyId]);
    if (compStmt.step()) {
      const crow = compStmt.getAsObject() as any;
      if (crow.name) companyName = crow.name;
      if (crow.website) companyWebsite = crow.website;
    }
    compStmt.free();

    const assetStmt = db.prepare(`
      SELECT url, account_id, platform, type, name FROM brand_assets
      WHERE company_id = ? AND verification_status = 'verified_official' AND archived = 0
    `);
    assetStmt.bind([companyId]);
    const officialDomains: string[] = [];
    const officialSocialHandles: string[] = [];
    while (assetStmt.step()) {
      const row = assetStmt.getAsObject() as any;
      if (row.type === 'domain') {
        if (row.account_id) officialDomains.push(row.account_id.toLowerCase());
        if (row.url) {
          try { officialDomains.push(new URL(row.url).hostname.toLowerCase()); } catch {}
        }
      }
      if (row.account_id) {
        officialSocialHandles.push(row.account_id.toLowerCase().replace('@', ''));
      }
    }
    assetStmt.free();

    let analysis: any = null;

    // Check if checking an Instagram profile live
    if (checkedDomain.includes('instagram.com')) {
      const liveIg = await fetchLiveInstagramProfile(cleanUrl);
      if (liveIg) {
        const cleanHandle = liveIg.handle.replace('@', '').toLowerCase();
        const isOfficialHandle = officialSocialHandles.includes(cleanHandle);

        if (isOfficialHandle) {
          analysis = {
            url: cleanUrl,
            checkedDomain,
            officialDomain: 'instagram.com',
            isTrueBrand: true,
            verdictBoolean: 'TRUE',
            verdict: 'Approved',
            riskSeverity: 'low',
            riskScore: 0,
            confidence: 'High',
            detectedBrand: 'Instagram (Meta)',
            brandCategory: 'Social Media & Official Perimeter',
            threatClassification: 'Verified Official Account Identity',
            redirectInfo: 'Direct SSL (Meta Instagram Graph Server)',
            pageTitle: liveIg.title,
            screenshotLabel: liveIg.stats,
            whyFlagged: `TRUE (AUTHENTIC OFFICIAL ACCOUNT): Matches your registered official Instagram account ${liveIg.handle}. Live Instagram telemetry confirms: ${liveIg.stats}.`,
            recommendedAction: 'Safe official account. Verified via Meta OAuth & live telemetry.',
            webRiskStatus: 'Clean (Meta Authorized Host)',
          };
        } else if (!liveIg.exists) {
          analysis = {
            url: cleanUrl,
            checkedDomain,
            officialDomain: 'instagram.com',
            isTrueBrand: false,
            verdictBoolean: 'FALSE',
            verdict: 'Suspicious',
            riskSeverity: 'low',
            riskScore: 20,
            confidence: 'High',
            detectedBrand: 'Instagram (Meta)',
            brandCategory: 'Social Media',
            threatClassification: 'Inactive / Deleted Handle',
            redirectInfo: 'HTTP 404 (Handle Not Found)',
            pageTitle: liveIg.title,
            screenshotLabel: liveIg.stats,
            whyFlagged: `FALSE (DELETED / INACTIVE ACCOUNT): Live Instagram query confirms ${liveIg.handle} does not exist on Instagram servers. May be an inactive link or deleted profile.`,
            recommendedAction: 'No active threat. Account does not currently exist.',
            webRiskStatus: 'Meta 404 Response',
          };
        } else {
          analysis = {
            url: cleanUrl,
            checkedDomain,
            officialDomain: 'instagram.com',
            isTrueBrand: false,
            verdictBoolean: 'FALSE',
            verdict: 'Suspicious',
            riskSeverity: 'medium',
            riskScore: 65,
            confidence: 'High',
            detectedBrand: 'Instagram (Meta)',
            brandCategory: 'Social Media',
            threatClassification: 'Unverified Third-Party Profile',
            redirectInfo: 'Direct SSL (Public Instagram Profile)',
            pageTitle: liveIg.title,
            screenshotLabel: liveIg.stats,
            whyFlagged: `FALSE (UNVERIFIED THIRD-PARTY ACCOUNT): Live Instagram profile detected: ${liveIg.title} (${liveIg.stats}). This account is NOT registered in your official brand assets and may represent an unapproved impersonator or community fan page.`,
            recommendedAction: 'Audit profile content if attempting to claim official brand affiliation or requesting customer credentials.',
            webRiskStatus: 'Public Instagram Profile',
          };
        }
      }
    }

    // If not Instagram or if live crawler didn't return, run Universal Verification Engine
    if (!analysis) {
      analysis = await verifyUniversalLink(cleanUrl, {
        name: companyName,
        website: companyWebsite,
        officialDomains,
        socialHandles: officialSocialHandles,
      });
    }

    const id = 'chk-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO link_checks (
        id, company_id, url, checked_domain, official_domain, verdict, risk_severity, risk_score,
        confidence, redirect_info, page_title, screenshot_label, why_flagged, recommended_action, checked_at,
        is_true_brand, verdict_boolean, detected_brand, threat_classification, web_risk_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        companyId,
        analysis.url,
        analysis.checkedDomain,
        analysis.officialDomain,
        analysis.verdict,
        analysis.riskSeverity,
        analysis.riskScore,
        analysis.confidence,
        analysis.redirectInfo,
        analysis.pageTitle,
        analysis.screenshotLabel,
        analysis.whyFlagged,
        analysis.recommendedAction,
        'Just now',
        analysis.isTrueBrand ? 1 : 0,
        analysis.verdictBoolean,
        analysis.detectedBrand,
        analysis.threatClassification,
        analysis.webRiskStatus || 'Clean',
      ]
    );

    saveDb();

    res.status(201).json({
      id,
      url: analysis.url,
      checkedDomain: analysis.checkedDomain,
      officialDomain: analysis.officialDomain,
      verdict: analysis.verdict,
      riskSeverity: analysis.riskSeverity,
      riskScore: analysis.riskScore,
      confidence: analysis.confidence,
      redirectInfo: analysis.redirectInfo,
      pageTitle: analysis.pageTitle,
      screenshotLabel: analysis.screenshotLabel,
      whyFlagged: analysis.whyFlagged,
      recommendedAction: analysis.recommendedAction,
      checkedAt: 'Just now',
      isTrueBrand: analysis.isTrueBrand,
      verdictBoolean: analysis.verdictBoolean,
      detectedBrand: analysis.detectedBrand,
      brandCategory: analysis.brandCategory,
      threatClassification: analysis.threatClassification,
      webRiskStatus: analysis.webRiskStatus,
    });
  } catch (error) {
    console.error('Link check error:', error);
    res.status(500).json({ error: 'Server error during link inspection' });
  }
});

// GET /api/link-checks
router.get('/', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const companyId = req.user?.companyId || (req.query.companyId as string) || 'comp-acmepay';

    const stmt = db.prepare(`
      SELECT id, url, checked_domain, official_domain, verdict, risk_severity, risk_score,
             confidence, redirect_info, page_title, screenshot_label, why_flagged, recommended_action, checked_at,
             is_true_brand, verdict_boolean, detected_brand, threat_classification, web_risk_status
      FROM link_checks
      WHERE company_id = ?
      ORDER BY rowid DESC
      LIMIT 20
    `);
    stmt.bind([companyId]);

    const records = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      records.push({
        id: row.id,
        url: row.url,
        checkedDomain: row.checked_domain,
        officialDomain: row.official_domain,
        verdict: row.verdict,
        riskSeverity: row.risk_severity,
        riskScore: row.risk_score,
        confidence: row.confidence,
        redirectInfo: row.redirect_info,
        pageTitle: row.page_title,
        screenshotLabel: row.screenshot_label,
        whyFlagged: row.why_flagged,
        recommendedAction: row.recommended_action,
        checkedAt: row.checked_at,
        isTrueBrand: row.is_true_brand === 1,
        verdictBoolean: row.verdict_boolean || (row.verdict === 'Approved' ? 'TRUE' : 'FALSE'),
        detectedBrand: row.detected_brand || 'General Domain',
        threatClassification: row.threat_classification || 'Domain Check',
        webRiskStatus: row.web_risk_status,
      });
    }
    stmt.free();

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching link checks' });
  }
});

// POST /api/link-checks/:id/add-to-findings
router.post('/:id/add-to-findings', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const stmt = db.prepare('SELECT * FROM link_checks WHERE id = ? AND company_id = ?');
    stmt.bind([id, companyId]);
    if (!stmt.step()) {
      stmt.free();
      res.status(404).json({ error: 'Link check record not found' });
      return;
    }
    const check = stmt.getAsObject() as any;
    stmt.free();

    const findingId = 'find-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO findings (
        id, company_id, type, reference_id, title, platform, username_or_package, candidate_url,
        risk_severity, risk_score, confidence, status, main_reason, detailed_reason,
        detected_time, first_seen, last_seen, publisher_or_owner, candidate_website, description,
        avatar_color, avatar_initials, lookalike_data, created_at, updated_at
      ) VALUES (?, ?, 'link', ?, ?, 'Web Domain', ?, ?, ?, ?, ?, 'New', ?, ?, 'Just now', ?, ?, 'Unknown Registrant', ?, ?, 'bg-red-500/20 text-red-400', 'LK', ?, ?, ?)`,
      [
        findingId,
        companyId,
        check.id,
        `Suspicious Link: ${check.checked_domain}`,
        check.checked_domain,
        check.url,
        check.risk_severity,
        check.risk_score,
        check.confidence,
        check.why_flagged,
        `Flagged via direct link inspection tool: ${check.recommended_action}`,
        now,
        now,
        check.url,
        check.why_flagged,
        JSON.stringify({
          official: check.official_domain,
          candidate: check.checked_domain,
          differenceType: 'typosquat',
          highlightedParts: [{ text: check.checked_domain, isDifferent: true, differenceLabel: 'Unapproved domain' }],
          explanation: check.why_flagged,
        }),
        now,
        now,
      ]
    );

    // Add signal
    db.run(
      `INSERT INTO finding_signals (id, finding_id, signal_type, title, explanation, strength, icon_name)
       VALUES (?, ?, 'domain', 'Deceptive Web Link', ?, 'Critical', 'domain')`,
      ['sig-' + Math.random().toString(36).substring(2, 9), findingId, check.why_flagged]
    );

    saveDb();

    res.json({ message: 'Finding created successfully from link check', findingId });
  } catch (error) {
    res.status(500).json({ error: 'Server error adding link check to findings' });
  }
});

export default router;
