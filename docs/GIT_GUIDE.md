# Git Guide — LoanGauge Team

This is the Git workflow for all 6 members. Follow it exactly so nobody's work gets lost or
overwritten, and so the commit history looks like real teamwork (it's part of the evaluation
criteria).

## One-time setup (each person, once)

1. Clone the repo (only one person needs to have created it — everyone else clones):
   ```bash
   git clone <repo-url>
   cd loangauge
   ```
2. Set your name/email if you haven't globally:
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

## Branch model

- `main` — stable, demo-ready snapshots only. Nobody commits here directly.
- `develop` — the integration branch. Everyone's finished module work lands here via PR.
- `feature/<your-name>-<module>` — where you actually work. One branch per module you're
  building, branched off `develop`.

Examples: `feature/priya-auth`, `feature/rahul-assessment-engine`,
`feature/you-eureka-gateway-setup`.

## Daily workflow

**1. Start of the day — sync with develop before you branch or continue work:**
```bash
git checkout dev
git pull origin dev
```

**2. Create your feature branch** (only once per module — after that, just check it out):
```bash
git checkout -b feature/yourname-yourmodule
```

**3. Work, then commit often — small, descriptive commits, not one giant commit at the end:**
```bash
git add <specific files>          # prefer this over `git add .` so you don't accidentally
                                   # commit someone else's half-finished file or a .env
git commit -m "auth: add JWT token generation on login"
```

Good commit message pattern: `<module>: <what changed>` — e.g.
`assessment: implement FOIR calculator`, `frontend-auth: add login form validation`.
Avoid vague messages like `"fix"`, `"update"`, `"changes"`.

**4. Push your branch:**
```bash
git push origin feature/yourname-yourmodule
```
(First push of a new branch: `git push -u origin feature/yourname-yourmodule` — after that,
plain `git push` works.)

**5. Open a Pull Request** on GitHub: base = `dev`, compare = your feature branch. Add a
short description of what the module does. Tag at least one teammate to review before
merging, if there's time — for the 1-week timeline, a quick glance is fine, it doesn't need
to be a formal review process.

**6. After merge**, delete the feature branch (GitHub offers a button for this) and pull
`dev` again before starting your next chunk of work.

## Avoiding conflicts (mostly won't happen with vertical ownership)

Since each person owns a distinct module's files end-to-end (per CLAUDE.md's Team Ownership
table), most of the time nobody else is touching your files. Conflicts are most likely in:
- **Shared files**: `docker-compose.yml`, root `.gitignore`, `CLAUDE.md`, `db/schema.sql` —
  if you need to change one of these, mention it in your team chat first, since a schema
  change or a new shared dependency affects everyone.
- **`AppRoutes.jsx`** on the frontend — since every module adds its own routes to this one
  file. Pull `develop` right before editing it, add only your routes, and merge quickly to
  minimize the window where two people are editing it at once.

If a merge conflict does happen:
```bash
git pull origin develop        # while on your feature branch, to bring in the latest
                                # merges from other people's completed work
# Git will show conflict markers <<<<<<< ======= >>>>>>> in the affected file(s)
# Open the file, decide which lines to keep (or keep both), remove the markers
git add <resolved-file>
git commit                     # completes the merge commit
git push
```
When in doubt about which side of a conflict to keep, ask the person whose change you're
conflicting with rather than guessing — most merge conflicts are one line and take 30 seconds
to resolve once you know the intent.

## What never gets committed

- `.env` files (already excluded by `.gitignore` — double check with `git status` before
  committing that no `.env` shows up as a new/modified file)
- `node_modules/`, `target/` (build output — already excluded)
- IDE-specific files (`.idea/`, `.vscode/`, `.classpath`, etc. — already excluded)

If you ever see one of these in `git status` about to be committed, stop and check your
`.gitignore` before pushing.

## Quick reference

| Situation | Command |
|---|---|
| See what's changed | `git status` |
| See your commit history | `git log --oneline -10` |
| Switch branches | `git checkout <branch-name>` |
| Discard uncommitted changes to a file | `git checkout -- <file>` |
| Undo the last commit but keep changes staged | `git reset --soft HEAD~1` |
| See what's different from develop | `git diff dev` |
