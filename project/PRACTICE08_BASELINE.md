# Practice #08 — Baseline Output

This file records the exact output of the three baseline commands run against the
current working version of the Smart Campus Room Booking project (inherited from
Practices #06 and #07).

No application logic or tests were modified before running these commands.

---

## 1. `npx vitest run`

```
 RUN  v2.1.9 /home/project

 ✓ src/lib/availability.test.ts (21 tests) 32ms

 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  11:27:23
   Duration  347ms (transform 39ms, setup 0ms, collect 39ms, tests 32ms, environment 0ms, prepare 120ms)
```

**Summary:** 1 test file, 21 tests, all 21 passed, 0 failures.
Exit code: 0.

---

## 2. `npm run typecheck`

```
> vite-react-typescript-starter@0.0.0 typecheck
> tsc --noEmit -p tsconfig.app.json
```

**Summary:** No type errors reported. Exit code: 0.

---

## 3. `npm run build`

```
> vite-react-typescript-starter@0.0.0 build
> vite build

vite v5.4.8 building for production...
transforming...
Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ 1574 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.71 kB │ gzip:  0.39 kB
dist/assets/index-DLIkqh8-.css   13.38 kB │ gzip:  3.35 kB
dist/assets/index-CTJJ3fPC.js   156.96 kB │ gzip: 49.99 kB
✓ built in 2.08s
```

**Summary:** Production build succeeded. 1,574 modules transformed. Exit code: 0.

---

## Baseline Conclusion

| Check       | Result       |
|-------------|--------------|
| Vitest      | 21/21 passed |
| Typecheck   | Clean        |
| Build       | Success      |

The baseline is green. This is the reference state against which any
intentionally introduced defects (BUG-A, BUG-B) in later tasks will be measured.
