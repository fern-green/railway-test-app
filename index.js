const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Railway Test App</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f0f;
      color: #f0f0f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      width: 90%;
      text-align: center;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0d2b1a;
      color: #4ade80;
      border: 1px solid #166534;
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 28px;
    }

    .dot {
      width: 7px;
      height: 7px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 1.8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }

    p {
      color: #888;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 36px;
    }

    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 32px;
    }

    .stat {
      background: #111;
      border: 1px solid #222;
      border-radius: 10px;
      padding: 16px;
    }

    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #555;
      margin-bottom: 6px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #e0e0e0;
    }

    .footer {
      font-size: 12px;
      color: #444;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="dot"></span>
      Deployed on Railway
    </div>
    <h1>Hello, Railway 🚂</h1>
    <p>This is a test deployment. If you're seeing this, the app is running successfully.</p>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Runtime</div>
        <div class="stat-value">Node.js</div>
      </div>
      <div class="stat">
        <div class="stat-label">Port</div>
        <div class="stat-value" id="port">—</div>
      </div>
      <div class="stat">
        <div class="stat-label">Status</div>
        <div class="stat-value" style="color:#4ade80">OK</div>
      </div>
      <div class="stat">
        <div class="stat-label">Uptime</div>
        <div class="stat-value" id="uptime">—</div>
      </div>
    </div>
    <div class="footer">fern-green / railway-test-app</div>
  </div>
  <script>
    const start = Date.now();
    function tick() {
      const s = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(s / 60);
      document.getElementById('uptime').textContent = m > 0 ? m + 'm ' + (s % 60) + 's' : s + 's';
      requestAnimationFrame(tick);
    }
    tick();
    fetch('/api/info').then(r => r.json()).then(d => {
      document.getElementById('port').textContent = d.port;
    });
  </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(html);
});

app.get('/api/info', (req, res) => {
  res.json({ port: PORT, uptime: process.uptime() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
