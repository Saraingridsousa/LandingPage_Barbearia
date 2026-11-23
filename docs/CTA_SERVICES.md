# CTA and Services refinement — current implementation contract

## Authority and baseline
Sara requested on the current task: improve CTAs with button motion, repair disappearing navbar booking text on hover, append `- Lima Duarte` to the hero address, improve Services with researched ideas, work directly on `main`, commit and push. Working checkout: `C:/Users/sarai/OneDrive/Documentos/Ladin Page - Jr Do Corte/LandingPage_Barbearia`. Baseline and remote main: `375017a23e30f687f2b2de096e356b20833e72d7`, clean before work. Authorization includes committing/pushing this scope to main; no credentials, communications, prices, reviews or new contact numbers may be invented.

## Research and design decision
Primary references consulted:
- Ruffians service/booking presentation: https://ruffians.co.uk/pages/ruffians-soho-liberty — named services, concise descriptions and a direct route toward booking.
- Blind Barber location/booking presentation: https://blindbarber.com/pages/east-village — location context next to appointment actions.
- MDN reduced-motion documentation: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion — honor the operating-system motion preference.

Only general organization/interaction principles are adopted; no copy, photos, price, time estimate or claims from other businesses. Primary surface remains Decide/Learn: hero plus a usable service menu. Preserve existing black/charcoal/gold, Montserrat/MedievalSharp, six real service descriptions and all source images.

Accepted implementation choices:
- D1: Separate ordinary navigation-link hover from the gold CTA. Explicit dark CTA text in every state; visible keyboard focus. Fix specificity, not an !important color patch.
- D2: Short hover/focus lift, arrow movement, border/shadow feedback and active press; no continuous pulse, scroll-reveal hiding, animation dependency or forced scrolling. Reduced-motion removes transforms as well as transitions.
- D3: Organize services into two editorial menus, `Cortes e barba` and `Detalhes e cuidados`, with original icons on warm-gold surfaces, readable descriptions and individually named booking links. Keep all six original services. Add a consult-availability action for visitors unsure which service to choose; no popularity labels or invented bundles.
- D4: Service selection can be reflected at the contact section via textContent and a polite live region. Unconfirmed WhatsApp remains inactive; Instagram fallback and already-confirmed configuration paths must both continue working. No message is sent automatically.

## Reproduced defect before changes
`npx playwright test tests/cta-services.spec.cjs --reporter=line` failed on the intended assertion. Navbar hover computed text `rgb(255, 180, 48)` and background `rgb(255, 180, 48)`: contrast ratio 1. The selector `#nav_list a:hover` outranks `#nav_list .button` for color, while the navbar background override also defeats the generic button hover background. Baseline evidence: `evidence/cta-services/red-navbar.log` and `navbar-hover-before.png`.

## Requirements and observable acceptance
| ID | Acceptance | Evidence / source |
|---|---|---|
| CTA-01 | Navbar button label contrast >=4.5:1 in default/hover/focus/pressed states; ordinary nav links still highlight | focused Playwright CSS/contrast test; header.css |
| CTA-02 | Buttons have subtle non-looping interaction feedback; keyboard parity; no transforms/transitions with reduced motion | browser computed-style tests; styles.css |
| LOC-01 | Hero address exactly `Rua Vieira Pinto, 44 · Centro - Lima Duarte` | DOM regression; index.html |
| SRV-01 | Two named service groups, original six descriptions/icons; no fabricated claims; responsive compact menu | DOM, screenshot and seven-width checks |
| SRV-02 | Individual service selection reaches contact with context; generic CTA clears stale selection; no JS fallback remains useful | browser mouse/keyboard/fallback tests; script.js |
| QA-01 | Full existing and new suites, seven widths, axe open/closed/hover/focus, no horizontal overflow, valid HTML/JS | real commands and saved JSON/logs |
| SHIP-01 | Independent review, explicit-file staging, conventional commits, push main, remote hash readback and clean tree | verification receipt outside repo after push |

## Graph orientation
Queried the existing external Graphify graph and inspected its vocabulary. It includes test/tool references but does not extract the IIFE navigation logic or CSS; direct source and real browser tests are authoritative for this defect. Refresh the graph after structural changes without presenting it as comprehensive CSS coverage.

## Final implementation and verification
All safe requirements in this refinement are implemented. Final Chromium suite: **32 passed**, zero failed, skipped or flaky. Evidence: `evidence/cta-services/playwright-results.json` and `full-suite.log`. The historical 24-test report is intentionally preserved in the parent evidence directory.

