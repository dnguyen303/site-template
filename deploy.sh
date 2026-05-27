#!/bin/bash
tar czf - \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env*' \
  --exclude='docs' \
  --exclude='prompts' \
  --exclude='app-notes' \
  --exclude='assets' \
  --exclude='*.md' \
  --exclude='.git' \
  --exclude='deploy.sh' \
  -C /Users/duynguyen/Projects/vethaul-site/vethaul-claude-code-project-v2 . \
  | ssh root@64.227.56.20 "tar xzf - -C /opt/vethaul/"
