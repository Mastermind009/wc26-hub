# Run these in PowerShell after GitHub CLI login

# 1) Login to GitHub (one-time, opens browser)
gh auth login

# 2) Create repo and push
cd C:\Users\Sayan\Projects\wc26-hub
git branch -M main
gh repo create wc26-hub --public --source=. --remote=origin --push

# 3) Then go to https://render.com
#    - New > Blueprint > connect wc26-hub repo
#    - Set ADMIN_SECRET = 12345
#    - Deploy
