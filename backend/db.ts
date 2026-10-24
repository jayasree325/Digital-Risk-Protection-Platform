import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initialFindings } from '../frontend/src/data/mockData';
import { seedNikeFixtures, seedTrekFixtures, generateDynamicCompanyDemo } from './fixtures';

export { generateDynamicCompanyDemo };

const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DB_FILE = path.join(DATA_DIR, 'brandguard.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
    ensureSchemaAndFixtures(dbInstance);
  } else {
    dbInstance = new SQL.Database();
    initSchema(dbInstance);
    seedInitialData(dbInstance);
    ensureSchemaAndFixtures(dbInstance);
    saveDb();
  }

  return dbInstance;
}

let saveTimer: NodeJS.Timeout | null = null;
let isSaving = false;

export function saveDb(immediate = false): void {
  if (!dbInstance) return;

  const persist = async () => {
    if (!dbInstance || isSaving) return;
    isSaving = true;
    try {
      const data = dbInstance.export();
      const buffer = Buffer.from(data);
      await fs.promises.writeFile(DB_FILE, buffer);
    } catch (err) {
      console.error('Error persisting SQLite database:', err);
    } finally {
      isSaving = false;
    }
  };

  if (immediate) {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    persist();
    return;
  }

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 200);
}

function ensureIndexes(db: Database) {
  try {
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_findings_company_id ON findings(company_id);
      CREATE INDEX IF NOT EXISTS idx_findings_type ON findings(type);
      CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
      CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(risk_severity);
      CREATE INDEX IF NOT EXISTS idx_brand_assets_company_id ON brand_assets(company_id);
      CREATE INDEX IF NOT EXISTS idx_link_checks_company_id ON link_checks(company_id);
      CREATE INDEX IF NOT EXISTS idx_notes_finding_id ON notes(finding_id);
      CREATE INDEX IF NOT EXISTS idx_finding_signals_finding_id ON finding_signals(finding_id);
      CREATE INDEX IF NOT EXISTS idx_evidence_finding_id ON evidence(finding_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  } catch (err) {
    console.error('Error creating SQLite indexes:', err);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website TEXT NOT NULL,
      industry TEXT NOT NULL,
      email_domain TEXT NOT NULL,
      setup_status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      company_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'analyst',
      created_at TEXT NOT NULL,
      last_login TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS brand_assets (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'domain' | 'social' | 'app' | 'logo' | 'partner'
      name TEXT NOT NULL,
      url TEXT,
      platform TEXT,
      account_id TEXT,
      package_id TEXT,
      publisher TEXT,
      verification_status TEXT NOT NULL DEFAULT 'verified_official', -- 'verified_official' | 'needs_verification' | 'pending_review' | 'missing_info'
      verification_method TEXT NOT NULL DEFAULT 'company_confirmation',
      archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS link_checks (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      url TEXT NOT NULL,
      checked_domain TEXT NOT NULL,
      official_domain TEXT NOT NULL,
      verdict TEXT NOT NULL, -- 'Approved' | 'Suspicious' | 'Likely phishing' | 'Confirmed malicious'
      risk_severity TEXT NOT NULL, -- 'critical' | 'high' | 'medium' | 'low'
      risk_score INTEGER NOT NULL,
      confidence TEXT NOT NULL, -- 'High' | 'Medium' | 'Low'
      redirect_info TEXT,
      page_title TEXT,
      screenshot_label TEXT,
      why_flagged TEXT,
      recommended_action TEXT,
      checked_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'social' | 'app' | 'link'
      reference_id TEXT,
      title TEXT NOT NULL,
      platform TEXT NOT NULL,
      username_or_package TEXT NOT NULL,
      candidate_url TEXT NOT NULL,
      risk_severity TEXT NOT NULL, -- 'critical' | 'high' | 'medium' | 'low'
      risk_score INTEGER NOT NULL,
      confidence TEXT NOT NULL, -- 'High' | 'Medium' | 'Low'
      status TEXT NOT NULL DEFAULT 'New', -- 'New' | 'Investigating' | 'Likely impersonation' | 'Confirmed fake' | 'Dismissed' | 'Resolved'
      main_reason TEXT NOT NULL,
      detailed_reason TEXT NOT NULL,
      detected_time TEXT NOT NULL,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      publisher_or_owner TEXT,
      candidate_website TEXT,
      description TEXT,
      avatar_color TEXT,
      avatar_initials TEXT,
      lookalike_data TEXT, -- JSON
      connected_campaign TEXT, -- JSON
      is_demo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS finding_signals (
      id TEXT PRIMARY KEY,
      finding_id TEXT NOT NULL,
      signal_type TEXT NOT NULL,
      title TEXT NOT NULL,
      explanation TEXT NOT NULL,
      strength TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      finding_id TEXT NOT NULL,
      type TEXT NOT NULL,
      url_or_path TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      description TEXT NOT NULL,
      source TEXT NOT NULL,
      sha256_hash TEXT,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      finding_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'SecOps Analyst',
      action TEXT NOT NULL DEFAULT 'Analyst Note',
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
}

function seedInitialData(db: Database) {
  const companyId = 'comp-acmepay';
  const userId = 'user-alex';
  const passwordHash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  // 1. Company
  db.run(
    `INSERT INTO companies (id, name, website, industry, email_domain, setup_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [companyId, 'AcmePay Technologies', 'https://acmepay.com', 'Financial Technology & Payments', 'acmepay.com', 'active', now]
  );

  // 2. User
  db.run(
    `INSERT INTO users (id, name, email, password_hash, company_id, role, created_at, last_login, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, 'Alex Mercer', 'alex.mercer@acmepay.com', passwordHash, companyId, 'SecOps Lead', now, now, 'active']
  );

  // 3. Official Assets
  const assets = [
    {
      id: 'asset-1',
      type: 'domain',
      name: 'Official Corporate Domain',
      url: 'https://acmepay.com',
      platform: 'Web Domain',
      account_id: 'acmepay.com',
      package_id: null,
      publisher: 'AcmePay Technologies',
      verification_status: 'verified_official',
      verification_method: 'domain_dns_txt',
    },
    {
      id: 'asset-2',
      type: 'social',
      name: 'AcmePay Official Instagram',
      url: 'https://instagram.com/acmepay',
      platform: 'Instagram',
      account_id: '@acmepay',
      package_id: null,
      publisher: 'AcmePay Technologies',
      verification_status: 'verified_official',
      verification_method: 'meta_verified_badge',
    },
    {
      id: 'asset-3',
      type: 'social',
      name: 'AcmePay Official LinkedIn',
      url: 'https://linkedin.com/company/acmepay',
      platform: 'LinkedIn',
      account_id: 'acmepay-official',
      package_id: null,
      publisher: 'AcmePay Technologies',
      verification_status: 'verified_official',
      verification_method: 'domain_association',
    },
    {
      id: 'asset-4',
      type: 'social',
      name: 'AcmePay Official X Account',
      url: 'https://x.com/acmepay',
      platform: 'X',
      account_id: '@acmepay',
      package_id: null,
      publisher: 'AcmePay Technologies',
      verification_status: 'verified_official',
      verification_method: 'gold_organization_badge',
    },
    {
      id: 'asset-5',
      type: 'app',
      name: 'AcmePay Mobile (Android)',
      url: 'https://play.google.com/store/apps/details?id=com.acmepay.mobile',
      platform: 'Google Play',
      account_id: 'acmepay-play',
      package_id: 'com.acmepay.mobile',
      publisher: 'AcmePay Technologies',
      verification_status: 'verified_official',
      verification_method: 'developer_account_key',
    },
    {
      id: 'asset-6',
      type: 'app',
      name: 'AcmePay iOS (App Store)',
      url: 'https://apps.apple.com/app/acmepay/id123456789',
      platform: 'Apple App Store',
      account_id: 'id123456789',
      package_id: 'com.acmepay.ios',
      publisher: 'AcmePay Technologies',
      verification_status: 'verified_official',
      verification_method: 'apple_team_id',
    },
  ];

  for (const a of assets) {
    db.run(
      `INSERT INTO brand_assets (id, company_id, type, name, url, platform, account_id, package_id, publisher, verification_status, verification_method, archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [a.id, companyId, a.type, a.name, a.url, a.platform, a.account_id, a.package_id, a.publisher, a.verification_status, a.verification_method, now, now]
    );
  }

  // 4. Initial Link Checks
  const linkChecks = [
    {
      id: 'chk-1',
      url: 'https://acmepay-support-verify.online/login',
      checked_domain: 'acmepay-support-verify.online',
      official_domain: 'acmepay.com',
      verdict: 'Likely phishing',
      risk_severity: 'high',
      risk_score: 88,
      confidence: 'High',
      redirect_info: 'HTTP 302 -> /login/credential-harvest',
      page_title: 'AcmePay Customer Verification Portal',
      screenshot_label: 'Phishing login form with fake 2FA prompt',
      why_flagged: 'Domain is similar to acmepay.com, but registered 3 days ago. Uses stolen logo and requests online banking credentials.',
      recommended_action: 'Submit immediate registrar takedown and alert security operations.',
      checked_at: '10 mins ago',
    },
    {
      id: 'chk-2',
      url: 'https://acmepay.com/help',
      checked_domain: 'acmepay.com',
      official_domain: 'acmepay.com',
      verdict: 'Approved',
      risk_severity: 'low',
      risk_score: 4,
      confidence: 'High',
      redirect_info: 'None (Direct SSL 200 OK)',
      page_title: 'AcmePay Help Center & Customer Support',
      screenshot_label: 'Official customer support portal',
      why_flagged: 'Matches verified company domain acmepay.com exactly. No threats detected.',
      recommended_action: 'No action needed. Verified official company destination.',
      checked_at: '1 hour ago',
    },
  ];

  for (const lc of linkChecks) {
    db.run(
      `INSERT INTO link_checks (id, company_id, url, checked_domain, official_domain, verdict, risk_severity, risk_score, confidence, redirect_info, page_title, screenshot_label, why_flagged, recommended_action, checked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [lc.id, companyId, lc.url, lc.checked_domain, lc.official_domain, lc.verdict, lc.risk_severity, lc.risk_score, lc.confidence, lc.redirect_info, lc.page_title, lc.screenshot_label, lc.why_flagged, lc.recommended_action, lc.checked_at]
    );
  }

  // 5. Findings - Seed all 24 findings from initialFindings
  for (const f of initialFindings) {
    db.run(
      `INSERT INTO findings (
        id, company_id, type, reference_id, title, platform, username_or_package, candidate_url,
        risk_severity, risk_score, confidence, status, main_reason, detailed_reason,
        detected_time, first_seen, last_seen, publisher_or_owner, candidate_website, description,
        avatar_color, avatar_initials, lookalike_data, connected_campaign, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        f.id,
        companyId,
        f.type,
        f.id,
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
        f.publisherOrOwner || '',
        f.candidateWebsite || '',
        f.description || '',
        f.avatarColor || '',
        f.avatarInitials || '',
        f.lookalike ? JSON.stringify(f.lookalike) : null,
        f.connectedCampaign ? JSON.stringify(f.connectedCampaign) : null,
        now,
        now,
      ]
    );

    // Signals
    if (f.signals) {
      for (const sig of f.signals) {
        db.run(
          `INSERT INTO finding_signals (id, finding_id, signal_type, title, explanation, strength, icon_name)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [sig.id, f.id, sig.iconName || 'name', sig.title, sig.explanation, sig.strength, sig.iconName || 'name']
        );
      }
    }

    // Evidence
    if (f.evidence) {
      db.run(
        `INSERT INTO evidence (id, finding_id, type, url_or_path, timestamp, description, source, sha256_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [`${f.id}-ev`, f.id, 'screenshot', f.evidence.rawUrl, f.evidence.detectedAt, f.evidence.screenshotLabel || '', f.evidence.source, f.evidence.sha256Hash]
      );
    }

    // Notes
    if (f.timeline) {
      for (const t of f.timeline) {
        db.run(
          `INSERT INTO notes (id, finding_id, user_id, user_name, role, action, text, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [t.id, f.id, userId, t.author, t.role, t.action, t.note || '', t.timestamp]
        );
      }
    }
  }

  // 6. Audit Events
  db.run(
    `INSERT INTO audit_events (id, company_id, user_id, action, entity_type, entity_id, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['aud-1', companyId, userId, 'company_initialized', 'company', companyId, now]
  );
}

function ensureSchemaAndFixtures(db: Database) {
  const now = new Date().toISOString();
  // 1. Column migrations
  try {
    db.run('ALTER TABLE findings ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 1');
  } catch {
    // Column already exists
  }

  try { db.run('ALTER TABLE link_checks ADD COLUMN is_true_brand INTEGER DEFAULT 0'); } catch {}
  try { db.run('ALTER TABLE link_checks ADD COLUMN verdict_boolean TEXT DEFAULT "FALSE"'); } catch {}
  try { db.run('ALTER TABLE link_checks ADD COLUMN detected_brand TEXT'); } catch {}
  try { db.run('ALTER TABLE link_checks ADD COLUMN threat_classification TEXT'); } catch {}
  try { db.run('ALTER TABLE link_checks ADD COLUMN web_risk_status TEXT'); } catch {}

  // 1.1 Ensure default demo user Alex Mercer (AcmePay) exists
  let hasAlex = false;
  try {
    const s = db.prepare("SELECT id FROM users WHERE email = 'alex.mercer@acmepay.com'");
    if (s.step()) hasAlex = true;
    s.free();
  } catch {}

  if (!hasAlex) {
    const passwordHash = bcrypt.hashSync('password123', 10);
    db.run(
      `INSERT OR IGNORE INTO companies (id, name, website, industry, email_domain, setup_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['comp-acmepay', 'AcmePay Technologies', 'https://acmepay.com', 'Financial Technology & Payments', 'acmepay.com', 'active', now]
    );
    db.run(
      `INSERT OR REPLACE INTO users (id, name, email, password_hash, company_id, role, created_at, last_login, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['user-alex', 'Alex Mercer', 'alex.mercer@acmepay.com', passwordHash, 'comp-acmepay', 'SecOps Lead', now, now, 'active']
    );
  }

  // 2. Ensure Nike exists
  let hasNike = false;
  try {
    const s = db.prepare("SELECT id FROM companies WHERE id = 'comp-nike'");
    if (s.step()) hasNike = true;
    s.free();
  } catch {}

  if (!hasNike) {
    seedNikeFixtures(db, now);
  }

  // 3. Ensure Trek Bikes exists
  let hasTrek = false;
  try {
    const s = db.prepare("SELECT id FROM companies WHERE id = 'comp-trekbikes'");
    if (s.step()) hasTrek = true;
    s.free();
  } catch {}

  if (!hasTrek) {
    seedTrekFixtures(db, now);
  }

  // Ensure all demo findings are tagged as demo
  try {
    db.run("UPDATE findings SET is_demo = 1 WHERE is_demo IS NULL");
  } catch {}

  // Apply performance indexes
  ensureIndexes(db);

  saveDb();
}
