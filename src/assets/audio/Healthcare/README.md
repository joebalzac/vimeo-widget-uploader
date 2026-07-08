# Healthcare audio

Drop the Healthcare scenario's call audio here as an `.mp3` file (any filename).

It is picked up automatically by `../index.ts` and wired to the "Healthcare"
scenario in the Product Showcase — no code changes needed. The first `.mp3`
found in this folder is used.

Playback restarts at the top of each conversation animation loop, so keep the
clip length close to the visual loop and tune the timings in
`src/components/ProductShowcase.tsx` (`APPEAR_AT`) to match the audio.
