#!/usr/bin/env node

// Updates version across all package.json files, VERSION file, and README.md
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const newVersion = args[0];

if (!newVersion) {
  console.error('Usage: node update-version.js <version>');
  console.error('Example: node update-version.js 1.2.3');
  process.exit(1);
}

// Validate semver format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Error: Version must be in format X.Y.Z (e.g., 1.2.3)');
  process.exit(1);
}

console.log(`📦 Updating version to ${newVersion}...`);

// Update root package.json
const rootPackage = path.join(__dirname, '..', 'package.json');
const rootData = JSON.parse(fs.readFileSync(rootPackage, 'utf8'));
rootData.version = newVersion;
fs.writeFileSync(rootPackage, JSON.stringify(rootData, null, 2) + '\n');
console.log(`✅ Updated package.json`);

// Update workers package.json
const workersPackage = path.join(__dirname, '..', 'workers', 'package.json');
if (fs.existsSync(workersPackage)) {
  const workersData = JSON.parse(fs.readFileSync(workersPackage, 'utf8'));
  workersData.version = newVersion;
  fs.writeFileSync(workersPackage, JSON.stringify(workersData, null, 2) + '\n');
  console.log(`✅ Updated workers/package.json`);
}

// Update VERSION file
const versionFile = path.join(__dirname, '..', 'VERSION');
fs.writeFileSync(versionFile, newVersion + '\n');
console.log(`✅ Updated VERSION file`);

// Update README.md with version information
const readmePath = path.join(__dirname, '..', 'README.md');
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // Add or update version badge if it doesn't exist
  const versionBadge = `[![Version](https://img.shields.io/badge/version-${newVersion}-green?style=for-the-badge)](https://github.com/YOUR-USERNAME/quizlink/releases)`;

  // Check if version badge already exists
  const versionBadgeRegex = /\[!\[Version\].*?\]\(.*?\)/;
  if (versionBadgeRegex.test(readmeContent)) {
    // Replace existing version badge
    readmeContent = readmeContent.replace(versionBadgeRegex, versionBadge);
    console.log(`✅ Updated version badge in README.md`);
  } else {
    // Add version badge after the existing badges
    const badgeSectionRegex = /(\[!\[.*?\]\(.*?\)\]\s*)+/;
    const match = readmeContent.match(badgeSectionRegex);
    if (match) {
      // Insert after the last badge
      const insertIndex = match.index + match[0].length;
      readmeContent =
        readmeContent.slice(0, insertIndex) +
        versionBadge +
        '\n' +
        readmeContent.slice(insertIndex);
      console.log(`✅ Added version badge to README.md`);
    }
  }

  // Update any version references in the text
  const versionPatterns = [
    // Pattern for "version X.Y.Z" or "Version X.Y.Z"
    /(version|Version)\s+\d+\.\d+\.\d+/gi,
    // Pattern for "vX.Y.Z"
    /v\d+\.\d+\.\d+/g,
  ];

  versionPatterns.forEach(pattern => {
    const matches = readmeContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (match.toLowerCase().includes('version')) {
          readmeContent = readmeContent.replace(match, `Version ${newVersion}`);
        } else if (match.startsWith('v')) {
          readmeContent = readmeContent.replace(match, `v${newVersion}`);
        }
      });
    }
  });

  // Write updated README
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✅ Updated README.md with version ${newVersion}`);
}

console.log(`🎉 Version updated to ${newVersion} across all files!`);
console.log(`📋 Updated files:`);
console.log(`   - package.json`);
console.log(`   - workers/package.json`);
console.log(`   - VERSION`);
console.log(`   - README.md`);
