import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env or risk.env in backend and root
dotenv.config();
dotenv.config({ path: path.join(__dirname, 'risk.env') });
dotenv.config({ path: path.join(process.cwd(), 'risk.env') });
dotenv.config({ path: path.join(process.cwd(), 'backend', 'risk.env') });

import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { getDb } from './db';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import assetRoutes from './routes/assetRoutes';
import linkCheckRoutes from './routes/linkCheckRoutes';
import findingRoutes from './routes/findingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import scanRoutes from './routes/scanRoutes';
import aiRoutes from './routes/aiRoutes';
import { authMiddleware, AuthenticatedRequest } from './auth';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Request logging for SecOps observability
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/link-checks', linkCheckRoutes);
app.use('/api/findings', findingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/ai', aiRoutes);

// Specialized endpoints from Section 17:
// GET /api/social/findings
app.get('/api/social/findings', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const db = await getDb();
    const companyId = (req.query.companyId as string) || req.user!.companyId;
    const stmt = db.prepare("SELECT * FROM findings WHERE company_id = ? AND type = 'social' ORDER BY rowid DESC");
    stmt.bind([companyId]);
    const items = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch social findings' });
  }
});

// GET /api/apps/findings
app.get('/api/apps/findings', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const db = await getDb();
    const companyId = (req.query.companyId as string) || req.user!.companyId;
    const stmt = db.prepare("SELECT * FROM findings WHERE company_id = ? AND type = 'app' ORDER BY rowid DESC");
    stmt.bind([companyId]);
    const items = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch app findings' });
  }
});

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    platform: 'BrandGuard Digital Risk Protection Server',
    database: 'SQLite (sql.js / persisted)',
    demoData: 'Active',
    frontendUrl: 'http://localhost:5173',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// JSON API Directory
app.get('/api', (_req, res) => {
  res.json({
    status: 'online',
    name: 'BrandGuard Digital Risk Protection API',
    version: '1.0.0',
    frontendUrl: 'http://localhost:5173',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me',
        forgotPassword: 'POST /api/auth/forgot-password',
      },
      companies: {
        list: 'GET /api/company/list',
        details: 'GET /api/company?companyId=:id',
        switch: 'POST /api/company/switch',
      },
      findings: {
        list: 'GET /api/findings',
        getById: 'GET /api/findings/:id',
        updateStatus: 'PATCH /api/findings/:id/status',
        addNote: 'POST /api/findings/:id/notes',
      },
      assets: {
        list: 'GET /api/assets',
        create: 'POST /api/assets',
        verify: 'PATCH /api/assets/:id/verify',
      },
      linkChecks: {
        list: 'GET /api/link-checks',
        check: 'POST /api/link-checks',
      },
      dashboard: {
        summary: 'GET /api/dashboard/summary',
        severity: 'GET /api/dashboard/severity',
      },
      scans: {
        instagramStatus: 'GET /api/scans/instagram/status',
        runSocialScan: 'POST /api/scans/social',
        runAppScan: 'POST /api/scans/apps',
        googleStatus: 'GET /api/scans/google/status',
        runGoogleDiscovery: 'POST /api/scans/google',
      },
    },
  });
});

// Production Static Frontend Assets
const distPath = fs.existsSync(path.join(process.cwd(), 'frontend', 'dist'))
  ? path.join(process.cwd(), 'frontend', 'dist')
  : path.join(__dirname, '..', 'frontend', 'dist');
const distIndexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Server Diagnostic Dashboard Route (Explicit)
app.get('/server-status', (req, res) => {
  renderServerDashboard(req, res);
});

// Root Route - Serves React Frontend in production, or Server Dashboard in API-only mode
app.get('/', (req, res) => {
  // If production build exists, serve the React Frontend (Landing Page)
  if (fs.existsSync(distIndexPath) && req.accepts('html')) {
    return res.sendFile(distIndexPath);
  }

  // If API client / JSON requested, return clean JSON
  if (req.accepts('json') && !req.accepts('html')) {
    return res.json({
      status: 'online',
      name: 'BrandGuard Digital Risk Protection API',
      version: '1.0.0',
      frontendUrl: 'http://localhost:5173',
      endpointsUrl: 'http://localhost:3001/api',
      healthUrl: 'http://localhost:3001/api/health',
    });
  }

  renderServerDashboard(req, res);
});

