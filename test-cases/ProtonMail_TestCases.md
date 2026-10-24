npm run test:allure# Proton Mail - Test Cases

> Generated from `test-cases/testCases.source.json` by `npm run testcases:build`. Edit the JSON, not this file.

**55 test cases designed**, **31 automated** (implemented in `tests/`).

| Classification | Count |
|---|---|
| Automate | 40 |
| Manual / Exploratory | 11 |
| Not worth automating | 4 |

| Priority | Count |
|---|---|
| P0 | 6 |
| P1 | 19 |
| P2 | 20 |
| P3 | 10 |

**Common preconditions:** `A` = Account A (sender) exists, 2FA disabled, English UI, credentials in .env; `B` = Account B (receiver) exists, 2FA disabled, English UI, credentials in .env; `OUT` = User is signed out (empty browser storage); `PUB` = No account needed; public page https://proton.me/mail reachable

## Overview

| ID | Feature | Scenario | Priority | Classification | Automated test |
|---|---|---|---|---|---|
| LAND-001 | Landing page | Hero presents the privacy value proposition, trust signals and both acquisition paths | P0 | Automate | `tests/landing/landing.spec.ts` |
| LAND-002 | Landing page | "Create a free account" starts the free sign-up flow | P0 | Automate | `tests/landing/landing.spec.ts` |
| LAND-003 | Landing page | Returning user reaches the sign-in form from the page header | P0 | Automate | `tests/landing/landing.spec.ts` |
| LAND-004 | Landing page | Plans offer Proton Unlimited, a recommended Mail Plus and a free plan without credit card | P1 | Automate | `tests/landing/landing.spec.ts` |
| LAND-005 | Landing page | Switching billing period re-prices Mail Plus and restores the yearly price | P1 | Automate | `tests/landing/landing.spec.ts` |
| LAND-006 | Landing page | Choosing Mail Plus leads to sign-up / checkout for that plan | P1 | Automate | `tests/landing/landing.spec.ts` |
| LAND-007 | Landing page | Changing currency re-prices the plans | P2 | Automate | `tests/landing/landing.spec.ts` |
| LAND-008 | Landing page | "Get Mail for Business" leads to the business offering | P1 | Automate | `tests/landing/landing.spec.ts` |
| LAND-009 | Landing page | FAQ lists all six questions; answers expand and collapse | P2 | Automate | `tests/landing/landing.spec.ts` |
| LAND-010 | Landing page | Footer exposes legal links, company identity, language selector and current copyright | P2 | Automate | `tests/landing/landing.spec.ts` |
| LAND-011 | Landing page | Phone layout: menu reveals Sign in, hero usable, no horizontal scrolling | P2 | Automate | `tests/landing/landing.spec.ts` |
| LAND-012 | Landing page | Feature carousel, imagery and visual design | P3 | Not worth automating | - |
| LAND-013 | Landing page | Page health: no console errors or failed first-party requests | P3 | Automate | - |
| LAND-014 | Landing page | Page in other languages via the language selector | P3 | Manual / Exploratory | - |
| AUTH-001 | Authentication | Valid credentials open the mailbox; session survives a page reload | P0 | Automate | `tests/authentication/authentication.spec.ts` |
| AUTH-002 | Authentication | Invalid credentials are rejected | P0 | Automate | `tests/authentication/authentication.spec.ts` |
| AUTH-003 | Authentication | Empty sign-in form shows required-field validation | P2 | Automate | `tests/authentication/authentication.spec.ts` |
| AUTH-004 | Authentication | Sign-out ends the session; Back does not reopen the mailbox | P1 | Automate | `tests/authentication/authentication.spec.ts` |
| AUTH-005 | Authentication | Sign-in with 2FA (TOTP) enabled | P1 | Manual / Exploratory | - |
| AUTH-006 | Authentication | Repeated failed sign-ins trigger human verification / rate limiting | P2 | Manual / Exploratory | - |
| AUTH-007 | Authentication | Session revoked from another device signs this browser out | P2 | Manual / Exploratory | - |
| COMP-001 | Compose & send | Two-account send: B receives with correct sender, subject and body | P0 | Automate | `tests/compose/compose.spec.ts` |
| COMP-002a | Compose & send | Send blocked for a malformed recipient address | P1 | Automate | `tests/compose/compose.spec.ts` |
| COMP-002b | Compose & send | Send blocked when no recipient is given | P1 | Automate | `tests/compose/compose.spec.ts` |
| COMP-003 | Compose & send | CC visible to recipients, BCC hidden | P1 | Automate | `tests/compose/compose.spec.ts` |
| COMP-004 | Compose & send | Password-protected email to an external recipient | P2 | Manual / Exploratory | - |
| COMP-005 | Compose & send | Subject/body boundaries: empty subject warning, very long subject, unicode/emoji | P3 | Automate | - |
| COMP-006 | Compose & send | Rich-text formatting renders consistently for the recipient | P3 | Not worth automating | - |
| DRAFT-001 | Drafts | Auto-save to Drafts without closing composer; persists after full reload | P1 | Automate | `tests/drafts/drafts.spec.ts` |
| DRAFT-002 | Drafts | Reopen, edit, reload, then send: draft moves from Drafts to Sent | P1 | Automate | `tests/drafts/drafts.spec.ts` |
| DRAFT-003 | Drafts | Delete draft removes it permanently | P2 | Automate | `tests/drafts/drafts.spec.ts` |
| DRAFT-004 | Drafts | Draft with attachment keeps the attachment after reload | P2 | Automate | - |
| DRAFT-005 | Drafts | Same draft edited concurrently in two tabs | P3 | Manual / Exploratory | - |
| INBOX-001 | Inbox & message actions | Unread -> read on open -> mark unread | P1 | Automate | `tests/inbox/inbox.spec.ts` |
| INBOX-002 | Inbox & message actions | Star / unstar updates Starred folder | P1 | Automate | `tests/inbox/inbox.spec.ts` |
| INBOX-003 | Inbox & message actions | Inbox -> Archive -> Trash -> restore to Inbox | P1 | Automate | `tests/inbox/inbox.spec.ts` |
| INBOX-004 | Inbox & message actions | Bulk select and move several messages | P2 | Automate | - |
| FOLDER-001 | Folders & labels | Create custom folder, move message into it, delete folder | P2 | Automate | - |
| LABEL-001 | Folders & labels | Apply and remove a label | P2 | Automate | - |
| SEARCH-001 | Search | Keyword search returns exactly the match; clear restores folder view | P1 | Automate | `tests/search/search.spec.ts` |
| SEARCH-002 | Search | Advanced search: keyword AND sender (plus no-result case) | P1 | Automate | `tests/search/search.spec.ts` |
| SEARCH-003 | Search | Date-range search | P3 | Manual / Exploratory | - |
| SEARCH-004 | Search | Body content search with client-side index enabled | P3 | Manual / Exploratory | - |
| FILTER-001 | Filters | Subject filter moves matching mail to Archive; non-matching stays in Inbox | P1 | Automate | `tests/filters/filters.spec.ts` |
| FILTER-002 | Filters | Disabled filter no longer applies; edit changes behaviour | P2 | Automate | - |
| FILTER-003 | Filters | Sieve (advanced) filter syntax | P3 | Not worth automating | - |
| ATT-001 | Attachments | Upload, send and receive an attachment with the same file name | P1 | Automate | `tests/attachments/attachments.spec.ts` |
| ATT-002 | Attachments | Remove attachment before sending | P2 | Automate | - |
| ATT-003 | Attachments | Attachment over the size limit is rejected | P2 | Manual / Exploratory | - |
| ATT-004 | Attachments | Download received attachment and verify content | P2 | Automate | - |
| ASYNC-001 | Asynchronous workflows | Undo Send: transient undo state, restored composer, final send after window | P1 | Automate | `tests/async/async.spec.ts` |
| ASYNC-002 | Asynchronous workflows | Schedule send for tomorrow, verify Scheduled state, cancel via Edit | P2 | Automate | `tests/async/async.spec.ts` |
| ASYNC-003 | Asynchronous workflows | Scheduled message is actually delivered at the scheduled time | P2 | Manual / Exploratory | - |
| UX-001 | Cross-cutting | Visual layout, themes and responsive breakpoints | P3 | Not worth automating | - |
| A11Y-001 | Cross-cutting | Keyboard navigation and screen-reader labels | P2 | Manual / Exploratory | - |

