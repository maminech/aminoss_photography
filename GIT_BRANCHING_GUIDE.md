# Git Branching Strategy for Multi-Theme Platform

## 📊 Branch Structure

```
main (production-ready)
│
├── feature/professional-theme ✅ (merged)
├── feature/creative-theme (future)
├── feature/dark-theme (future)
├── feature/theme-customization (future)
│
├── bugfix/theme-switcher-mobile
├── bugfix/font-loading
│
└── hotfix/critical-theme-issue
```

---

## 🌿 Branch Types

### 1. Main Branch
**Branch Name**: `main`

**Purpose**: Production-ready code

**Rules**:
- Always deployable
- Protected (requires PR)
- All tests must pass
- Code review required

**When to Merge**:
- Feature complete and tested
- No breaking changes
- Documentation updated
- Backward compatible

---

### 2. Feature Branches
**Naming Convention**: `feature/<feature-name>`

**Examples**:
- `feature/professional-theme`
- `feature/creative-theme`
- `feature/theme-customization`
- `feature/novo-hero-section`

**Purpose**: New theme development or enhancements

**Workflow**:
```bash
# Create feature branch
git checkout -b feature/creative-theme

# Develop and commit
git add .
git commit -m "feat: Add creative theme layout"
git commit -m "feat: Add creative theme components"
git commit -m "docs: Update theme documentation"

# Push to remote
git push origin feature/creative-theme

# Create Pull Request on GitHub/GitLab
# After review and approval, merge to main
```

**Best Practices**:
- Keep branches focused (one feature per branch)
- Regular commits with clear messages
- Update from main frequently
- Delete after merge

---

### 3. Bugfix Branches
**Naming Convention**: `bugfix/<issue-description>`

**Examples**:
- `bugfix/theme-switcher-mobile`
- `bugfix/font-loading-safari`
- `bugfix/layout-shift-professional`

**Purpose**: Non-critical bug fixes

**Workflow**:
```bash
# Create bugfix branch from main
git checkout main
git pull origin main
git checkout -b bugfix/theme-switcher-mobile

# Fix bug and commit
git add .
git commit -m "fix: Resolve theme switcher positioning on mobile"

# Push and create PR
git push origin bugfix/theme-switcher-mobile
```

---

### 4. Hotfix Branches
**Naming Convention**: `hotfix/<critical-issue>`

**Examples**:
- `hotfix/theme-crash-safari`
- `hotfix/switcher-breaking-admin`

**Purpose**: Critical production bugs

**Workflow**:
```bash
# Create from main (production)
git checkout main
git pull origin main
git checkout -b hotfix/theme-crash-safari

# Fix immediately
git add .
git commit -m "hotfix: Prevent theme context crash in Safari"

# Push and merge ASAP
git push origin hotfix/theme-crash-safari

# Fast-track merge (skip normal review if critical)
git checkout main
git merge hotfix/theme-crash-safari
git push origin main

# Deploy immediately
vercel --prod
```

---

## 🔄 Common Workflows

### Adding a New Theme

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/dark-theme

# 2. Add theme configuration
# Edit: src/types/theme.ts

# 3. Create layout component
# Create: src/layouts/DarkLayout.tsx

# 4. Update theme wrapper
# Edit: src/components/ThemeWrapper.tsx

# 5. Update theme switcher
# Edit: src/components/shared/ThemeSwitcher.tsx

# 6. Test thoroughly
npm run dev
# Test theme switching, persistence, all pages

# 7. Commit changes
git add .
git commit -m "feat: Add Dark theme with blue accent"

# 8. Update documentation
# Edit: MULTI_THEME_GUIDE.md
git add MULTI_THEME_GUIDE.md
git commit -m "docs: Add Dark theme documentation"

# 9. Push and create PR
git push origin feature/dark-theme

# 10. After approval, merge to main
git checkout main
git merge feature/dark-theme
git push origin main

# 11. Deploy
vercel --prod

# 12. Delete feature branch
git branch -d feature/dark-theme
git push origin --delete feature/dark-theme
```

---

### Enhancing Existing Theme

```bash
# 1. Create branch
git checkout -b feature/professional-animations

# 2. Make improvements
# Edit: src/layouts/ProfessionalLayout.tsx

# 3. Test
npm run dev

# 4. Commit
git add .
git commit -m "feat: Add parallax scrolling to Professional theme"

# 5. Push and merge
git push origin feature/professional-animations
# Create PR, review, merge
```

---

### Fixing Theme Bug

```bash
# 1. Create bugfix branch
git checkout -b bugfix/switcher-modal-overflow

# 2. Fix issue
# Edit: src/components/shared/ThemeSwitcher.tsx

# 3. Test fix
npm run dev

# 4. Commit
git add .
git commit -m "fix: Prevent modal overflow on small screens"

# 5. Push and merge
git push origin bugfix/switcher-modal-overflow
```

---

## 📝 Commit Message Conventions

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature (new theme, new component)
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

**Adding Feature**:
```
feat(theme): Add Professional theme with Novo design

- Implemented ProfessionalLayout component
- Added Playfair Display and Lato fonts
- Configured elegant color scheme
- Added smooth transitions and animations

Closes #42
```

**Fixing Bug**:
```
fix(switcher): Resolve modal z-index conflict

The theme switcher modal was appearing behind navbar.
Increased z-index from 40 to 50.

Fixes #38
```

**Documentation**:
```
docs(theme): Update multi-theme guide with examples

Added workflow examples for:
- Creating new themes
- Fixing bugs
- Git branching strategy
```

**Refactoring**:
```
refactor(layouts): Extract common layout logic

