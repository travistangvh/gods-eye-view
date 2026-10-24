import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSceneDocument, stringifySceneDocument } from './document.js';
import { normalizeProject } from '../scenes/project.js';
import { resolveCameraMove, sampleCameraMove } from './camera.js';
import { sceneSeekState } from './timeline.js';

const fixture = () => ({
  version: 4,
  scenes: [
    {
      id: 'scene',
      title: 'Cross the dateline',
      anchors: [
        {
          id: 'west',
          title: 'Start',
          lat: 10,
          lon: 179,
          alt: 400,
          altitudeReference: 'ellipsoid',
        },
        {
          id: 'east',
          title: 'End',
          lat: 12,
          lon: -179,
          alt: 800,
          altitudeReference: 'ellipsoid',
        },
      ],
      shots: [
        {
          id: 'move',
          title: 'Cross',
          durationSec: 4,
          holdSec: 2,
          camera: { anchorId: 'east', heading: 10, pitch: 0, roll: 0 },
          move: {
            from: { anchorId: 'west', heading: 350, pitch: -40, roll: 0 },
            easing: 'linear',
          },
        },
      ],
    },
  ],
});
test('version 4 retains anchor identity, references and explicit move edits through normalization', () => {
  const raw = fixture();
  const project = normalizeProject(parseSceneDocument(JSON.stringify(raw)));
  assert.deepEqual(project.scenes[0].anchors, raw.scenes[0].anchors);
  assert.deepEqual(
    project.scenes[0].shots[0].move,
    raw.scenes[0].shots[0].move,
  );
  assert.deepEqual(
    project.scenes[0].shots[0].camera,
    raw.scenes[0].shots[0].camera,
  );
  assert.deepEqual(
    normalizeProject(parseSceneDocument(stringifySceneDocument(project))),
    project,
  );
});
test('v3 unversioned bloom already uses scale 2 and is not migrated again in later formats', () => {
  const project = normalizeProject(
    parseSceneDocument(
      JSON.stringify({
        version: 3,
        scenes: [
          { shots: [{ visual: { bloom: { enabled: true, intensity: 50 } } }] },
        ],
      }),
    ),
  );
  assert.equal(project.version, 6);
  assert.equal(project.scenes[0].shots[0].visual.bloom.intensity, 50);
});
test('move endpoints, easing, shortest arcs and hold agree with scene seeking', () => {
  const scene = normalizeProject(parseSceneDocument(JSON.stringify(fixture())))
    .scenes[0];
  const move = resolveCameraMove(scene, scene.shots[0]);
  const midpoint = sampleCameraMove(move, 0.5);
  assert.equal(midpoint.lon, -180);
  assert.equal(midpoint.heading, 360);
  assert.equal(midpoint.lat, 11);
  assert.equal(midpoint.alt, 600);
  assert.equal(midpoint.pitch, -20);
  const seek = (p) =>
    sceneSeekState(
      scene,
      p,
      (_, shot) => shot.durationSec + shot.holdSec,
      (_, shot) => shot.holdSec,
    );
  assert.deepEqual(seek(1 / 3).camera, midpoint);
  assert.deepEqual(seek(0).camera, move.from);
  assert.deepEqual(seek(5 / 6).camera, move.to);
  assert.equal(seek(5 / 6).holdElapsedSec, 1);
  assert.deepEqual(
    seek(1 / 3).camera,
    midpoint,
    'backward seek is independent of previous viewport state',
  );
  assert.equal(
    sampleCameraMove({ ...move, easing: 'cubic-in-out' }, 0.25).lat,
    10.125,
  );
  assert.deepEqual(sampleCameraMove(move, 1), move.to);
});
test('unknown anchors, duplicate IDs, mixed references, bad easing and unspecified altitude are rejected', () => {
  for (const mutate of [
    (s) => {
      s.shots[0].camera.anchorId = 'missing';
    },
    (s) => {
      s.anchors[1].id = 'west';
    },
    (s) => {
      s.anchors[0].altitudeReference = 'terrain';
    },
    (s) => {
      delete s.anchors[0].altitudeReference;
    },
    (s) => {
      s.shots[0].camera.lon = 1;
    },
    (s) => {
      s.shots[0].move.easing = 'bounce';
    },
    (s) => {
      s.shots[0].move.from = { lat: 1, lon: 2, alt: 3 };
    },
    (s) => {
      s.shots[0].durationSec = 0;
    },
    (s) => {
      delete s.shots[0].holdSec;
    },
  ]) {
    const project = fixture();
    mutate(project.scenes[0]);
    assert.throws(() => parseSceneDocument(JSON.stringify(project)), {
      name: 'SceneDocumentError',
    });
  }
  const old = fixture();
  old.version = 3;
  assert.throws(
    () => parseSceneDocument(JSON.stringify(old)),
    /unsupported field/,
  );
});

test('a dive centres early, zooms at a steady log rate and tilts last', () => {
  const move = {
    from: { lat: -1.2, lon: 110.2, alt: 2_700_000, heading: 0, pitch: -88, roll: 0 },
    to: { lat: -2.17, lon: 113.8, alt: 700, heading: 20, pitch: -22, roll: 0 },
    easing: 'dive',
  };
  const centred = sampleCameraMove(move, 0.6);
  assert.ok(Math.abs(centred.lat - move.to.lat) < 1e-9);
  assert.ok(Math.abs(centred.lon - move.to.lon) < 1e-9);
  assert.equal(centred.pitch, -88);
  assert.equal(centred.heading, 0);
  // Height falls monotonically, through the geometric middle.
  const heights = [0.2, 0.4, 0.6, 0.8].map((t) => sampleCameraMove(move, t).alt);
  heights.reduce((previous, height) => (assert.ok(height < previous), height), Infinity);
  assert.ok(sampleCameraMove(move, 0.5).alt < Math.sqrt(2_700_000 * 700) * 1.2);
  assert.deepEqual(sampleCameraMove(move, 1), move.to);
  // Rising out runs the curve backwards: lift straight up, then pan.
  const out = { from: move.to, to: move.from, easing: 'dive' };
  const lifted = sampleCameraMove(out, 0.4);
  assert.ok(Math.abs(lifted.lat - move.to.lat) < 1e-9);
  assert.ok(lifted.alt > move.to.alt);
});

test('dive is an accepted easing', () => {
  const document = fixture();
  document.scenes[0].shots[0].move.easing = 'dive';
  assert.doesNotThrow(() => parseSceneDocument(JSON.stringify(document)));
});