- CTA-01: reproduced 1:1 contrast before the change; after the specificity fix, hovered text/background contrast is about **12.41:1**. Default, hover, focus and pressed states are checked at 375, 1024 and 1440px; axe also checks the interacted navbar.
- CTA-02: button lift and arrow movement work with pointer and keyboard-only focus. Press feedback returns the button to rest. Reduced-motion removes transforms/transitions; no looping animation was added. Test checks keyboard motion with the pointer explicitly away from the button.
- LOC-01: exact requested address is present in the hero.
- SRV-01: two named groups, six unchanged service descriptions and exact original optimized image paths. Mobile and desktop views inspected visually, including a full-resolution 320px crop. No icon becomes invisible on the dark background because the original artwork sits on warm gold.
- SRV-02: click and Enter activation expose the chosen service at contact, preserve the Instagram fallback and move focus to contact. A generic CTA clears stale service context. Configured WhatsApp URLs and the no-JavaScript fallback remain covered by the existing suite. No communications were sent.
- QA-01: full suite passed in 320, 375, 390, 430, 768, 1024 and 1440px; axe selected A/AA rules report no violations. HTML and JS validation exit 0; npm audit reports zero vulnerabilities. Direct-file opening and service selection were also executed successfully. All 14 original image hashes are unchanged.
- SHIP-01: independent read-only review returned `passed=true`, no security or logic blockers. All three non-blocking suggestions were applied: stronger keyboard-motion assertions, exact icon-path assertions and screenshot output-directory override. The full suite was rerun afterward. Commit/push are the final operation; readback receipt is kept outside the source tree to avoid a self-referential commit.

### Current lab performance
Lighthouse 12.6.1 was executed against a disposable copy of this implementation, using the existing isolated auditor outside the application. Latest results: performance 93 mobile / 100 desktop, accessibility 100, best practices 100 and SEO 100 on both profiles; mobile LCP ~1.9 s, CLS 0, TBT ~290 ms. Raw data and compact summary are preserved under this task's evidence directory. The historic first-release mobile score was 98, but those single lab runs differ in load/timing and do not establish a field performance change or causation. No animation loop, new runtime dependency, image download or observer was added; TBT is not field INP. Safari/Firefox and manual screen-reader review remain outside the executed coverage.

### Changed source and deliverables
- `index.html`: address, grouped service menu and contact selection status.
- `src/styles/header.css`: corrected normal-link versus booking-link interaction selectors.
- `src/styles/styles.css`: reusable hover/focus/press motion and reduced-motion-safe arrows.
- `src/styles/servicos.css`: editorial service menu, original icon surfaces and responsive groups.
- `src/styles/footer.css`: selected-service indication at contact.
- `src/javascript/script.js`: safe progressive in-page service context via textContent.
- `tests/cta-services.spec.cjs`, `cta-motion.spec.cjs`, `service-menu.spec.cjs`, `booking-context.spec.cjs`: new regressions; existing validation suite and config accept `JR_EVIDENCE_DIR` so historical evidence is not overwritten.
- `README.md`, this document and `evidence/cta-services/`: current usage, decisions and real verification evidence. Full seven-width screenshots and raw Lighthouse reports remain local/ignored to avoid repeatedly bloating Git; focused desktop/mobile previews, summaries and test logs are committed.
- `.gitattributes` preserves captured logs verbatim; `.gitignore` narrowly excludes bulky regenerable task artifacts. No package/dependency change.

### Visual self-audit
The former service section repeated six equally weighted tiles. The revised section is a grouped service menu, with icon wells beside—not above—headings, concise original descriptions and a distinct availability action. Self-audit: no generic gradient, false metric, decorative accent rail, glass effect, centered feature-tile repetition or wrong-surface layout remains in this change (0/10 of the skill's listed generic-design tells). The brand's existing typefaces and colors are retained.

### Graph refresh
External code-only Graphify refresh: 102 nodes, 112 edges, nine communities; exported-graph diagnostics show no missing/dangling endpoints or collapsed pairs. It still does not model the stylesheet cascade or IIFE event handlers, so the browser reproduction and source inspection—not the graph—establish the hover fix. Generated graph stays outside the repository.

### Remaining business decision
The highest-impact next conversion improvement is confirming the real WhatsApp number so a service-specific booking message can open directly. This task does not choose a number, publish fake reviews/prices/hours, or claim a measurable conversion uplift without visitor data.
