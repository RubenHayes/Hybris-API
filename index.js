// USAGE:
// Step 1 - Login to Postman CLI:
//   postman login --with-api-key YOUR_API_KEY
//
// Step 2 - Run your collection and export JSON results:
//   postman collection run 35085411-5eeb9161-9f9a-46d0-93d7-c99bb5c59bfa -e 34239994-7845f2f5-6913-4cea-92d6-c3fcc7fc4643 --reporters json --reporter-json-export results.json
//
// Step 3 - Generate the HTML report:
//   cd "C:\Users\x160002976\OneDrive - Pick n Pay\Desktop\Work\Automation\Reports"
//   node index.js
//
// Output: postman-report.html - Rubens change

'use strict';

const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, 'results.json');
const outputPath = path.join(__dirname, 'postman-report.html');

if (!fs.existsSync(resultsPath)) {
  console.error('❌ results.json not found.');
  console.error('');
  console.error('Generate it by running:');
  console.error('  postman collection run 35085411-5eeb9161-9f9a-46d0-93d7-c99bb5c59bfa -e 34239994-7845f2f5-6913-4cea-92d6-c3fcc7fc4643 --reporters json --reporter-json-export results.json');
  process.exit(1);
}

const raw = fs.readFileSync(resultsPath, 'utf8');
const data = JSON.parse(raw);

const collectionName = (data.run && data.run.meta && data.run.meta.collectionName) || 'Postman Collection';
const runDate = new Date().toLocaleString();

const executions = (data.run && data.run.executions) || [];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const requestBlocks = executions.map(exec => {
  const requestName = (exec.requestExecuted && exec.requestExecuted.name) || 'Unknown Request';
  const responseCode = (exec.response && exec.response.code) ? exec.response.code : 'N/A';
  const assertions = exec.tests || [];

  let rows = '';
  assertions.forEach(a => {
    const testName = escapeHtml(a.name || '');
    const failed = a.error !== null && a.error !== undefined;
    const errorMsg = failed ? escapeHtml(a.error && (a.error.message || String(a.error))) : '';
    const statusBadge = failed
      ? '<span style="background:#e74c3c;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold;">FAIL</span>'
      : '<span style="background:#2ecc71;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold;">PASS</span>';
    const rowBg = failed ? '#fadbd8' : '#d5f5e3';

    totalTests++;
    if (failed) failedTests++; else passedTests++;

    rows += `
      <tr style="background:${rowBg};">
        <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${testName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ddd;text-align:center;">${statusBadge}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ddd;color:#c0392b;font-size:13px;">${errorMsg}</td>
      </tr>`;
  });

  const table = rows ? `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
      <thead>
        <tr style="background:#2c3e50;color:#fff;">
          <th style="padding:8px 12px;text-align:left;">Test Name</th>
          <th style="padding:8px 12px;text-align:center;width:100px;">Status</th>
          <th style="padding:8px 12px;text-align:left;">Error Message</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>` : '<p style="color:#888;font-size:13px;margin:8px 0 0 0;">No assertions found for this request.</p>';

  return `
    <details style="margin-bottom:10px;border:1px solid #ddd;border-radius:6px;overflow:hidden;">
      <summary style="padding:12px 16px;background:#ecf0f1;cursor:pointer;font-weight:600;font-size:15px;list-style:none;display:flex;justify-content:space-between;align-items:center;">
        <span>${escapeHtml(requestName)}</span>
        <span style="font-size:13px;color:#7f8c8d;font-weight:normal;">HTTP ${escapeHtml(String(responseCode))}</span>
      </summary>
      <div style="padding:12px 16px;">
        ${table}
      </div>
    </details>`;
}).join('');

const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
const totalRequests = executions.length;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(collectionName)} - Test Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; color: #2c3e50; }
    header { background: #2c3e50; color: #fff; padding: 28px 40px; }
    header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    header p { font-size: 14px; color: #bdc3c7; }
    .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
    .cards { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 30px; }
    .card { flex: 1; min-width: 140px; background: #fff; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    .card .value { font-size: 32px; font-weight: 700; }
    .card .label { font-size: 13px; color: #7f8c8d; margin-top: 4px; }
    .card.passed .value { color: #2ecc71; }
    .card.failed .value { color: #e74c3c; }
    .card.rate .value { color: #3498db; }
    .chart-section { background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); margin-bottom: 30px; text-align: center; }
    .chart-section h2 { font-size: 18px; margin-bottom: 16px; color: #2c3e50; }
    .chart-wrapper { display: inline-block; width: 280px; height: 280px; }
    .results-section h2 { font-size: 18px; margin-bottom: 16px; color: #2c3e50; }
    details summary::-webkit-details-marker { display: none; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(collectionName)}</h1>
    <p>Report generated: ${escapeHtml(runDate)}</p>
  </header>
  <div class="container">
    <div class="cards">
      <div class="card">
        <div class="value">${totalRequests}</div>
        <div class="label">Total Requests</div>
      </div>
      <div class="card">
        <div class="value">${totalTests}</div>
        <div class="label">Total Tests</div>
      </div>
      <div class="card passed">
        <div class="value">${passedTests}</div>
        <div class="label">Passed</div>
      </div>
      <div class="card failed">
        <div class="value">${failedTests}</div>
        <div class="label">Failed</div>
      </div>
      <div class="card rate">
        <div class="value">${passRate}%</div>
        <div class="label">Pass Rate</div>
      </div>
    </div>

    <div class="chart-section">
      <h2>Test Results Overview</h2>
      <div class="chart-wrapper">
        <canvas id="resultsChart"></canvas>
      </div>
    </div>

    <div class="results-section">
      <h2>Request Details</h2>
      ${requestBlocks || '<p style="color:#888;">No executions found in results.json.</p>'}
    </div>
  </div>

  <script>
    const ctx = document.getElementById('resultsChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed'],
        datasets: [{
          data: [${passedTests}, ${failedTests}],
          backgroundColor: ['#2ecc71', '#e74c3c'],
          borderColor: ['#27ae60', '#c0392b'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 14 } } },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                return context.label + ': ' + context.parsed + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log('✅ Report generated: postman-report.html');