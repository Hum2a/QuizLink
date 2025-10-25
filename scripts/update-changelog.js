#!/usr/bin/env node

// Updates CHANGELOG.md with new version entry based on git commits
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const newVersion = args[0];
const releaseType = args[1] || 'patch'; // major, minor, patch

if (!newVersion) {
  console.error('Usage: node update-changelog.js <version> [release-type]');
  console.error('Example: node update-changelog.js 1.2.3 minor');
  console.error('Release types: major, minor, patch (default: patch)');
  process.exit(1);
}

// Validate semver format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Error: Version must be in format X.Y.Z (e.g., 1.2.3)');
  process.exit(1);
}

console.log(`📝 Updating CHANGELOG.md for version ${newVersion}...`);

// Get commits since last tag
function getCommitsSinceLastTag() {
  try {
    // Get the latest tag
    const latestTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();
    console.log(`📋 Found latest tag: ${latestTag}`);

    // Get commits since that tag
    const commits = execSync(
      `git log ${latestTag}..HEAD --oneline --no-merges`,
      { encoding: 'utf8' }
    );
    return commits
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  } catch (error) {
    console.log('📋 No previous tags found, getting all commits');
    // If no tags exist, get all commits
    const commits = execSync('git log --oneline --no-merges', {
      encoding: 'utf8',
    });
    return commits
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  }
}

// Categorize commits
function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    improvements: [],
    docs: [],
    refactor: [],
    other: [],
  };

  commits.forEach(commit => {
    const message = commit.toLowerCase();

    if (
      message.includes('feat') ||
      message.includes('add') ||
      message.includes('implement') ||
      message.includes('create') ||
      message.includes('new')
    ) {
      categories.features.push(commit);
    } else if (
      message.includes('fix') ||
      message.includes('bug') ||
      message.includes('error') ||
      message.includes('issue') ||
      message.includes('resolve')
    ) {
      categories.fixes.push(commit);
    } else if (
      message.includes('improve') ||
      message.includes('enhance') ||
      message.includes('optimize') ||
      message.includes('update') ||
      message.includes('upgrade')
    ) {
      categories.improvements.push(commit);
    } else if (
      message.includes('doc') ||
      message.includes('readme') ||
      message.includes('comment')
    ) {
      categories.docs.push(commit);
    } else if (
      message.includes('refactor') ||
      message.includes('clean') ||
      message.includes('restructure')
    ) {
      categories.refactor.push(commit);
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

// Generate changelog content from commits
function generateChangelogContent(categories, releaseType) {
  let content = '';

  // Determine main section based on release type
  let mainSection = '';
  let mainDescription = '';

  switch (releaseType) {
    case 'major':
      mainSection = '### Changed - Major Release';
      mainDescription = 'Breaking changes and major new features';
      break;
    case 'minor':
      mainSection = '### Added - Minor Release';
      mainDescription = 'New features and enhancements';
      break;
    case 'patch':
    default:
      mainSection = '### Fixed - Patch Release';
      mainDescription = 'Bug fixes and minor improvements';
      break;
  }

  content += `${mainSection}\n\n${mainDescription}\n\n`;

  // Add categorized changes
  if (categories.features.length > 0) {
    content += '#### ✨ New Features\n';
    categories.features.forEach(commit => {
      const cleanMessage = commit.replace(/^[a-f0-9]+ /, ''); // Remove commit hash
      content += `- ${cleanMessage}\n`;
    });
    content += '\n';
  }

  if (categories.fixes.length > 0) {
    content += '#### 🐛 Bug Fixes\n';
    categories.fixes.forEach(commit => {
      const cleanMessage = commit.replace(/^[a-f0-9]+ /, ''); // Remove commit hash
      content += `- ${cleanMessage}\n`;
    });
    content += '\n';
  }

  if (categories.improvements.length > 0) {
    content += '#### ⚡ Improvements\n';
    categories.improvements.forEach(commit => {
      const cleanMessage = commit.replace(/^[a-f0-9]+ /, ''); // Remove commit hash
      content += `- ${cleanMessage}\n`;
    });
    content += '\n';
  }

  if (categories.refactor.length > 0) {
    content += '#### 🔧 Refactoring\n';
    categories.refactor.forEach(commit => {
      const cleanMessage = commit.replace(/^[a-f0-9]+ /, ''); // Remove commit hash
      content += `- ${cleanMessage}\n`;
    });
    content += '\n';
  }

  if (categories.docs.length > 0) {
    content += '#### 📚 Documentation\n';
    categories.docs.forEach(commit => {
      const cleanMessage = commit.replace(/^[a-f0-9]+ /, ''); // Remove commit hash
      content += `- ${cleanMessage}\n`;
    });
    content += '\n';
  }

  if (categories.other.length > 0) {
    content += '#### 🔄 Other Changes\n';
    categories.other.forEach(commit => {
      const cleanMessage = commit.replace(/^[a-f0-9]+ /, ''); // Remove commit hash
      content += `- ${cleanMessage}\n`;
    });
    content += '\n';
  }

  return content;
}

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const changelogContent = fs.readFileSync(changelogPath, 'utf8');

// Get current date
const now = new Date();
const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format

// Get commits since last tag
const commits = getCommitsSinceLastTag();
console.log(`📋 Found ${commits.length} commits since last tag`);

if (commits.length === 0) {
  console.log('⚠️  No commits found since last tag');
  process.exit(0);
}

// Categorize commits
const categories = categorizeCommits(commits);

// Generate changelog content
const changelogContent_new = generateChangelogContent(categories, releaseType);

// Create new changelog entry
const newEntry = `## [${newVersion}] - ${dateString}

${changelogContent_new}---

`;

// Insert the new entry after the header
const lines = changelogContent.split('\n');
const headerEndIndex = lines.findIndex(line => line.startsWith('---'));
const insertIndex = headerEndIndex + 1;

// Insert the new entry
lines.splice(insertIndex, 0, newEntry);

// Write back to file
const updatedContent = lines.join('\n');
fs.writeFileSync(changelogPath, updatedContent);

console.log(`✅ Updated CHANGELOG.md with version ${newVersion}`);
console.log(`📋 Added entry for ${releaseType} release`);
console.log(`📅 Release date: ${dateString}`);
console.log(`📊 Categorized ${commits.length} commits into changelog`);
