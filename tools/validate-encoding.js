#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const root = path.resolve(__dirname, "..");
const fixMode = process.argv.includes("--fix");
const extensions = new Set([".html", ".js", ".json", ".css", ".md"]);
const ignoredDirs = new Set([".git", "node_modules", "dist", "build", "tools"]);

const cp1252DecodeMap = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f
};

const suspiciousPattern = /(?:Ã[\u0080-\u00ff]|Â[\u0080-\u00ff]?|â[\u0080-\u00ff\u2018-\u201d\u2022\u2026\u2013\u2014\u20ac\u2122]{1,3}|�)/;
const mojibakeRunPattern = /(?:Ã[\u0080-\u00ff]|Â[\u0080-\u00ff]?|â[\u0080-\u00ff\u2018-\u201d\u2022\u2026\u2013\u2014\u20ac\u2122]{1,3})+/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) return [];
      return walk(path.join(dir, entry.name));
    }

    const ext = path.extname(entry.name).toLowerCase();
    return extensions.has(ext) ? [path.join(dir, entry.name)] : [];
  });
}

function decodeCp1252AsUtf8(value) {
  const bytes = [];

  for (const char of value) {
    const code = char.codePointAt(0);
    const byte = cp1252DecodeMap[code] ?? code;

    if (byte > 0xff) {
      return value;
    }

    bytes.push(byte);
  }

  return Buffer.from(bytes).toString("utf8");
}

function fixMojibake(text) {
  let current = text;

  for (let index = 0; index < 5; index += 1) {
    const next = current.replace(mojibakeRunPattern, (match) => {
      const decoded = decodeCp1252AsUtf8(match);
      return decoded.includes("\uFFFD") ? match : decoded;
    });

    if (next === current) break;
    current = next;
  }

  return current;
}

function isUtf8(buffer) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return true;
  } catch {
    return false;
  }
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

const files = walk(root);
const issues = [];
let fixedCount = 0;

for (const file of files) {
  const buffer = fs.readFileSync(file);
  const rel = relative(file);

  if (!isUtf8(buffer)) {
    issues.push({ file: rel, type: "invalid-utf8" });
    continue;
  }

  const text = buffer.toString("utf8");
  const fixed = fixMojibake(text);

  if (fixed !== text) {
    if (fixMode) {
      fs.writeFileSync(file, fixed, "utf8");
      fixedCount += 1;
    } else {
      issues.push({ file: rel, type: "mojibake", matches: Array.from(new Set(text.match(mojibakeRunPattern) || [])).slice(0, 8) });
    }
  }

  const currentText = fixedModeText(fixMode, fixed, text);
  const isFullHtmlPage = rel === "index.html" || rel.startsWith("pages/");

  if (isFullHtmlPage && path.extname(file).toLowerCase() === ".html" && !/<meta\s+charset=["']?utf-8["']?\s*\/?>/i.test(currentText)) {
    issues.push({ file: rel, type: "missing-meta-charset" });
  }

  if (suspiciousPattern.test(currentText)) {
    issues.push({ file: rel, type: "suspicious-pattern" });
  }
}

function fixedModeText(isFixing, fixed, original) {
  return isFixing ? fixed : original;
}

if (fixMode) {
  console.log(`Encoding fix complete. Updated files: ${fixedCount}`);
}

if (issues.length > 0) {
  console.log(JSON.stringify(issues, null, 2));
  process.exitCode = 1;
} else {
  console.log("Encoding validation passed.");
}
