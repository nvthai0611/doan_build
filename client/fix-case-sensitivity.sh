#!/bin/bash
# Script to fix case sensitivity issues in Git

# Rename Teacher directory to teacher-temp first
git mv src/pages/Teacher src/pages/teacher-temp 2>/dev/null || true

# Then rename to teacher (lowercase)
git mv src/pages/teacher-temp src/pages/teacher 2>/dev/null || true

# Force Git to recognize the case change
git add -A
git commit -m "Fix: Rename Teacher directory to teacher (case-sensitive)"

