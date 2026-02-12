---
description: Creates a new branch from main
agent: build
model: opencode/big-pickle
---

Run the git commands to create a new branch starting from main.

The command should recieve the name of the new branch. If the new branch exists already in the step 4, please create a new one and append an alternate text such as "-emerald"

Ensure that main is up to date with remote.

Example workflow:

1. `git status` if local changes then stash with `git stash -m "<add a message with todays date and a brief description>"`
2. `git checkout main`
3. `git pull`
4. `git checkout -b <name of the new branch>`
Do not continue if the new branch already exist try again the step 4 until it we create a new one
5. `git push -u origin <name of the new branch>`