## Detailed test cases

### LAND-001 - Hero presents the privacy value proposition, trust signals and both acquisition paths

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P0 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail |
| Expected result | Page served (< 400); title contains "Proton Mail"; H1 "Secure email that protects your privacy"; value proposition (encrypted, Switzerland); trust signals (100 million users, app rating, recommended by experts); "Create a free account" and "Get Mail for Business" visible |
| Automation classification | Automate |
| Reason | First impression and conversion point for every visitor; a broken hero blocks all acquisition |
| Automated test | tests/landing/landing.spec.ts |

### LAND-002 - "Create a free account" starts the free sign-up flow

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P0 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail<br>2. Click "Create a free account" (nothing is entered) |
| Expected result | Proton account sign-up page opens |
| Automation classification | Automate |
| Reason | Main acquisition funnel; checked without creating accounts |
| Automated test | tests/landing/landing.spec.ts |

### LAND-003 - Returning user reaches the sign-in form from the page header

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P0 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail (desktop)<br>2. Click "Sign in" |
| Expected result | account.proton.me sign-in with username, password and enabled "Sign in" button |
| Automation classification | Automate |
| Reason | Only public path into the mailbox; links the public page to the AUTH-* tests |
| Automated test | tests/landing/landing.spec.ts |

### LAND-004 - Plans offer Proton Unlimited, a recommended Mail Plus and a free plan without credit card

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P1 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail<br>2. Scroll to "Proton Mail plans for your privacy" |
| Expected result | Cards for Proton Unlimited, Mail Plus, Proton Free, each with its CTA; Free shows 0.00 and "No credit card required"; Mail Plus marked Recommended |
| Automation classification | Automate |
| Reason | Revenue-relevant content; asserts structure and rules, not exact prices (region/promotion dependent) |
| Automated test | tests/landing/landing.spec.ts |

