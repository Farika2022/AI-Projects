# Guess the Spot

A 3D geography game: spin the globe, click a landmark, and answer a question about its photo before the timer runs out.

**Live demo:** [guesswith.vercel.app](https://guesswith.vercel.app)

![Guess the Spot screenshot](docs/screenshot.png)

## Features

- **3D globe** that spins on its own. Drag to rotate and scroll to zoom.
- **20 famous landmarks** in 20 countries. Pick any 10 to play a round.
- **Two modes:**
  - **Quiz:** 15 seconds per photo.
  - **Jigsaw:** rebuild a scrambled 3×3 photo in 60 seconds, then answer in 15.
- **Countdown timer** for every question. Running out of time counts as a wrong answer.
- **Random funny nickname** for each player, like "Wobbly Penguin", never repeated.
- **Rotating questions and facts:** each landmark has several questions and facts, and never shows the same one twice in a row.
- **Results screen** with your score, your time (jigsaw and quiz time shown separately), a motivational quote, floating emojis and falling confetti.

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [react-three-fiber](https://r3f.docs.pmnd.rs) and [drei](https://drei.docs.pmnd.rs) for the 3D globe (built on [three.js](https://threejs.org))
- [Tailwind CSS](https://tailwindcss.com)
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) for landmark photos
- [Vercel](https://vercel.com) for hosting

## How it works

- **Placing pins on the globe.** Each landmark has a latitude and longitude. [`latLngToVector3`](src/utils/latLngToVector3.ts) turns them into a 3D point on the sphere using the same angles three.js uses to wrap the Earth picture. That's why each pin lands on the right country.
- **Game state.** One hook, [`useGame`](src/hooks/useGame.ts), holds everything:
  - the stage of the game (start, playing or finished)
  - the score and which landmarks have been answered
  - the open question and its timers

  The components only display that state and call its functions, such as `selectLocation`, `answer` and `next`.
- **Photos from Wikipedia.** [`useLocationImage`](src/hooks/useLocationImage.ts) fetches each landmark's article summary and uses its main image, resized to 1280 px so it loads quickly. If the main image is a logo, it picks the first real photo from the article instead.
- **No repeats.** The browser's `localStorage` remembers which nicknames have been used, and which question and fact each landmark showed last. The next game picks something different.

## Run locally

You need [Node.js](https://nodejs.org) 20.19+ or 22.12+ (required by Vite).

```bash
npm install
npm run dev
```

Then open the address Vite prints, usually <http://localhost:5173>.

## What I learned

- **Matching math to the 3D library.** Pins only land on the right country if the lat/lng formula uses the same angles three.js uses to wrap the texture around a sphere. I also learned that `OrbitControls` moves the camera, not the globe. So pins stay in place without extra code.
- **Keeping React components predictable.** React's lint rules don't allow random numbers or timestamps while a component is rendering. So shuffling answers, scrambling jigsaw tiles and starting timers all happen in click handlers. Loading state is worked out from existing data instead of being set inside an effect.
- **Real-world data is messy.** Some Wikipedia articles use a logo as their main image (the Eiffel Tower and CN Tower), some original photos are over 12,000 px wide, and some image addresses come back without `https:`. Handling those cases was a big part of making the photos reliable.
