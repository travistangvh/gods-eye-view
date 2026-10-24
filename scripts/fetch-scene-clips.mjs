/**
 * fetch-scene-clips.mjs — save local copies of the YouTube clips built-in
 * scenes play, so they work where YouTube's player cannot run.
 *
 * Needs yt-dlp and ffmpeg on PATH. Each clip is cut to the seconds the scene
 * shows (720p mp4) and written to public/scene-assets/clips; files that
 * already exist are skipped. Usage: npm run clips:fetch
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENE_RECIPES } from '../src/scenes/recipes.js';
import { SCENE_CLIP_DIRECTORY, collectSceneClips } from '../src/ui/sceneClips.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'public', SCENE_CLIP_DIRECTORY);
mkdirSync(directory, { recursive: true });

const clips = SCENE_RECIPES.flatMap(collectSceneClips);
let fetched = 0;
let failed = 0;
for (const clip of clips) {
  const target = path.join(directory, clip.file);
  if (existsSync(target)) continue;
  const partial = `${target}.part.mp4`;
  rmSync(partial, { force: true });
  const end = clip.start + clip.seconds;
  try {
    execFileSync(
      'yt-dlp',
      [
        '--quiet',
        '--no-warnings',
        '--no-playlist',
        '-f',
        'bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/b',
        '--merge-output-format',
        'mp4',
        '--download-sections',
        `*${clip.start}-${end}`,
        '--force-keyframes-at-cuts',
        '-o',
        partial,
        `https://www.youtube.com/watch?v=${clip.videoId}`,
      ],
      { stdio: ['ignore', 'inherit', 'inherit'] },
    );
    renameSync(partial, target);
    fetched++;
    console.log(`saved ${clip.file}`);
  } catch (error) {
    rmSync(partial, { force: true });
    failed++;
    console.error(`failed ${clip.file}: ${error.message}`);
  }
}
console.log(
  `${clips.length} clips: ${fetched} saved, ${clips.length - fetched - failed} already present, ${failed} failed`,
);
process.exitCode = failed ? 1 : 0;
