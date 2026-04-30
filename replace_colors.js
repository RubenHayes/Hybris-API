const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

// 1. FAIL badge: red → yellow
c = c.replace(/background:#e74c3c;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold;">FAIL/g,
  'background:#f1c40f;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold;">FAIL');

// 2. PASS badge: green → blue
c = c.replace(/background:#2ecc71;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold;">PASS/g,
  'background:#3498db;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold;">PASS');

// 3. Row background colors
c = c.replace(/'#fadbd8'/g, "'#fef9e7'");
c = c.replace(/'#d5f5e3'/g, "'#d6eaf8'");

// 4. Error message text color
c = c.replace(/color:#c0392b;font-size:13px/g, 'color:#b7950b;font-size:13px');

// 5. Passed card value color
c = c.replace(/.card.passed .value { color: #2ecc71; }/g, '.card.passed .value { color: #3498db; }');

// 6. Failed card value color
c = c.replace(/.card.failed .value { color: #e74c3c; }/g, '.card.failed .value { color: #f1c40f; }');

// 7. Chart backgroundColor
c = c.replace(/backgroundColor: \['#2ecc71', '#e74c3c'\]/g, "backgroundColor: ['#3498db', '#f1c40f']");

// 8. Chart borderColor
c = c.replace(/borderColor: \['#27ae60', '#c0392b'\]/g, "borderColor: ['#2980b9', '#d4ac0d']");

fs.writeFileSync('index.js', c, 'utf8');
console.log('Done - all 8 color replacements applied.');
