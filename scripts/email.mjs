// ============================================================
// SENTINEL Intelligence Brief — Gmail Email Sender
// Sends a beautifully formatted briefing to your Gmail
// ============================================================

import nodemailer from "nodemailer";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");

// ─── Config ───────────────────────────────────────────────

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const RECIPIENT = process.env.GMAIL_RECIPIENT || GMAIL_USER;
const SITE_URL = process.env.SITE_URL || "https://yourusername.github.io/sentinel";

// ─── Load Data ────────────────────────────────────────────

function loadBriefing() {
  const dataPath = join(DATA_DIR, "latest.json");
  if (!existsSync(dataPath)) {
    console.error("❌ No data/latest.json found. Run aggregate first.");
    process.exit(1);
  }
  return JSON.parse(readFileSync(dataPath, "utf-8"));
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Generate Email HTML ──────────────────────────────────

function generateEmailHTML(briefing) {
  const { meta, categories } = briefing;
  const categoryEntries = Object.entries(categories).sort(
    (a, b) => a[1].priority - b[1].priority
  );

  let sectionsHTML = "";
  for (const [id, cat] of categoryEntries) {
    const topArticles = cat.articles.slice(0, 4);
    if (topArticles.length === 0) continue;

    let articlesHTML = topArticles
      .map(
        (a) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #1a2332;">
            <a href="${escapeHtml(a.link)}" style="color:#00e5ff;text-decoration:none;font-size:14px;font-weight:500;line-height:1.4;">${escapeHtml(a.title)}</a>
            <div style="color:#6b7b8d;font-size:12px;margin-top:3px;">${escapeHtml(a.source)}</div>
          </td>
        </tr>`
      )
      .join("");

    sectionsHTML += `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:10px 16px;background:#0a1628;border-left:3px solid #00e5ff;border-radius:4px;">
            <span style="font-size:16px;font-weight:700;color:#e0e6ed;">${cat.icon} ${cat.name}</span>
            <span style="color:#4a5568;font-size:12px;margin-left:8px;">${cat.articleCount} articles</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${articlesHTML}
            </table>
          </td>
        </tr>
      </table>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#000;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;">
    <tr>
      <td align="center" style="padding:16px;">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:12px;overflow:hidden;border:1px solid #1a2332;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a1628,#0d2137);padding:28px 24px;text-align:center;border-bottom:2px solid #00e5ff;">
              <div style="font-size:12px;letter-spacing:4px;color:#00e5ff;margin-bottom:6px;">◈ AUTOMATED INTELLIGENCE BRIEFING</div>
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:2px;">SENTINEL</div>
              <div style="font-size:13px;color:#6b7b8d;margin-top:6px;">
                ${escapeHtml(meta.date)} • ${meta.period === "morning" ? "🌅 0800H BRIEFING" : "🌙 2200H BRIEFING"} • ${meta.totalArticles} Articles
              </div>
            </td>
          </tr>

          <!-- Stats -->
          <tr>
            <td style="padding:16px 24px;background:#080d14;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="25%" align="center" style="padding:8px;">
                    <div style="font-size:20px;font-weight:700;color:#00e5ff;">${meta.totalArticles}</div>
                    <div style="font-size:11px;color:#4a5568;text-transform:uppercase;">Articles</div>
                  </td>
                  <td width="25%" align="center" style="padding:8px;">
                    <div style="font-size:20px;font-weight:700;color:#00e5ff;">${meta.totalCategories}</div>
                    <div style="font-size:11px;color:#4a5568;text-transform:uppercase;">Categories</div>
                  </td>
                  <td width="25%" align="center" style="padding:8px;">
                    <div style="font-size:20px;font-weight:700;color:#00e5ff;">${meta.totalFeeds}</div>
                    <div style="font-size:11px;color:#4a5568;text-transform:uppercase;">Sources</div>
                  </td>
                  <td width="25%" align="center" style="padding:8px;">
                    <div style="font-size:20px;font-weight:700;color:#00e5ff;">${meta.period === "morning" ? "AM" : "PM"}</div>
                    <div style="font-size:11px;color:#4a5568;text-transform:uppercase;">Edition</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:24px;">
              ${sectionsHTML}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:16px 24px 28px;">
              <a href="${escapeHtml(SITE_URL)}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#00e5ff,#006eff);color:#000;text-decoration:none;font-weight:700;font-size:14px;border-radius:8px;letter-spacing:1px;">
                VIEW FULL BRIEFING ON WEBSITE →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;background:#080d14;text-align:center;border-top:1px solid #1a2332;">
              <div style="font-size:11px;color:#4a5568;">
                ◈ SENTINEL Intelligence Brief • Automated OSINT Aggregation<br>
                Generated from ${meta.totalFeeds} publicly available sources<br>
                Published daily at 0800H & 2200H IST
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send Email ───────────────────────────────────────────

async function sendEmail() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  SENTINEL Intelligence Brief — Email Sender");
  console.log("═══════════════════════════════════════════════════\n");

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.log("⚠️  Gmail credentials not configured.");
    console.log("   Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.");
    console.log("   Skipping email delivery.\n");
    return;
  }

  // ─── Time Check: Only send at 8 AM and 10 PM IST ──────────
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const currentHour = ist.getUTCHours();
  
  if (currentHour !== 8 && currentHour !== 22) {
    console.log(`⏰ Current IST hour is ${currentHour}:00. Emails are only dispatched at 08:00 and 22:00.`);
    console.log("   Skipping email delivery for this run.\n");
    return;
  }

  const briefing = loadBriefing();
  const emailHTML = generateEmailHTML(briefing);
  const { meta } = briefing;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const subject = `◈ SENTINEL Brief | ${meta.date} | ${meta.period === "morning" ? "0800H" : "2200H"} | ${meta.totalArticles} Articles`;

  try {
    const info = await transporter.sendMail({
      from: `"SENTINEL Intelligence" <${GMAIL_USER}>`,
      to: RECIPIENT,
      subject,
      html: emailHTML,
    });

    console.log(`✅ Email sent successfully!`);
    console.log(`   To: ${RECIPIENT}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message ID: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Email failed: ${err.message}`);
    // Don't exit with error - email failure shouldn't block deployment
  }
}

sendEmail().catch((err) => {
  console.error("❌ Email sender error:", err);
});
