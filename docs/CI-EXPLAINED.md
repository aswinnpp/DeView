# What is CI (Continuous Integration)?

**CI** stands for **Continuous Integration**. It is a practice (and often a system) that automatically runs checks and builds whenever someone pushes code to your repository.

## Why it matters

- **Catch errors early**: Lint, tests, and builds run on every push (or every pull request). Broken code is caught before it reaches production or other developers.
- **Same environment every time**: CI runs in a clean, consistent environment (e.g. GitHub’s servers), so “works on my machine” is reduced.
- **Confidence**: You can merge or deploy knowing that the code passed a defined set of checks.

## What CI usually does

1. **Install dependencies** – e.g. `npm install`
2. **Lint** – e.g. `npm run lint`
3. **Run tests** – e.g. `npm test`
4. **Build** – e.g. build Backend and Frontend to ensure they compile

## Example: GitHub Actions

You add a workflow file (e.g. `.github/workflows/ci.yml`) so that on every push or pull request, GitHub runs something like:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

So: **CI = automated checks (lint, test, build) that run on every push/PR.**  
You asked only for an explanation, so no CI workflow was added to the repo. When you’re ready, you can add a similar workflow under `.github/workflows/`.
