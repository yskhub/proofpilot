# Fix "failed to push some refs" – run in PowerShell

Your local `main` and GitHub's `main` have diverged. You have to **pull first**, then push.

## Option A: Pull with merge, then push

Run these **one at a time** in PowerShell from `D:\proofpilot`:

```powershell
cd D:\proofpilot
```

```powershell
# 1. Pull and merge GitHub's commits into your branch (use your token if it asks for password)
git pull origin main --no-rebase
```

If it opens an editor for a merge message, save and close it (in Vim: type `:wq` and Enter).

```powershell
# 2. Push the merged result
git push origin main
```

If **push still asks for credentials**, use your new GitHub token in the URL (replace `YOUR_TOKEN`):

```powershell
git push https://yskhub:YOUR_TOKEN@github.com/yskhub/proofpilot.git main
```

---

## Option B: If pull says "merge conflict"

1. Run: `git status`
2. Open the files it lists as "both modified".
3. Fix the conflict markers (search for `<<<<<<<`, `=======`, `>>>>>>>`).
4. Then run:

```powershell
git add .
git commit -m "Merge remote main into local"
git push origin main
```

---

## Why this works

- **GitHub** has 2 commits you don’t have: "Add files via upload" and "Update package.json...".
- **You** have 1 commit GitHub doesn’t have: "Fix Render build...".
- `git pull origin main` brings those 2 commits in and merges them with yours.
- After that, `git push origin main` is allowed.