### LAND-005 - Switching billing period re-prices Mail Plus and restores the yearly price

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P1 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open plans<br>2. Select "12 months", read Mail Plus price<br>3. Select "1 month"<br>4. Select "12 months" again |
| Expected result | 12 months shows "every 12 months" billing note; 1 month shows a different price without it; switching back restores the yearly price |
| Automation classification | Automate |
| Reason | State transition on pricing, both directions; wrong prices are a business and legal risk |
| Automated test | tests/landing/landing.spec.ts |

### LAND-006 - Choosing Mail Plus leads to sign-up / checkout for that plan

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P1 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open plans<br>2. Click "Get Mail Plus" (nothing is entered) |
| Expected result | Proton account sign-up / checkout opens for the paid plan |
| Automation classification | Automate |
| Reason | Paid conversion funnel entry point |
| Automated test | tests/landing/landing.spec.ts |

### LAND-007 - Changing currency re-prices the plans

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P2 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open plans<br>2. Change currency from USD to EUR |
| Expected result | Selector shows EUR; plan prices shown in euro |
| Automation classification | Automate |
| Reason | International customers; currency state must propagate to all prices |
| Automated test | tests/landing/landing.spec.ts |

### LAND-008 - "Get Mail for Business" leads to the business offering

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P1 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail<br>2. Click "Get Mail for Business" |
| Expected result | Business page opens |
| Automation classification | Automate |
| Reason | B2B acquisition funnel |
| Automated test | tests/landing/landing.spec.ts |

### LAND-009 - FAQ lists all six questions; answers expand and collapse

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P2 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Scroll to "Proton Mail FAQ"<br>2. Expand "Is Proton Mail free?"<br>3. Collapse it |
| Expected result | Six questions listed; the answer expands, then collapses |
| Automation classification | Automate |
| Reason | Self-service information that reduces support load; interaction state is verifiable |
| Automated test | tests/landing/landing.spec.ts |

### LAND-010 - Footer exposes legal links, company identity, language selector and current copyright

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P2 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail<br>2. Inspect footer |
| Expected result | Privacy Policy and Terms & conditions link to legal pages; Proton AG, Geneva, Switzerland; language selector; "© <current year> Proton AG" |
| Automation classification | Automate |
| Reason | Legal/compliance obligations; stale copyright or broken legal links are visible quality issues |
| Automated test | tests/landing/landing.spec.ts |

### LAND-011 - Phone layout: menu reveals Sign in, hero usable, no horizontal scrolling

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P2 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail on a phone profile<br>2. Open the menu |
| Expected result | H1 in viewport, "Create a free account" visible, page fits the width; menu shows "Sign in" |
| Automation classification | Automate |
| Reason | Large share of visitors are mobile; layout-level checks are stable |
| Automated test | tests/landing/landing.spec.ts |

### LAND-012 - Feature carousel, imagery and visual design

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P3 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Review sections and carousel on desktop and phone |
| Expected result | Content readable, carousel navigates, images load |
| Automation classification | Not worth automating |
| Reason | Marketing visuals change often; pixel/visual assertions would be brittle and low value |
| Automated test | - |

### LAND-013 - Page health: no console errors or failed first-party requests

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P3 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Open https://proton.me/mail with console/network listeners |
| Expected result | No console errors; no proton.me request >= 400 |
| Automation classification | Automate |
| Reason | Backlog: needs an allow-list for third-party noise before it is reliable |
| Automated test | - |

