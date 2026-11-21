---
title: 'Feed a man a fish'
description: 'Fishdoku: a daily logic puzzle made of ASCII fish, built spec-first with OpenSpec, and redesigned so a colorblind player (me) could actually play it.'
pubDate: 2026-11-20
tags: ['fishdoku', 'game', 'openspec', 'accessibility']
repo: 'https://github.com/teigesaccord/fishdoku'
demo: 'https://teige.dev/fishdoku/'
status: 'shipped'
---

## TL;DR

- **[Fishdoku](https://teige.dev/fishdoku/)** is a daily logic puzzle: put one fish in every row, column and pond, and don't let any two fish touch.
- **I wrote the spec before any code**, using OpenSpec, and then had AI coding agents build it against that spec.
- **The first version was unplayable for me** because I'm colorblind and the ponds were told apart mostly by color. I reworked the design so every pond has its own symbol and clear borders.

## Why build it

I have recently become addicted to stupid phone puzzle games, but these games are buried in ads. I wanted the same kind of puzzle in a version I could open in a browser on my phone or my laptop, with nothing in the way. So lets build it. Learn the puzzle generation and then play it with no ads!

## How to play

Each day there's one puzzle, and it's the same for everyone. The board is an N × N grid split into N irregular regions called **ponds**.

1. Every **row** has exactly one fish.
2. Every **column** has exactly one fish.
3. Every **pond** has exactly one fish.
4. No two fish can **touch**, not even diagonally.

Tap a cell to step it through **empty → `x` (no fish here) → `><>` (fish)**. Click and drag across empty cells to cross off a whole run of them at once. Start a drag on an `x` and it erases instead. If two fish break a rule, they turn into `>x>` so you can see the problem.

Puzzles get bigger through the week: Monday is a gentle 7 × 7, and Friday is an 11 × 11. You can browse back through every puzzle since launch (November 16, 2026), but not ahead to tomorrow.

## How the site works

There's no backend. Everything happens in your browser.

### Same puzzle for everyone, without a server

The obvious way to give everyone the same daily puzzle is to store a puzzle per day on a server. Fishdoku generates it instead. The date (for example `2026-11-20`) is hashed into a seed, and that seed drives a random number generator. Same date, same seed, same puzzle, on every device.

That only works if the generator is completely **deterministic**. It can't use `Math.random`, it can't depend on how a particular browser sorts arrays, and it sticks to integer math so results don't drift between JavaScript engines. A test pins the puzzles for a list of dates, so if a code change ever quietly alters past puzzles, the test fails.

The generator is also **versioned**. If I ever improve it, the new version only applies from a future date, and old dates keep their original puzzles.

### Every puzzle has exactly one answer

A logic puzzle with two valid answers isn't a logic puzzle, it's a guess. The generator works in three steps:

1. Place N fish that follow the rules (one per row and column, none touching).
2. Grow a pond outward from each fish until the whole grid is filled.
3. Run a solver over the result. If it finds more than one solution, adjust the ponds and try again.

### Stack and hosting

TypeScript and Vite, with plain DOM code and no UI framework. The whole game is one grid and a header, which didn't justify React or Next.js. The built site is about 17 KB of JavaScript. Vitest covers the rules, solver, generator, storage and UI.

## Building it with OpenSpec

This project was built **spec-first** with [OpenSpec](https://github.com/Fission-AI/OpenSpec). Instead of opening a chat with a coding agent and describing the game as I went, I wrote down what the game *is* before any code existed.

OpenSpec organizes work into **changes**. I started one called `initial-game` with `/opsx:propose`, and it produced:

- **`proposal.md`**: why the project exists, what's in scope, and what's explicitly *out* of scope for now (hints, timer, undo, streaks, difficulty tiers).
- **Specs for each part of the game**: `puzzle-rules`, `puzzle-generation`, `daily-puzzle`, `board-interaction` and `visual-style`. Each one is a list of requirements with concrete scenarios, like *"WHEN an 11 × 11 puzzle is shown on a 360 px wide screen THEN the whole board is visible without horizontal scrolling."*
- **`design.md`**: the technical decisions and the alternatives I passed on, such as choosing the random number generator, how generator versioning works, and why no framework.
- **`tasks.md`**: the implementation broken into small checkboxes, from project setup through release prep.

Then `/opsx:apply` had the agent work through the task list, checking off each item as it went.

What I liked about it:

- **The agent stops guessing.** The agent runs with complete guidelines. It doesn't fill in any gaps because the spec is already written and I already approved it.
- **Scenarios turn straight into tests.** A requirement written as WHEN/THEN is basically a test case already.
- **Out of scope is written down.** When the agent wanted to add extras, the proposal said "later," and it was easy to point at.
- **It's a record.** Months from now, `design.md` will tell me *why* I made these choices, not just what the code does.

It isn't magic. Some things you only learn by playing, and that's where the next section comes in.

## Making it playable when you're colorblind

I'm colorblind. The spec even had a requirement for it: every pond needs its own texture *and* its own color, so the board stays readable in grayscale. On paper, I was covered.

In practice, the first build was impossible for me to play. The texture was a single faint character in the middle of each cell, so the board read as a grid of tinted squares, and many of those tints looked the same to me. The colors were only chosen to differ from *neighboring* ponds, so the same color showed up in several places on the board. The lines between ponds didn't stand out either. I couldn't tell where one pond ended and the next began, and in this game, that's the whole puzzle.

So I reworked the design until color became a bonus rather than a requirement:

- **Every pond gets its own symbol, repeated across each of its cells.** Instead of one faint `~`, an empty cell shows `~~~`, `...`, `:::`, `***`, `+++`, `===`, `^^^` and so on. A pond now reads as one continuous patch of pattern, and I can trace its shape by the symbol alone.
- **Every pond gets a unique symbol and color**, not just one that differs from its neighbors. There are 11 of each and never more than 11 ponds, so no two ponds on a board ever share either one.
- **Heavy, dark borders between ponds, and light grid lines inside them.** The pond edges come from contrast between dark and light, which I *can* see, not from hue.
- **Conflicts change shape, not just color.** A fish that breaks a rule turns from `><>` into `>x>`, so it shows up even if red and green look the same to you.
- **Placed marks stand out from the background.** The pond symbols are small and quiet, while fish are bold, so marks don't get lost in the pattern.

The lesson for me: "readable without color" is easy to write in a spec and easy to pass on a checklist. The only real test was a colorblind person actually trying to play it, and since that was me, I found out fast. If you build anything with colored regions, try it in grayscale and give every color a second signal, like a symbol, pattern, border or shape.

## What's next

- **Hints** for when you're properly stuck.
- **Undo**, now that dragging makes it easy to cross off too much.
- **Streaks and stats**, kept in the browser like everything else.
- **Difficulty tiers**, once I work out how to grade a puzzle by the techniques it needs, rather than just its size.

Lets go [fishing!](https://teige.dev/fishdoku/)
