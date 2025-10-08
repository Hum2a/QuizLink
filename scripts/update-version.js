#!/usr/bin/env node

// Updates version across all package.json files and VERSION file
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const newVersion = args[0];

if (!newVersion) {
  console.error("Usage: node update-version.js <version>");
  console.error("Example: node update-version.js 1.2.3");
  process.exit(1);
}

// Validate semver format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error("Error: Version must be in format X.Y.Z (e.g., 1.2.3)");
  process.exit(1);
}

console.log(`📦 Updating version to ${newVersion}...`);

// Update root package.json
const rootPackage = path.join(__dirname, "..", "package.json");
const rootData = JSON.parse(fs.readFileSync(rootPackage, "utf8"));
rootData.version = newVersion;
fs.writeFileSync(rootPackage, JSON.stringify(rootData, null, 2) + "\n");
console.log(`✅ Updated package.json`);

// Update workers package.json
const workersPackage = path.join(__dirname, "..", "workers", "package.json");
if (fs.existsSync(workersPackage)) {
  const workersData = JSON.parse(fs.readFileSync(workersPackage, "utf8"));
  workersData.version = newVersion;
  fs.writeFileSync(workersPackage, JSON.stringify(workersData, null, 2) + "\n");
  console.log(`✅ Updated workers/package.json`);
}

// Update VERSION file
const versionFile = path.join(__dirname, "..", "VERSION");
fs.writeFileSync(versionFile, newVersion + "\n");
console.log(`✅ Updated VERSION file`);

console.log(`🎉 Version updated to ${newVersion} across all files!`);