Created BaseLayout component to reduce duplication
between SimpleLayout and ProfessionalLayout.
```

---

## 🔀 Merge Strategies

### Feature Branch to Main
**Strategy**: Squash and Merge (Recommended)

**Why**: Keeps main branch history clean

**How**:
```bash
# Via GitHub/GitLab PR interface, select "Squash and merge"

# Or via command line:
git checkout main
git merge --squash feature/creative-theme
git commit -m "feat: Add Creative theme"
git push origin main
```

### Bugfix to Main
**Strategy**: Regular Merge

**Why**: Preserve bug fix history

**How**:
```bash
git checkout main
git merge bugfix/switcher-overflow
git push origin main
```

### Hotfix to Main
**Strategy**: Fast-Forward Merge

**Why**: Immediate deployment needed

**How**:
```bash
git checkout main
git merge --ff-only hotfix/critical-crash
git push origin main
vercel --prod
```

---

## 🛡️ Branch Protection Rules

### Main Branch Protection (Recommended Settings)

1. **Require Pull Request**:
   - At least 1 approval required
   - Dismiss stale reviews on new commits

2. **Require Status Checks**:
   - Build must pass
   - No TypeScript errors
   - No linting errors

3. **Require Branches to be Up to Date**:
   - Must merge latest main before PR

4. **Restrict Force Push**:
   - Prevent `git push --force`

5. **Require Linear History**:
   - No merge commits (squash only)

---

## 🧪 Pre-Merge Checklist

Before merging any theme-related branch:

### Code Quality
- [ ] No TypeScript errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Code follows project style
- [ ] No commented-out code
- [ ] No debug logs

### Functionality
- [ ] Theme switches correctly
- [ ] Theme persists after refresh
- [ ] All pages work in new theme
- [ ] Admin/client pages unaffected
- [ ] Existing features still work
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Documentation
- [ ] MULTI_THEME_GUIDE.md updated
- [ ] Code comments added
- [ ] README.md updated (if needed)
- [ ] Commit messages clear

### Testing
- [ ] Manual testing complete
- [ ] All browsers tested
- [ ] Mobile devices tested
- [ ] Theme switcher UI tested
- [ ] localStorage working

---

## 🎯 Release Process

### Version Numbering
Follow Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

**Examples**:
- `1.0.0`: Initial multi-theme release
- `1.1.0`: Added new theme (minor)
- `1.1.1`: Fixed theme bug (patch)
- `2.0.0`: Breaking changes to theme API (major)

### Release Workflow

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Create release branch
git checkout -b release/v1.1.0

# 3. Update version in package.json
# Edit package.json: "version": "1.1.0"

# 4. Update CHANGELOG.md
# Add new version section with changes

# 5. Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: Bump version to 1.1.0"

# 6. Merge to main
git checkout main
git merge release/v1.1.0
git push origin main

# 7. Create Git tag
git tag -a v1.1.0 -m "Version 1.1.0: Added Creative theme"
git push origin v1.1.0

# 8. Deploy to production
vercel --prod

# 9. Create GitHub Release
# Via GitHub interface, create release from tag
# Include changelog and notable features
```

---

## 🔧 Advanced Git Operations

### Syncing Feature Branch with Main

```bash
# Method 1: Rebase (cleaner history)
git checkout feature/creative-theme
git fetch origin
git rebase origin/main

# Resolve conflicts if any
git add .
git rebase --continue

# Force push (since history changed)
git push origin feature/creative-theme --force-with-lease

# Method 2: Merge (safer, preserves history)
git checkout feature/creative-theme
git merge origin/main
git push origin feature/creative-theme
```

### Cherry-Picking Commits

```bash
# Pick specific commit from another branch
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

### Reverting Theme Changes

```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Revert range of commits
git revert <oldest-commit>..<newest-commit>
```

### Stashing Changes

```bash
# Save current work
git stash save "WIP: Professional theme animations"

# List stashes
git stash list

# Apply stash
git stash apply stash@{0}

# Apply and remove stash
git stash pop
```

---

## 📊 Monitoring & Maintenance

### Regular Tasks

**Daily**:
- Check open PRs
- Review CI/CD status
- Monitor production errors

**Weekly**:
- Merge approved PRs
- Delete merged branches
- Update dependencies

**Monthly**:
- Review theme usage analytics
- Plan new theme features
- Refactor deprecated code

---

## 🚨 Emergency Procedures

### Production Broken by Theme Change

```bash
# 1. Identify breaking commit
git log --oneline

# 2. Revert immediately
git revert <breaking-commit-hash>
git push origin main

# 3. Deploy fixed version
vercel --prod

# 4. Notify team
# Post in Slack/Discord

# 5. Create post-mortem issue
# Document what broke and how to prevent
```

### Lost Work (Uncommitted Changes)

```bash
# Check reflog
git reflog

# Find lost commit
git show <commit-hash>

# Recover
git cherry-pick <commit-hash>
```

---

## 📚 Additional Resources

### Git Best Practices
- Write clear commit messages
- Commit early and often
- Never commit sensitive data
- Use .gitignore effectively
- Review changes before committing

### Theme Development Best Practices
- Test in all themes before merging
- Keep theme logic in layout files
- Don't duplicate business logic
- Document theme-specific behavior
- Consider accessibility in all themes

---

## ✅ Quick Reference

### Most Common Commands

```bash
# Start new feature
git checkout -b feature/my-feature

# Save work
git add .
git commit -m "feat: Add new feature"

# Update from main
git fetch origin
git rebase origin/main

# Push changes
git push origin feature/my-feature

# Deploy to production
vercel --prod

# View status
git status
git log --oneline --graph
```

---

**Last Updated**: November 6, 2025  
**Platform Version**: 1.0.0  
**Themes**: Simple, Professional