### LAND-014 - Page in other languages via the language selector

| Field | Value |
|---|---|
| Feature | Landing page |
| Priority | P3 |
| Preconditions | PUB |
| Test data | No account; nothing submitted |
| Steps | 1. Switch language in the footer |
| Expected result | Page content and links localised |
| Automation classification | Manual / Exploratory |
| Reason | Translation quality needs human review |
| Automated test | - |

### AUTH-001 - Valid credentials open the mailbox; session survives a page reload

| Field | Value |
|---|---|
| Feature | Authentication |
| Priority | P0 |
| Preconditions | OUT; A |
| Test data | Account A credentials from .env |
| Steps | 1. Open https://mail.proton.me (redirects to sign-in)<br>2. Enter valid username and password, tick 'Keep me signed in'<br>3. Click Sign in<br>4. Reload the page |
| Expected result | Inbox (/u/<n>/inbox) is shown with the Compose button; after reload the user is still signed in and not redirected to sign-in |
| Automation classification | Automate |
| Reason | Gatekeeper for every other journey; stable and cheap |
| Automated test | tests/authentication/authentication.spec.ts |

### AUTH-002 - Invalid credentials are rejected

| Field | Value |
|---|---|
| Feature | Authentication |
| Priority | P0 |
| Preconditions | OUT |
| Test data | Non-existent user + wrong password (test-data/testData.json) |
| Steps | 1. Open sign-in<br>2. Enter unknown username and wrong password<br>3. Click Sign in |
| Expected result | 'Incorrect login credentials' error; user stays on the sign-in form; no mailbox URL reached |
| Automation classification | Automate |
| Reason | Security-relevant negative path; deterministic; needs no account |
| Automated test | tests/authentication/authentication.spec.ts |

### AUTH-003 - Empty sign-in form shows required-field validation

| Field | Value |
|---|---|
| Feature | Authentication |
| Priority | P2 |
| Preconditions | OUT |
| Test data | Empty username and password |
| Steps | 1. Open sign-in<br>2. Click Sign in without typing |
| Expected result | 'This field is required' shown, username field focused, no navigation |
| Automation classification | Automate |
| Reason | Boundary/validation case; fast; no account needed |
| Automated test | tests/authentication/authentication.spec.ts |

### AUTH-004 - Sign-out ends the session; Back does not reopen the mailbox

| Field | Value |
|---|---|
| Feature | Authentication |
| Priority | P1 |
| Preconditions | OUT; A |
| Test data | Account A |
| Steps | 1. Sign in as A<br>2. Open account menu > Sign out<br>3. Press browser Back<br>4. Navigate directly to /u/0/inbox |
| Expected result | Sign-in page after sign-out, after Back, and after direct navigation; cached mail is never displayed |
| Automation classification | Automate |
| Reason | Session-termination security behaviour; state transition |
| Automated test | tests/authentication/authentication.spec.ts |

### AUTH-005 - Sign-in with 2FA (TOTP) enabled

| Field | Value |
|---|---|
| Feature | Authentication |
| Priority | P1 |
| Preconditions | Account with TOTP 2FA |
| Test data | TOTP secret |
| Steps | 1. Sign in with valid password<br>2. Enter TOTP code |
| Expected result | Mailbox opens only after a valid code; invalid code rejected |
| Automation classification | Manual / Exploratory |
| Reason | Needs a TOTP secret in the test environment; storing it in automation weakens the account's security. Candidate for automation only with a dedicated secrets vault |
| Automated test | - |

### AUTH-006 - Repeated failed sign-ins trigger human verification / rate limiting

| Field | Value |
|---|---|
| Feature | Authentication |
| Priority | P2 |
| Preconditions | OUT |
| Test data | Wrong password x N |
| Steps | 1. Submit wrong credentials repeatedly |
| Expected result | Proton throttles and presents human verification |
| Automation classification | Manual / Exploratory |
| Reason | Automating it would hammer a production service and must never attempt to bypass CAPTCHA |
| Automated test | - |

### AUTH-007 - Session revoked from another device signs this browser out

| Field | Value |
|---|---|
| Feature | Authentication |
| Priority | P2 |
| Preconditions | A signed in on two browsers |
| Test data | Account A |
| Steps | 1. Revoke session from Settings > Security on browser 2<br>2. Use mailbox on browser 1 |
| Expected result | Browser 1 is signed out at next server call |
| Automation classification | Manual / Exploratory |
| Reason | Would invalidate cached sessions used by the rest of the suite; low regression frequency |
| Automated test | - |

### COMP-001 - Two-account send: B receives with correct sender, subject and body

