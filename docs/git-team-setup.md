# Project Team Setup

## Think of it like this

GitHub = Google Drive for code  
Branch = Your personal workspace  
Commit = Save  
Push = Upload  
Pull Request = "Please review my work"

Download Git: https://git-scm.com/install/windows

main = stable branch  
dev = active development branch

---

## Team Responsibilities

| Member   | Feature |
| -------- | ------- |
| Member 1 | NA      |
| Member 2 | NA      |
| Member 3 | NA      |
| Member 4 | NA      |
| Member 5 | NA      |
| Member 6 | NA      |

---

# PART 1 Cloning the repo

## 1. Clone Repo

```bash
git clone https://github.com/Galaxy169/LoanGauge.git
cd loangauge
```

---

## 2. Switch to Dev Branch

```bash
git checkout dev
```

---

## 3. Create Your Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Examples:

- feature/auth
- feature/jobs
- feature/resume
- feature/payments

---

## 4. Setup Environment

```bash
cp .env.example .env
```

Fill your DB credentials.

---

# PART 2 - Daily Workflow (IMPORTANT)

## Start of Day

```bash
git checkout dev
git pull origin dev

git checkout feature/your-feature-name
git merge dev
```

- git checkout dev -> switch to the dev branch
- git pull origin dev -> get the latest code
- git checkout feature/your-feature-name -> create and switch to your feature branch (only first time)
- git merge dev -> updates your feature branch with latest code from dev

---

## While Working

```bash
git status
git add .
git commit -m "added auth routes"
git push origin feature/your-feature-name
```

- git status -> Shows what files have changed, staged, or not tracked
- git add . -> Stages all changed files (prepares them for commit)
- git commit -m "added auth routes" -> Saves a snapshot of your changes with a message
- git push origin feature/your-feature-name -> Uploads your commits to GitHub on your branch

---

# PART 3 When Feature is Complete

## Create Pull Request

1. Go to GitHub repo
2. Click **Compare & Pull Request**
3. Set:
   - base: dev
   - compare: feature/your-feature-name
4. Add description
5. Click **Create PR**

---

## Code Review

- Teammate reviews your code
- Approves
- Clicks **Merge**

---

# PART 5 — Merge Conflicts

Example:

```diff
<<<<<<< HEAD
your code
=======
other code
>>>>>>> dev
```

Fix:

1. Remove conflict lines
2. Keep correct code

```bash
git add .
git commit -m "fix merge conflict"
```

---

# Cheat Sheet

Start work:

- git checkout dev
- git pull origin dev
- git checkout feature/xyz
- git merge dev

Save work:

- git add .
- git commit -m "message"
- git push origin feature/xyz

Finish work:

- Create Pull Request → merge into dev

---

# Golden Rules

- Never push directly to main
- Never upload .env or node_modules
- Always pull before starting
- Always use feature branches
- Write clear commit messages

---

# Team Communication

Use WhatsApp:

- “I’m starting jobs module”
- “PR ready, review”
- “I merged to dev, pull latest”

---

# Final Goal

LETS GIVE OUR BEST. GOOD LUCK!

---

### Helpful Links

https://gitcheatsheets.org/

---
