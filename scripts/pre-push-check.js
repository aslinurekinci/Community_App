// pre-push hook için Windows uyumlu Node.js scripti (JavaScript projesi)
// Kullanım: node scripts/pre-push-check.js

const { execSync } = require('child_process');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let errors = 0;
let warnings = 0;

function run(label, command, isCritical = true) {
  process.stdout.write(`${BLUE}  → ${label}...${RESET} `);
  try {
    execSync(command, { stdio: 'pipe', cwd: process.cwd() });
    console.log(`${GREEN}✅ Temiz${RESET}`);
    return true;
  } catch (err) {
    if (isCritical) {
      console.log(`${RED}❌ HATA!${RESET}`);
      console.log(`${RED}${err.stdout?.toString() || err.message}${RESET}`);
      errors++;
    } else {
      console.log(`${YELLOW}⚠️  Uyarı${RESET}`);
      console.log(`${YELLOW}${err.stdout?.toString() || ''}${RESET}`);
      warnings++;
    }
    return false;
  }
}

function grep(label, pattern, extensions = ['ts', 'tsx']) {
  const { execSync: exec } = require('child_process');
  process.stdout.write(`${BLUE}  → ${label}...${RESET} `);
  try {
    const ext = extensions.map(e => `**/*.${e}`).join(' ');
    // Windows'ta findstr kullan
    const result = execSync(
      `findstr /s /r /c:"${pattern}" src\\*.ts src\\*.tsx 2>nul`,
      { stdio: 'pipe' }
    ).toString().trim();
    const count = result ? result.split('\n').length : 0;
    if (count === 0) {
      console.log(`${GREEN}✅ Bulunamadı${RESET}`);
    } else {
      console.log(`${YELLOW}⚠️  ${count} adet bulundu${RESET}`);
      console.log(result.split('\n').slice(0, 5).join('\n'));
      warnings++;
    }
  } catch {
    // findstr eşleşme bulamazsa hata fırlatır — bu aslında iyi
    console.log(`${GREEN}✅ Bulunamadı${RESET}`);
  }
}

console.log('');
console.log(`${BLUE}╔══════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║   🚀 mobilSosyalMedya Pre-Push Kontrol  ║${RESET}`);
console.log(`${BLUE}╚══════════════════════════════════════════╝${RESET}`);
console.log('');

// ── 1. ESLint (Söz dizimi + kural ihlalleri) ──────
console.log(`\n${BLUE}[1/4] ESLint — söz dizimi & kurallar${RESET}`);
run('eslint src/', 'npx eslint src/ --ext .js,.jsx --max-warnings=0', false);

// ── 2. Babel söz dizimi kontrolü ──────────────────
console.log(`\n${BLUE}[2/4] Babel söz dizimi kontrolü${RESET}`);
run('babel check', 'npx babel src/ --out-dir /tmp/babel-check --quiet', false);

// ── 3. console.log kalıntıları ────────────────────
console.log(`\n${BLUE}[3/4] console.log kalıntıları${RESET}`);
grep('console.log tarama', 'console\\.log', ['js', 'jsx']);

// ── 4. Testler ────────────────────────────────────
console.log(`\n${BLUE}[4/4] Jest testleri${RESET}`);
run('jest', 'npx jest --passWithNoTests --silent', true);

// ── Sonuç ─────────────────────────────────
console.log('');
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
if (errors > 0) {
  console.log(`${RED}❌ ${errors} kritik hata — push iptal!${RESET}`);
  console.log(`${YELLOW}   Bypass: git push --no-verify${RESET}`);
  process.exit(1);
} else {
  console.log(`${GREEN}✅ Tüm kontroller geçti! (${warnings} uyarı)${RESET}`);
  console.log(`${GREEN}   Push devam ediyor...${RESET}`);
  process.exit(0);
}