| Field | Value |
|---|---|
| Feature | Compose & send |
| Priority | P0 |
| Preconditions | A; B |
| Test data | Unique subject 'Automation Assessment [PMA-<run>] COMP-001 <rnd>' and body |
| Steps | 1. A: Compose to B, enter subject and body<br>2. A: Send<br>3. A: Verify 'Message sent' and message in Sent<br>4. B: Wait for delivery to Inbox<br>5. B: Open message |
| Expected result | B sees A's address as sender, the exact subject and body |
| Automation classification | Automate |
| Reason | Core business journey end-to-end across two mailboxes |
| Automated test | tests/compose/compose.spec.ts |

### COMP-002a - Send blocked for a malformed recipient address

| Field | Value |
|---|---|
| Feature | Compose & send |
| Priority | P1 |
| Preconditions | A |
| Test data | Recipient 'not-an-email' |
| Steps | 1. Compose with malformed recipient, subject, body<br>2. Click Send |
| Expected result | Invalid-address validation shown; composer stays open; no 'Message sent' |
| Automation classification | Automate |
| Reason | Negative validation; protects against silent mis-sends |
| Automated test | tests/compose/compose.spec.ts |

### COMP-002b - Send blocked when no recipient is given

| Field | Value |
|---|---|
| Feature | Compose & send |
| Priority | P1 |
| Preconditions | A |
| Test data | No recipient |
| Steps | 1. Compose with subject and body only<br>2. Click Send |
| Expected result | Missing-recipient validation shown; composer stays open; nothing sent |
| Automation classification | Automate |
| Reason | Boundary (empty) case of the same rule, different validation branch |
| Automated test | tests/compose/compose.spec.ts |

### COMP-003 - CC visible to recipients, BCC hidden

| Field | Value |
|---|---|
| Feature | Compose & send |
| Priority | P1 |
| Preconditions | A; B |
| Test data | To: B, CC: A, BCC: A+bcc alias |
| Steps | 1. A: Compose with To, CC and BCC<br>2. A: Send<br>3. B: Open the delivered message header |
| Expected result | B sees A in CC; the BCC alias does not appear anywhere in B's header |
| Automation classification | Automate |
| Reason | Privacy-critical: a BCC leak is a high-impact defect |
| Automated test | tests/compose/compose.spec.ts |

### COMP-004 - Password-protected email to an external recipient

| Field | Value |
|---|---|
| Feature | Compose & send |
| Priority | P2 |
| Preconditions | A; external mailbox |
| Test data | Password + hint |
| Steps | 1. Compose to external address<br>2. Set password and hint<br>3. Send<br>4. Open link in external mailbox and decrypt |
| Expected result | Recipient needs the password; message decrypts correctly |
| Automation classification | Manual / Exploratory |
| Reason | Needs a non-Proton mailbox and link handling outside the app; better as a periodic exploratory check |
| Automated test | - |

### COMP-005 - Subject/body boundaries: empty subject warning, very long subject, unicode/emoji

| Field | Value |
|---|---|
| Feature | Compose & send |
| Priority | P3 |
| Preconditions | A |
| Test data | '', 300-char subject, emoji text |
| Steps | 1. Compose with each value<br>2. Send to self |
| Expected result | Empty subject prompts confirmation; long/unicode subjects preserved |
| Automation classification | Automate |
| Reason | Backlog: data-driven extension of COMP-001 (lower risk, deferred to keep suite at 20) |
| Automated test | - |

### COMP-006 - Rich-text formatting renders consistently for the recipient

| Field | Value |
|---|---|
| Feature | Compose & send |
| Priority | P3 |
| Preconditions | A; B |
| Test data | Bold/list/link |
| Steps | 1. Compose formatted message<br>2. Send<br>3. Inspect on B |
| Expected result | Formatting preserved |
| Automation classification | Not worth automating |
| Reason | Visual fidelity check; brittle in UI automation, better covered by component tests or manual review |
| Automated test | - |

### DRAFT-001 - Auto-save to Drafts without closing composer; persists after full reload

| Field | Value |
|---|---|
| Feature | Drafts |
| Priority | P1 |
| Preconditions | A |
| Test data | Unique subject/body |
| Steps | 1. Open composer, type subject and body (do not close)<br>2. Open Drafts<br>3. Reload the page<br>4. Reopen draft |
| Expected result | Draft listed while composer is still open; after reload it reopens with the same subject and body |
| Automation classification | Automate |
| Reason | Data-loss risk; tests true server-side auto-save, not just save-on-close |
| Automated test | tests/drafts/drafts.spec.ts |

