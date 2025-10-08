# PowerShell version of release.sh for Windows
# Release Tag Manager for QuizLink
# Creates and manages semantic versioning tags for releases

param(
    [switch]$Major,
    [switch]$Minor,
    [switch]$Patch,
    [string]$Name = "",
    [string]$SetTag = "",
    [switch]$Current,
    [switch]$Force,
    [switch]$Help
)

function Show-Help {
    Write-Host "Usage: .\release.ps1 [OPTIONS]" -ForegroundColor Cyan
    Write-Host "Manage release tags with semantic versioning" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Major           Increment major version (vX.0.0)"
    Write-Host "  -Minor           Increment minor version (v0.X.0)"
    Write-Host "  -Patch           Increment patch version (v0.0.X) (default)"
    Write-Host "  -Name NAME       Append custom name to version (e.g., beta)"
    Write-Host "  -SetTag TAG      Set specific tag (must be vX.Y.Z format)"
    Write-Host "  -Current         Show current release tag"
    Write-Host "  -Force           Force tag creation even if commit is tagged"
    Write-Host "  -Help            Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\release.ps1 -Current"
    Write-Host "  .\release.ps1 -Minor"
    Write-Host "  .\release.ps1 -Major -Name beta"
    Write-Host "  .\release.ps1 -SetTag v1.2.3"
    exit 0
}

if ($Help) { Show-Help }

# Validate mutually exclusive options
$incrementFlags = @($Major, $Minor, $Patch, ($SetTag -ne "")).Where({ $_ -eq $true }).Count
if ($incrementFlags -gt 1) {
    Write-Host "Error: Cannot use multiple version flags together" -ForegroundColor Red
    exit 1
}

if ($Current -and ($incrementFlags -gt 0 -or $Name -ne "" -or $Force)) {
    Write-Host "Error: Cannot combine -Current with other options" -ForegroundColor Red
    exit 1
}

# Sync with remote tags
Write-Host "Syncing with remote tags..." -ForegroundColor Cyan
git fetch --tags --force 2>&1 | Out-Null

# Get current commit hash
$currentCommit = git rev-parse HEAD

# Get latest tag from remote
$latestTag = git ls-remote --tags --refs --sort=-v:refname origin | Select-Object -First 1 | ForEach-Object { $_.Split("`t")[1].Replace('refs/tags/', '') }

# Show current tag if requested
if ($Current) {
    if (-not $latestTag) {
        Write-Host "No releases found" -ForegroundColor Yellow
        exit 0
    }
    
    $tagCommit = git ls-remote origin "refs/tags/$latestTag" | ForEach-Object { $_.Split("`t")[0] }
    Write-Host "Latest release tag: $latestTag" -ForegroundColor Green
    Write-Host "Tag points to commit: $tagCommit" -ForegroundColor White
    Write-Host "Current commit: $currentCommit" -ForegroundColor White
    
    if ($tagCommit -eq $currentCommit) {
        Write-Host "Status: Current commit is tagged" -ForegroundColor Green
    } else {
        Write-Host "Status: Current commit is not tagged" -ForegroundColor Yellow
    }
    exit 0
}

# Handle set-tag mode
if ($SetTag -ne "") {
    if ($SetTag -notmatch '^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9-]+)?$') {
        Write-Host "Error: Tag must be in format vX.Y.Z or vX.Y.Z-NAME (e.g., v1.2.3 or v1.2.3-beta)" -ForegroundColor Red
        exit 1
    }
    $newTag = $SetTag
    Write-Host "Setting tag directly to: $newTag" -ForegroundColor Cyan
} else {
    # Default to patch if no version specified
    $increment = "patch"
    if ($Major) { $increment = "major" }
    if ($Minor) { $increment = "minor" }
    
    # Set default version if no tags exist
    if (-not $latestTag) {
        $latestTag = "v0.0.0"
        Write-Host "No existing tags found. Starting from v0.0.0" -ForegroundColor Yellow
    } else {
        Write-Host "Current release tag: $latestTag" -ForegroundColor Green
    }

    # Extract version numbers
    $cleanTag = $latestTag -replace '^v', '' -replace '-.*', ''
    $parts = $cleanTag.Split('.')
    $vMajor = [int]$parts[0]
    $vMinor = [int]$parts[1]
    $vPatch = [int]$parts[2]

    # Increment version
    switch ($increment) {
        "major" {
            $vMajor++
            $vMinor = 0
            $vPatch = 0
        }
        "minor" {
            $vMinor++
            $vPatch = 0
        }
        "patch" {
            $vPatch++
        }
    }

    # Construct new tag
    $newTag = "v$vMajor.$vMinor.$vPatch"

    # Append custom name if provided
    if ($Name -ne "") {
        $sanitizedName = $Name -replace '[^a-zA-Z0-9-]', '-'
        $newTag = "$newTag-$sanitizedName"
    }
}

# Check if tag already exists
Write-Host "Checking for existing tags..." -ForegroundColor Cyan
$existingRemote = git ls-remote origin "refs/tags/$newTag"
$existingLocal = git tag -l $newTag

# Delete existing tags if found
if ($existingRemote -or $existingLocal) {
    Write-Host "Tag $newTag already exists - deleting old version" -ForegroundColor Yellow
    
    if ($existingRemote) {
        Write-Host "Deleting remote tag: $newTag" -ForegroundColor Yellow
        git push --delete origin $newTag 2>&1 | Out-Null
    }
    
    if ($existingLocal) {
        Write-Host "Deleting local tag: $newTag" -ForegroundColor Yellow
        git tag -d $newTag 2>&1 | Out-Null
    }
}

# Check if current commit is already tagged
if ($latestTag) {
    $tagCommit = git ls-remote origin "refs/tags/$latestTag" | ForEach-Object { $_.Split("`t")[0] }
    if ($tagCommit -eq $currentCommit -and -not $Force) {
        Write-Host "Error: Current commit is already tagged as $latestTag" -ForegroundColor Red
        Write-Host "Use -Force to create a new tag on this commit" -ForegroundColor Yellow
        exit 1
    }
}

# Create and push new tag
Write-Host "Creating new tag: $newTag" -ForegroundColor Cyan
git tag $newTag
if ($?) {
    git push origin $newTag
    if ($?) {
        Write-Host "Successfully created release tag: $newTag" -ForegroundColor Green
        
        # Try to extract GitHub repo URL
        $remoteUrl = git remote get-url origin
        if ($remoteUrl -match 'github\.com[:/]([^/]+/[^/]+?)(\.git)?$') {
            $repoPath = $matches[1]
            Write-Host "Tag URL: https://github.com/$repoPath/releases/tag/$newTag" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Error: Failed to push tag" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Error: Failed to create tag" -ForegroundColor Red
    exit 1
}