function renderServerDashboard(req: express.Request, res: express.Response) {

  // Interactive Server Control Center HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrandGuard SecOps Core Server • Online</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #060913;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }
    .grid-bg {
      background-image: 
        radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.12) 0%, transparent 60%),
        radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      width: 100%;
      flex: 1;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      padding-bottom: 1.5rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #06b6d4, #2563eb);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 1.25rem;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.35);
    }
    .brand-title {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .brand-sub {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #06b6d4;
      font-weight: 700;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.9rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }
    .hero-card {
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(11, 19, 43, 0.7) 100%);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 18px;
      padding: 2.25rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
    }
    .hero-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }
    .hero-desc {
      color: #94a3b8;
      font-size: 0.95rem;
      max-width: 650px;
      margin-bottom: 1.75rem;
    }
    .action-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: linear-gradient(135deg, #06b6d4, #0284c7);
      color: #ffffff;
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
      border: none;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #22d3ee, #0369a1);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(6, 182, 212, 0.45);
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(30, 41, 59, 0.7);
      color: #cbd5e1;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      border: 1px solid rgba(71, 85, 105, 0.4);
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background: rgba(51, 65, 85, 0.7);
      color: #ffffff;
      border-color: rgba(148, 163, 184, 0.4);
    }
    .grid-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .stat-card {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      backdrop-blur-md;
    }
    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }
    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .endpoints-section {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 2.5rem;
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 1.25rem;
    }
    .endpoint-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem;
      background: rgba(11, 19, 43, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.3);
      border-radius: 10px;
      margin-bottom: 0.65rem;
      transition: background 0.15s ease;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .endpoint-row:hover {
      background: rgba(30, 41, 59, 0.6);
      border-color: rgba(56, 189, 248, 0.3);
    }
    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
    }
    .method-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .method-get { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .method-post { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .method-patch { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .endpoint-path { color: #38bdf8; font-weight: 600; text-decoration: none; }
    .endpoint-path:hover { text-decoration: underline; }
    .endpoint-desc { color: #94a3b8; font-size: 0.8rem; }
    .test-btn {
      font-size: 0.75rem;
      background: rgba(51, 65, 85, 0.6);
      color: #e2e8f0;
      border: 1px solid rgba(71, 85, 105, 0.5);
      border-radius: 6px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .test-btn:hover { background: #0284c7; color: white; border-color: #0284c7; }
    .preview-box {
      width: 100%;
      margin-top: 0.5rem;
      background: #020617;
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 8px;
      padding: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #38bdf8;
      max-height: 220px;
      overflow-y: auto;
      white-space: pre-wrap;
      display: none;
    }
    .footer {
      border-top: 1px solid rgba(51, 65, 85, 0.5);
      padding: 1.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: #64748b;
    }
  </style>
</head>
<body class="grid-bg">
  <div class="container">
    <header class="header">
      <div class="brand">
        <div class="logo-badge">🛡️</div>
        <div>
          <div class="brand-title">BrandGuard SecOps</div>
          <div class="brand-sub">Core Server & Threat Telemetry</div>
        </div>
      </div>
      <div class="status-badge">
        <div class="pulse-dot"></div>
        <span>Operational • HTTP 200 OK</span>
      </div>
    </header>

    <div class="hero-card">
      <h1 class="hero-title">Backend API Server is Running</h1>
      <p class="hero-desc">
        BrandGuard's digital risk protection backend is active and listening on port 3001. All SecOps telemetry routes, impersonation scanning engines, and multi-tenant threat databases are operational.
      </p>
      <div class="action-group">
        <a href="http://localhost:5173" class="btn-primary" target="_blank" rel="noopener">
          <span>🚀 Open Web Dashboard (Frontend)</span>
        </a>
        <a href="/api/health" class="btn-secondary" target="_blank">
          <span>⚡ Check Health Status</span>
        </a>
        <a href="/api/company/list" class="btn-secondary" target="_blank">
          <span>🏢 Companies Catalog</span>
        </a>
      </div>
    </div>

    <div class="grid-stats">
      <div class="stat-card">
        <div class="stat-label">Server Port</div>
        <div class="stat-value"><span style="color:#38bdf8;">3001</span> (Local)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Database Engine</div>
        <div class="stat-value">SQLite (WASM/Persisted)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Frontend Web Link</div>
        <div class="stat-value"><a href="http://localhost:5173" target="_blank" style="color:#06b6d4; text-decoration:none;">localhost:5173 ↗</a></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Telemetry Status</div>
        <div class="stat-value"><span style="color:#34d399;">● Real-time Active</span></div>
      </div>
    </div>

    <div class="endpoints-section">
      <div class="section-title">
        <span>⚡ Core API Endpoints</span>
      </div>
      <div class="section-subtitle">
        Click any endpoint to view its live output directly in this window or open in a new tab.
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method-badge method-get">GET</span>
          <a class="endpoint-path" href="/api/health" target="_blank">/api/health</a>
          <span class="endpoint-desc">• Server system status & uptime</span>
        </div>
        <button class="test-btn" onclick="testEndpoint('/api/health', 'pre-health')">Test Live</button>
        <div class="preview-box" id="pre-health"></div>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method-badge method-get">GET</span>
          <a class="endpoint-path" href="/api/company/list" target="_blank">/api/company/list</a>
          <span class="endpoint-desc">• Multi-company enterprise catalog</span>
        </div>
        <button class="test-btn" onclick="testEndpoint('/api/company/list', 'pre-comp')">Test Live</button>
        <div class="preview-box" id="pre-comp"></div>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method-badge method-get">GET</span>
          <a class="endpoint-path" href="/api" target="_blank">/api</a>
          <span class="endpoint-desc">• Complete API routes schema</span>
        </div>
        <button class="test-btn" onclick="testEndpoint('/api', 'pre-api')">Test Live</button>
        <div class="preview-box" id="pre-api"></div>
      </div>
    </div>
  </div>

  <footer class="footer">
    BrandGuard Digital Risk Protection Platform • High-performance SecOps Engine
  </footer>

  <script>
    async function testEndpoint(url, elId) {
      const el = document.getElementById(elId);
      if (el.style.display === 'block') {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'block';
      el.textContent = 'Fetching telemetry data...';
      try {
        const res = await fetch(url);
        const data = await res.json();
        el.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        el.textContent = 'Error: ' + err.message;
      }
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

// Client-Side Routing Fallback in Production
if (fs.existsSync(distIndexPath)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && req.accepts('html')) {
      return res.sendFile(distIndexPath);
    }
    next();
  });
}

// Friendly 404 handler for unmatched API routes
app.use((req, res) => {
  const safePath = String(req.path).replace(/[<>&"]/g, '');
  if (req.accepts('html')) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - Endpoint Not Found • BrandGuard</title>
        <style>
          body { background:#080D1A; color:#e2e8f0; font-family: sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; }
          .card { background:#0f172a; padding:2rem; border-radius:12px; border:1px solid #334155; text-align:center; max-width:480px; }
          a { color:#38bdf8; text-decoration:none; font-weight:bold; }
          a:hover { text-decoration:underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color:#ef4444; margin-bottom:0.5rem;">404 - Endpoint Not Found</h2>
          <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:1.5rem;">The path <code>${safePath}</code> was not found on this server.</p>
          <p><a href="/">← Go to Server Dashboard</a> &nbsp;|&nbsp; <a href="http://localhost:5173">Launch Web App →</a></p>
        </div>
      </body>
      </html>
    `);
  } else {
    res.status(404).json({
      error: 'Not Found',
      message: `The endpoint ${safePath} does not exist.`,
      documentation: 'http://localhost:3001/',
      frontendUrl: 'http://localhost:5173/'
    });
  }
});

// Initialize database and start listening
getDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`BrandGuard Backend running at http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database on startup:', err);
    process.exit(1);
  });