### DRAFT-002 - Reopen, edit, reload, then send: draft moves from Drafts to Sent

| Field | Value |
|---|---|
| Feature | Drafts |
| Priority | P1 |
| Preconditions | A |
| Test data | Unique subject; edit token |
| Steps | 1. Create draft to self<br>2. Reopen, append edit, close<br>3. Reload, reopen<br>4. Send |
| Expected result | Edit persists across reload; after sending the draft is gone from Drafts and present in Sent |
| Automation classification | Automate |
| Reason | Full draft state transition (draft -> edited -> sent) |
| Automated test | tests/drafts/drafts.spec.ts |

### DRAFT-003 - Delete draft removes it permanently

| Field | Value |
|---|---|
| Feature | Drafts |
| Priority | P2 |
| Preconditions | A |
| Test data | Unique subject |
| Steps | 1. Create draft<br>2. Reopen and Delete draft (confirm)<br>3. Reload |
| Expected result | Draft not listed before or after reload |
| Automation classification | Automate |
| Reason | Destructive action must be final and server-side |
| Automated test | tests/drafts/drafts.spec.ts |

### DRAFT-004 - Draft with attachment keeps the attachment after reload

| Field | Value |
|---|---|
| Feature | Drafts |
| Priority | P2 |
| Preconditions | A |
| Test data | test-data/attachment.txt |
| Steps | 1. Compose, attach file, close<br>2. Reload, reopen draft |
| Expected result | Attachment still listed with the same name |
| Automation classification | Automate |
| Reason | Backlog: combines DRAFT-001 and ATT-001 building blocks; deferred to stay within 15-20 tests |
| Automated test | - |

### DRAFT-005 - Same draft edited concurrently in two tabs

| Field | Value |
|---|---|
| Feature | Drafts |
| Priority | P3 |
| Preconditions | A in two tabs |
| Test data | - |
| Steps | 1. Open same draft in two tabs<br>2. Edit both |
| Expected result | Conflict handled without silent data loss |
| Automation classification | Manual / Exploratory |
| Reason | Behaviour is not clearly specified; exploratory investigation gives more value |
| Automated test | - |

### INBOX-001 - Unread -> read on open -> mark unread

| Field | Value |
|---|---|
| Feature | Inbox & message actions |
| Priority | P1 |
| Preconditions | A; B |
| Test data | Seeded message A -> B |
| Steps | 1. Seed message to B<br>2. B: verify row is unread<br>3. B: open message<br>4. B: Mark as unread |
| Expected result | Row unread, then read after opening, then unread again |
| Automation classification | Automate |
| Reason | Most frequent user action; read state drives counters and notifications |
| Automated test | tests/inbox/inbox.spec.ts |

### INBOX-002 - Star / unstar updates Starred folder

| Field | Value |
|---|---|
| Feature | Inbox & message actions |
| Priority | P1 |
| Preconditions | A; B |
| Test data | Seeded message |
| Steps | 1. B: star message in Inbox<br>2. B: open Starred<br>3. B: unstar |
| Expected result | Message listed in Starred after starring and absent after unstarring |
| Automation classification | Automate |
| Reason | Verifies derived-folder state, not just icon toggle |
| Automated test | tests/inbox/inbox.spec.ts |

### INBOX-003 - Inbox -> Archive -> Trash -> restore to Inbox

| Field | Value |
|---|---|
| Feature | Inbox & message actions |
| Priority | P1 |
| Preconditions | A; B |
| Test data | Seeded message |
| Steps | 1. B: Archive<br>2. B: from Archive move to Trash<br>3. B: from Trash move to Inbox |
| Expected result | After every move the message is in exactly the target folder and absent from the source |
| Automation classification | Automate |
| Reason | State-transition coverage of all core move actions incl. restore |
| Automated test | tests/inbox/inbox.spec.ts |

### INBOX-004 - Bulk select and move several messages

| Field | Value |
|---|---|
| Feature | Inbox & message actions |
| Priority | P2 |
| Preconditions | A; B; >=3 seeded messages |
| Test data | 3 unique subjects |
| Steps | 1. Select 3 rows<br>2. Move to Archive |
| Expected result | All 3 moved, none left behind |
| Automation classification | Automate |
| Reason | Backlog: needs 3 deliveries per run (slow); single-message moves already cover the action logic |
| Automated test | - |

### FOLDER-001 - Create custom folder, move message into it, delete folder

| Field | Value |
|---|---|
| Feature | Folders & labels |
| Priority | P2 |
| Preconditions | A |
| Test data | Folder 'PMA <run>' |
| Steps | 1. Create folder<br>2. Move message<br>3. Delete folder |
| Expected result | Message listed in folder; folder removal handled |
| Automation classification | Automate |
| Reason | Backlog: free plan folder limits make cleanup mandatory; next candidate after current 20 |
| Automated test | - |

### LABEL-001 - Apply and remove a label

| Field | Value |
|---|---|
| Feature | Folders & labels |
| Priority | P2 |
| Preconditions | A |
| Test data | Label 'PMA <run>' |
| Steps | 1. Create label<br>2. Apply to message<br>3. Remove label |
| Expected result | Message listed under label only while applied |
| Automation classification | Automate |
| Reason | Backlog, same reasoning as FOLDER-001 |
| Automated test | - |

### SEARCH-001 - Keyword search returns exactly the match; clear restores folder view

| Field | Value |
|---|---|
| Feature | Search |
| Priority | P1 |
| Preconditions | A; B |
| Test data | Unique token in subject |
| Steps | 1. Seed message with token<br>2. B: search token<br>3. B: clear search |
| Expected result | Exactly one result with the subject; URL holds keyword; after clear the keyword is gone and Inbox lists the message |
| Automation classification | Automate |
| Reason | Primary retrieval path; exact-result assertion catches over- and under-matching |
| Automated test | tests/search/search.spec.ts |

### SEARCH-002 - Advanced search: keyword AND sender (plus no-result case)

| Field | Value |
|---|---|
| Feature | Search |
| Priority | P1 |
| Preconditions | A; B |
| Test data | Same token in two messages from A and from B |
| Steps | 1. Seed message A->B and B->B with same token<br>2. B: advanced search keyword + From=A<br>3. B: advanced search keyword + From=unknown |
| Expected result | Only A's message returned; unknown sender gives 'No results' |
| Automation classification | Automate |
| Reason | Multi-condition search with discriminating data proves the AND logic; includes no-result behaviour |
| Automated test | tests/search/search.spec.ts |

### SEARCH-003 - Date-range search

| Field | Value |
|---|---|
| Feature | Search |
| Priority | P3 |
| Preconditions | Messages of known ages |
| Test data | Historic mailbox |
| Steps | 1. Search with start/end dates |
| Expected result | Only messages inside range |
| Automation classification | Manual / Exploratory |
| Reason | Needs aged data that cannot be created on demand through the UI |
| Automated test | - |

### SEARCH-004 - Body content search with client-side index enabled

| Field | Value |
|---|---|
| Feature | Search |
| Priority | P3 |
| Preconditions | Content search enabled |
| Test data | Body-only token |
| Steps | 1. Enable message content search<br>2. Search body token |
| Expected result | Message found by body text |
| Automation classification | Manual / Exploratory |
| Reason | Requires building a local encrypted index (slow, device-specific) |
| Automated test | - |

### FILTER-001 - Subject filter moves matching mail to Archive; non-matching stays in Inbox

| Field | Value |
|---|---|
| Feature | Filters |
| Priority | P1 |
| Preconditions | A; B; no other suite filter |
| Test data | Filter 'PMA filter [PMA-<run>] <token>', subject contains <token> |
| Steps | 1. B: create filter (subject contains token -> Archive)<br>2. A: send matching and non-matching mail<br>3. B: check Inbox and Archive<br>4. Delete filter (cleanup) |
| Expected result | Matching message only in Archive; non-matching in Inbox; filter removed afterwards |
| Automation classification | Automate |
| Reason | Rule behaviour validated with both matching and non-matching data |
| Automated test | tests/filters/filters.spec.ts |

### FILTER-002 - Disabled filter no longer applies; edit changes behaviour

| Field | Value |
|---|---|
| Feature | Filters |
| Priority | P2 |
| Preconditions | B with filter |
| Test data | As FILTER-001 |
| Steps | 1. Disable filter<br>2. Send matching mail<br>3. Re-enable/edit |
| Expected result | Disabled filter has no effect |
| Automation classification | Automate |
| Reason | Backlog: adds two more deliveries; free plan allows a single filter so runs must be serial |
| Automated test | - |

### FILTER-003 - Sieve (advanced) filter syntax

| Field | Value |
|---|---|
| Feature | Filters |
| Priority | P3 |
| Preconditions | Paid plan |
| Test data | Sieve script |
| Steps | 1. Create Sieve filter |
| Expected result | Valid scripts saved, invalid rejected |
| Automation classification | Not worth automating |
| Reason | Paid feature; syntax validation is cheaper to test below the UI |
| Automated test | - |

### ATT-001 - Upload, send and receive an attachment with the same file name

| Field | Value |
|---|---|
| Feature | Attachments |
| Priority | P1 |
| Preconditions | A; B |
| Test data | test-data/attachment.txt |
| Steps | 1. A: compose to B, attach file<br>2. Wait for upload to finish<br>3. Send<br>4. B: open message |
| Expected result | Composer lists the file; message in Sent; B sees attachment 'attachment.txt' |
| Automation classification | Automate |
| Reason | Attachments are encrypted client-side - high-risk path |
| Automated test | tests/attachments/attachments.spec.ts |

### ATT-002 - Remove attachment before sending

| Field | Value |
|---|---|
| Feature | Attachments |
| Priority | P2 |
| Preconditions | A |
| Test data | attachment.txt |
| Steps | 1. Attach<br>2. Remove<br>3. Send |
| Expected result | Received message has no attachment |
| Automation classification | Automate |
| Reason | Backlog |
| Automated test | - |

### ATT-003 - Attachment over the size limit is rejected

| Field | Value |
|---|---|
| Feature | Attachments |
| Priority | P2 |
| Preconditions | A |
| Test data | >25 MB file |
| Steps | 1. Attach oversized file |
| Expected result | Clear size-limit error; nothing uploaded |
| Automation classification | Manual / Exploratory |
| Reason | Uploading large encrypted files is slow and bandwidth-heavy for every run |
| Automated test | - |

### ATT-004 - Download received attachment and verify content

| Field | Value |
|---|---|
| Feature | Attachments |
| Priority | P2 |
| Preconditions | As ATT-001 |
| Test data | attachment.txt |
| Steps | 1. B: download attachment<br>2. Compare checksum |
| Expected result | Downloaded file identical to original |
| Automation classification | Automate |
| Reason | Backlog: preview/download UX varies by file type; to be added once the download control is confirmed |
| Automated test | - |

### ASYNC-001 - Undo Send: transient undo state, restored composer, final send after window

| Field | Value |
|---|---|
| Feature | Asynchronous workflows |
| Priority | P1 |
| Preconditions | A; Undo-send window > 0 (default) |
| Test data | Unique subject |
| Steps | 1. Compose and Send<br>2. Click Undo in the toast<br>3. Verify composer content and Sent folder<br>4. Send again and let the undo window expire |
| Expected result | Undo restores the composer and nothing is in Sent; after the window closes the message is in Sent |
| Automation classification | Automate |
| Reason | Timing-dependent flow synchronised on observable states, not sleeps |
| Automated test | tests/async/async.spec.ts |

### ASYNC-002 - Schedule send for tomorrow, verify Scheduled state, cancel via Edit

| Field | Value |
|---|---|
| Feature | Asynchronous workflows |
| Priority | P2 |
| Preconditions | A |
| Test data | Unique subject |
| Steps | 1. Compose to self<br>2. Schedule 'Tomorrow'<br>3. Open Scheduled folder and message<br>4. Edit (cancel schedule) |
| Expected result | Message in Scheduled with banner; after Edit it is a draft and no longer scheduled |
| Automation classification | Automate |
| Reason | Covers scheduled state without waiting for real time to pass |
| Automated test | tests/async/async.spec.ts |

### ASYNC-003 - Scheduled message is actually delivered at the scheduled time

| Field | Value |
|---|---|
| Feature | Asynchronous workflows |
| Priority | P2 |
| Preconditions | A; B |
| Test data | Schedule +N minutes |
| Steps | 1. Schedule send<br>2. Wait until delivery time |
| Expected result | Delivered at (not before) scheduled time |
| Automation classification | Manual / Exploratory |
| Reason | Long-running wall-clock test; belongs in a nightly job using API-level scheduling with a short custom time or a controllable clock |
| Automated test | - |

### UX-001 - Visual layout, themes and responsive breakpoints

| Field | Value |
|---|---|
| Feature | Cross-cutting |
| Priority | P3 |
| Preconditions | A |
| Test data | - |
| Steps | 1. Review UI at several viewports and themes |
| Expected result | No visual breakage |
| Automation classification | Not worth automating |
| Reason | Pixel comparisons against a frequently changing production UI produce noise, not signal |
| Automated test | - |

### A11Y-001 - Keyboard navigation and screen-reader labels

| Field | Value |
|---|---|
| Feature | Cross-cutting |
| Priority | P2 |
| Preconditions | A |
| Test data | - |
| Steps | 1. Navigate mailbox and composer by keyboard / screen reader |
| Expected result | All actions reachable and announced |
| Automation classification | Manual / Exploratory |
| Reason | Human judgement needed; could later add automated axe scans as a separate layer |
| Automated test | - |
