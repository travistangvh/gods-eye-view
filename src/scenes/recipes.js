/**
 * Scene recipes optimized for short social clips.
 * Each recipe is deterministic so repeated runs produce similar footage.
 */

import { expandNepalEvidencePack } from './nepalEvidencePack.js';
import { msg, t } from '../i18n/index.js';

const BHOTE_KOSHI_NEPAL_BASE_RECIPE = Object.freeze({
  id: 'bhote-koshi-nepal-evidence-pack',
  version: 12,
  title: msg('Bhote Koshi Evidence Sequence'),
  style: 'normal',
  ui: { hidePanels: false, hudMode: 'full', safeFrame: '16:9' },
  layers: {
    'bhote-koshi-locator': false,
  },
  releaseLayerIds: ['bhote-koshi-2026', 'bhote-koshi-locator'],
  post: {
    bloom: 0,
    sharpen: true,
    detectionMode: 'OFF',
    mapStack: 'photoreal',
  },
  legacySceneBootstrap: {
    targetSceneTitle: 'Nepal Flood Incident',
    fromShotTitles: ['Shot 1', 'Shot 2', 'Shot 3'],
    cameraPath: [
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Global Incident Context',
        lat: 27.5962,
        lon: 78.5718,
        alt: 15628002,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'nepal-context' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Nepal-Focused Globe Rotation',
        lat: 28.7248,
        lon: 81.3226,
        alt: 2068966,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'nepal-context' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Regional Approach',
        lat: 27.0354,
        lon: 84.6287,
        alt: 809543,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-regional' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Nearby Cities',
        lat: 27.891,
        lon: 85.428,
        alt: 225734,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-city-context' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Incident Corridor',
        lat: 28.0529,
        lon: 85.2189,
        alt: 126931,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 11,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-incident-places' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Flood Path',
        lat: 28.1691,
        lon: 85.352,
        alt: 60328,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-flood-path' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Corridor Overview',
        lat: 27.8986,
        lon: 84.8723,
        alt: 53247,
        heading: 60,
        pitch: -48,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-path-overview' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Upper Valley',
        lat: 28.4187,
        lon: 85.4341,
        alt: 7977,
        heading: 155,
        pitch: -28,
        roll: 0,
        duration: 4,
        hold: 8,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-trigger-record' },
          },
        },
      },
    ],
  },
  requiredShotTitles: [
    'Global Incident Context',
    'Nepal-Focused Globe Rotation',
    'Bhote Koshi Regional Approach',
    'Bhote Koshi Nearby Cities',
    'Bhote Koshi Incident Corridor',
    'Bhote Koshi Flood Path',
    'Bhote Koshi Corridor Overview',
    'Bhote Koshi Upper Valley',
    'Upper Valley Collapse',
    'Debris-Dammed Lake',
    'Nepal-China Border Gate',
    'Timure Evidence Cluster',
    'Syabru Besi Passage',
    'Bidur / Trishuli Consequence',
  ],
  requiredSourcePackBeatIds: [
    'immediate-collapse-viewpoint',
    'debris-dammed-lake',
    'gyirong-border-gate',
    'timure-cluster',
    'syabru-besi',
    'bidur-trishuli-bridge',
  ],
  requiredSourcePackLayerId: 'bhote-koshi-2026',
  photorealSurfaceBeatIds: [
    'gyirong-border-gate',
    'timure-cluster',
    'syabru-besi',
    'bidur-trishuli-bridge',
  ],
  runtimeControlsByBeat: {
    'immediate-collapse-viewpoint': { evidenceMediaAutoplay: true },
    'debris-dammed-lake': { evidenceMediaAutoplay: true },
    'gyirong-border-gate': {
      imageryComparison: true,
      evidenceSequence: true,
      evidenceSequenceDurationSec: 2.5,
      deferEvidenceUntilCameraSettled: true,
      evidenceRevealDurationSec: 2.5,
    },
    'timure-cluster': {
      imageryComparison: true,
      evidenceSequence: true,
      evidenceSequenceDurationSec: 4,
    },
    'syabru-besi': {
      imageryComparison: true,
      evidenceSequence: true,
      evidenceSequenceDurationSec: 4,
    },
    'bidur-trishuli-bridge': {
      evidenceSequence: true,
      evidenceSequenceDurationSec: 4,
    },
  },
  shotPatches: [
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Global Incident Context',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Nepal-Focused Globe Rotation',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'debris-dammed-lake',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Regional Approach',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'gyirong-border-gate',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Nearby Cities',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'timure-cluster',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Incident Corridor',
      camera: {
        lat: 28.0529,
        lon: 85.2189,
        alt: 126931,
        heading: 0,
        pitch: -90,
        roll: 0,
      },
      holdSec: 11,
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'syabru-besi',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Flood Path',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'bidur-trishuli-bridge',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Corridor Overview',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'gyirong-border-gate',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Upper Valley',
      holdSec: 8,
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
        'bhote-koshi-locator': {
          enabled: true,
          params: {
            presentation: 'bhote-koshi-trigger-record',
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Upper Valley Collapse',
      camera: {
        lat: 28.417,
        lon: 85.3937,
        alt: 9850,
        heading: 146,
        pitch: -34,
        roll: 0,
      },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: { evidenceMediaAutoplay: true },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Nepal-China Border Gate',
      visual: { mapStack: 'photoreal' },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Timure Evidence Cluster',
      visual: { mapStack: 'photoreal' },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Syabru Besi Passage',
      visual: { mapStack: 'photoreal' },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bidur / Trishuli Consequence',
      visual: { mapStack: 'photoreal' },
    },
  ],
  cameraPath: [
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Upper Valley Collapse',
      lat: 28.417,
      lon: 85.3937,
      alt: 9850,
      heading: 146,
      pitch: -34,
      roll: 0,
      duration: 4.2,
      hold: 1.4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: { evidenceMediaAutoplay: true },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Debris-Dammed Lake',
      lat: 28.392914,
      lon: 85.570921,
      alt: 10744,
      heading: 232,
      pitch: -37,
      roll: 0,
      duration: 4.2,
      hold: 1.4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'debris-dammed-lake',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: { evidenceMediaAutoplay: true },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Nepal-China Border Gate',
      mapStack: 'photoreal',
      lat: 28.316789,
      lon: 85.399734,
      alt: 5900,
      heading: 208,
      pitch: -42,
      roll: 0,
      duration: 4.2,
      hold: 2.5,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'gyirong-border-gate',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              imageryComparison: true,
              evidenceSequence: true,
              evidenceSequenceDurationSec: 2.5,
              deferEvidenceUntilCameraSettled: true,
              evidenceRevealDurationSec: 2.5,
            },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Timure Evidence Cluster',
      mapStack: 'photoreal',
      lat: 28.285968,
      lon: 85.379136,
      alt: 5032,
      heading: 198,
      pitch: -40,
      roll: 0,
      duration: 4.2,
      hold: 4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'timure-cluster',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              imageryComparison: true,
              evidenceSequence: true,
              evidenceSequenceDurationSec: 4,
            },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Syabru Besi Passage',
      mapStack: 'photoreal',
      lat: 28.210306,
      lon: 85.361527,
      alt: 5893,
      heading: 205,
      pitch: -38,
      roll: 0,
      duration: 4.2,
      hold: 4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'syabru-besi',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              imageryComparison: true,
              evidenceSequence: true,
              evidenceSequenceDurationSec: 4,
            },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bidur / Trishuli Consequence',
      mapStack: 'photoreal',
      lat: 27.981737,
      lon: 85.196273,
      alt: 7422,
      heading: 215,
      pitch: -40,
      roll: 0,
      duration: 4.2,
      hold: 4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'bidur-trishuli-bridge',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              evidenceSequence: true,
              evidenceSequenceDurationSec: 4,
            },
          },
        },
      },
    },
  ],
});

const BHOTE_KOSHI_NEPAL_APPEND_RECIPE = BHOTE_KOSHI_NEPAL_BASE_RECIPE
  ? expandNepalEvidencePack(BHOTE_KOSHI_NEPAL_BASE_RECIPE)
  : null;

// Fresh browser origins have no legacy three-shot Nepal project for the
// append recipe to upgrade. Seed that exact legacy shape so SceneDirector can
// run the same idempotent bootstrap used by existing browser-saved projects.
const BHOTE_KOSHI_NEPAL_BOOTSTRAP_RECIPE = BHOTE_KOSHI_NEPAL_APPEND_RECIPE
  ? Object.freeze({
      id: 'bhote-koshi-nepal-scene',
      title: msg('Nepal Flood Incident'),
      durationSec: 15,
      style: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.style,
      ui: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.ui,
      layers: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.layers,
      releaseLayerIds: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.releaseLayerIds,
      post: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.post,
      installAlongsideSceneId: 'bhote-koshi-flood',
      installAlongsideFallbackSceneId: 'flights-radar',
      cameraPath:
        BHOTE_KOSHI_NEPAL_APPEND_RECIPE.legacySceneBootstrap.cameraPath
          .slice(0, 3)
          .map((keyframe, index) => ({
            ...keyframe,
            // i18n-ignore: legacy shot titles the bootstrap matches verbatim
            title: `Shot ${index + 1}`,
          })),
    })
  : null;

const SINGAPORE_HAZE_RECIPE = Object.freeze({
  id: 'singapore-haze-2026',
  version: 19,
  // Browsers that installed an older version get this one on next load,
  // unless the operator has captured their own shots into the scene.
  upgradeInstalledScene: true,
  // START plays this scene alone; it does not run on into the next one.
  playsAlone: true,
  // Shows each shot's title over the map while it plays.
  captions: true,
  title: msg('Singapore Haze 2026'),
  durationSec: 146.0,
  style: 'normal',
  ui: { hidePanels: false, hudMode: 'full', safeFrame: '16:9' },
  // Only the four standard layers are declared here; each shot sets the
  // extra layers it needs, and the scene releases them when it ends.
  layers: {
    flights: false,
    satellites: false,
    earthquakes: false,
    traffic: false,
  },
  releaseLayerIds: [
    'local-firms',
    'wind',
    'recent-imagery',
    'ais-live-vessels',
    'air-quality',
    'flights',
  ],
  installAlongsideSceneId: 'bhote-koshi-nepal-scene',
  installAlongsideFallbackSceneId: 'flights-radar',
  post: {
    bloom: 0,
    sharpen: true,
    detectionMode: 'OFF',
    mapStack: 'photoreal',
  },
  dataPacks: [
    {
      id: 'videos',
      version: 1,
      format: 'geojson',
      source: {
        adapter: 'assets',
        path: 'singapore-haze-2026/videos.geojson',
      },
      attribution: {
        text: 'Locations of linked news videos; video belongs to its publisher',
        license: 'Coordinates authored for this scene; linked videos are not redistributed',
      },
      placement: { altitudeReference: 'ellipsoid' },
    },
  ],
  cameraPath: [
      // Act 1: the fires. Satellite detections, from where they started to everywhere.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 1, The fires: Southeast Asia, July 2026',
        lat: 0.5,
        lon: 110.0,
        alt: 6500000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.5,
        move: {
          from: {
            lat: 8.0,
            lon: 112.0,
            alt: 11000000,
            heading: 0,
            pitch: -90,
          },
          easing: 'cubic-in-out',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-06-25',
          to: '2026-07-08',
          seconds: 4,
          ease: 1,
          cell: 0.1,
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Jul-Aug: where the fires started',
        lat: -1.2,
        lon: 110.2,
        alt: 2700000,
        heading: 0,
        pitch: -88,
        roll: 0,
        duration: 3,
        hold: 11.6,
        move: {
          from: {
            lat: 0.5,
            lon: 110.0,
            alt: 6500000,
            heading: 0,
            pitch: -90,
          },
          easing: 'cubic-in-out',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-07-09',
          to: '2026-08-25',
          seconds: 10,
          cell: 0.1,
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              date: '2026-07-09',
              lat: -1.85,
              lon: 110.25,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Ketapang, West Kalimantan',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '100+ detections a day from Jul 9',
              clip: {
                videoId: 'zrQRNIB45Ok',
                start: 56,
                seconds: 5,
                portrait: true,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'iNews · Ketapang at night',
              },
            },
            {
              date: '2026-07-14',
              lat: -3.3,
              lon: 105.6,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Ogan Komering Ilir, South Sumatra',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '100+ a day from Jul 14',
              clip: {
                videoId: 'mCd4P89s9zo',
                start: 116,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'tvOneNews aerial · Ogan Komering Ilir',
              },
            },
            {
              date: '2026-07-20',
              lat: -2.17,
              lon: 113.83,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Palangkaraya, Central Kalimantan',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '100+ a day from Jul 20',
              clip: {
                videoId: 'wgegfATHrj8',
                start: 14,
                seconds: 5,
                portrait: true,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'BBC News Indonesia · a resident\'s drone',
              },
            },
            {
              date: '2026-08-03',
              lat: -0.97,
              lon: 116.7,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Near Nusantara, East Kalimantan',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '100+ a day from Aug 3',
              clip: {
                videoId: '7GVaRIqWFas',
                start: 0,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'KompasTV · East Kalimantan',
              },
            },
            {
              date: '2026-08-22',
              lat: -1.1,
              lon: 103.8,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Tanjung Jabung Timur, Jambi',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '100+ a day from Aug 22',
              clip: {
                videoId: 'm8gGc4DE8O8',
                start: 56,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'Metro TV · soldiers on the Jambi peat',
              },
            },
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Aug-Sep: the fires spread',
        lat: -1.0,
        lon: 110.6,
        alt: 2600000,
        heading: 0,
        pitch: -88,
        roll: 0,
        duration: 12,
        hold: 0.5,
        move: {
          from: {
            lat: -1.2,
            lon: 110.2,
            alt: 2700000,
            heading: 0,
            pitch: -88,
          },
          easing: 'linear',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-08-26',
          to: '2026-09-30',
          seconds: 10,
          cell: 0.1,
          haze: {
            data: '/scene-assets/singapore-haze-2026/weather.json',
            cloud: true,
            fadeIn: 9,
          },
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              date: '2026-09-02',
              lat: -1.85,
              lon: 110.25,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Ketapang declares an emergency',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Sep 2: fires in 15 of its 20 districts',
              clip: {
                videoId: 'zrQRNIB45Ok',
                start: 4,
                seconds: 4,
                portrait: true,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'iNews · Ketapang',
              },
            },
            {
              date: '2026-09-15',
              lat: -3.3,
              lon: 105.6,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'South Sumatra peaks',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Sep 15: 1,831 detections in a day',
              clip: {
                videoId: 'mCd4P89s9zo',
                start: 124,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'tvOneNews aerial · Ogan Komering Ilir',
              },
            },
          ],
        },
      },
      // Act 2: the smoke travels. Real satellite smoke, wind and PM2.5.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 2, The smoke travels: Oct 1-9',
        lat: 1.0,
        lon: 107.0,
        alt: 3600000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 3,
        hold: 9,
        move: {
          from: {
            lat: -1.0,
            lon: 110.6,
            alt: 2600000,
            heading: 0,
            pitch: -88,
          },
          easing: 'cubic-in-out',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-01',
          to: '2026-10-09',
          seconds: 12,
          ease: 1,
          cell: 0.1,
          haze: {
            data: '/scene-assets/singapore-haze-2026/weather.json',
            satellite: true,
            wind: true,
            cloud: true,
            readout: {
              lat: 1.35,
              lon: 103.82,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Singapore',
            },
          },
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              date: '2026-10-05',
              lat: -2.21,
              lon: 113.92,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Palangkaraya',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'PM2.5 passes 1,200 µg/m³ by Oct 10',
              clip: {
                videoId: '_PNM6F5oRi0',
                start: 106,
                seconds: 6,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'Kompas.com drone · Palangkaraya under an orange sky',
              },
            },
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 9-15: the wind carries it to the strait',
        lat: 1.0,
        lon: 104.6,
        alt: 900000,
        heading: 0,
        pitch: -75,
        roll: 0,
        duration: 4,
        hold: 8,
        move: {
          from: {
            lat: 1.0,
            lon: 107.0,
            alt: 3600000,
            heading: 0,
            pitch: -90,
          },
          easing: 'dive',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-09',
          to: '2026-10-15',
          seconds: 12,
          ease: 1,
          cell: 0.1,
          haze: {
            data: '/scene-assets/singapore-haze-2026/weather.json',
            satellite: true,
            wind: { hero: true },
            cloud: true,
            satelliteOpacity: 0.45,
            readout: {
              lat: 1.35,
              lon: 103.82,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Singapore',
            },
          },
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              at: 1.5,
              lat: -0.6,
              lon: 106.4,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'The wind carries it',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'About 1.5 km up, blowing from the fires to the strait',
              hold: 7,
              card: {
                // i18n-ignore: scene data text, shown verbatim like shot titles
                title: 'The wind is the link',
                lines: [
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Winds about 1.5 km up carry the smoke from the burning peat across the sea.',
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'In mid-October they blow it straight into the Strait of Malacca.',
                ],
                // i18n-ignore: scene data text, shown verbatim like shot titles
                note: 'Wind: Open-Meteo historical forecast, 850 hPa',
              },
            },
            {
              date: '2026-10-12',
              lat: 1.46,
              lon: 103.76,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Johor Bahru',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Singapore vanishes across the strait',
              clip: {
                videoId: 'eKYM6vjLWOA',
                start: 10,
                seconds: 6,
                portrait: true,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'The Straits Times · Oct 10',
              },
            },
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 9: Malaysia shuts schools',
        lat: 2.9,
        lon: 102.6,
        alt: 750000,
        heading: 0,
        pitch: -80,
        roll: 0,
        duration: 3,
        hold: 7.0,
        move: {
          from: {
            lat: 1.0,
            lon: 104.6,
            alt: 900000,
            heading: 0,
            pitch: -75,
          },
          easing: 'cubic-in-out',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-08',
          to: '2026-10-09',
          seconds: 2,
          ease: 1,
          cell: 0.1,
          haze: {
            data: '/scene-assets/singapore-haze-2026/weather.json',
            wind: true,
            cloud: true,
          },
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              at: 1.0,
              lat: 3.14,
              lon: 101.69,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Kuala Lumpur',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Schools closed Oct 9',
              hold: 9,
            },
            {
              at: 1.6,
              lat: 3.07,
              lon: 101.52,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Selangor',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Schools closed Oct 9',
              hold: 8.4,
            },
            {
              at: 2.2,
              lat: 2.93,
              lon: 101.69,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Putrajaya',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Schools closed Oct 9',
              hold: 7.8,
            },
            {
              at: 2.8,
              lat: 2.73,
              lon: 101.94,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Negeri Sembilan',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Schools closed Oct 9',
              hold: 7.2,
            },
            {
              at: 3.4,
              lat: 2.19,
              lon: 102.25,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Melaka',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Schools closed Oct 9',
              hold: 6.6,
            },
            {
              at: 4.0,
              lat: 1.85,
              lon: 103.45,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Johor',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Schools closed Oct 9',
              hold: 6,
            },
            {
              at: 4.6,
              lat: 2.79,
              lon: 103.48,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Rompin, Pahang',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Closed where the API passes 180',
              hold: 5.4,
            },
            {
              at: 5,
              lat: 3.16,
              lon: 101.71,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Kuala Lumpur Tower',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Oct 9',
              clip: {
                videoId: 'c_OA2lTt2cE',
                start: 0,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'AP · KL Tower in haze',
              },
            },
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 16: across the strait into Singapore',
        lat: 1.18,
        lon: 103.83,
        alt: 2500,
        heading: 15,
        pitch: -8,
        roll: 0,
        duration: 7,
        hold: 6,
        move: {
          from: {
            lat: 2.9,
            lon: 102.6,
            alt: 750000,
            heading: 0,
            pitch: -80,
          },
          easing: 'dive',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-15',
          to: '2026-10-16',
          seconds: 11,
          ease: 1,
          fires: false,
          haze: {
            data: '/scene-assets/singapore-haze-2026/weather.json',
            tint: true,
            readout: {
              lat: 1.35,
              lon: 103.82,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Singapore',
            },
          },
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              at: 7,
              lat: 1.29,
              lon: 103.85,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Singapore',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Oct 16: 24-hour PSI 229, the worst in a decade',
              clip: {
                videoId: '2l7irQkN2b0',
                start: 10,
                seconds: 6,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'The Star / Reuters · the skyline fades',
              },
            },
          ],
        },
      },
      // Act 3: Singapore. One place, start to finish.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 3, Singapore: before and after',
        lat: 1.415,
        lon: 103.77,
        alt: 1500,
        heading: 0,
        pitch: -18,
        roll: 0,
        duration: 5,
        hold: 7,
        move: {
          from: {
            lat: 1.18,
            lon: 103.83,
            alt: 2500,
            heading: 15,
            pitch: -8,
          },
          easing: 'cubic-in-out',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-15',
          to: '2026-10-16',
          seconds: 4,
          ease: 1,
          fires: false,
          haze: {
            data: '/scene-assets/singapore-haze-2026/weather.json',
            tint: true,
            readout: {
              lat: 1.35,
              lon: 103.82,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Singapore',
            },
          },
          bbox: [95, -6.5, 119.5, 6.5],
          compare: {
            at: 3,
            seconds: 4.5,
            pairs: [
              {
                before: '/scene-assets/singapore-haze-2026/cctv/2702-2026-06-15.jpg',
                during: '/scene-assets/singapore-haze-2026/cctv/2702-2026-10-16.jpg',
                // i18n-ignore: scene data text, shown verbatim like shot titles
                beforeLabel: 'Jun 15, 3pm',
                // i18n-ignore: scene data text, shown verbatim like shot titles
                duringLabel: 'Oct 16, 3pm · PSI 229',
                // i18n-ignore: scene data text, shown verbatim like shot titles
                label: 'LTA camera 2702 · the Causeway interchange',
              },
              {
                before: '/scene-assets/singapore-haze-2026/cctv/4798-2026-06-15.jpg',
                during: '/scene-assets/singapore-haze-2026/cctv/4798-2026-10-16.jpg',
                // i18n-ignore: scene data text, shown verbatim like shot titles
                beforeLabel: 'Jun 15, 3pm',
                // i18n-ignore: scene data text, shown verbatim like shot titles
                duringLabel: 'Oct 16, 3pm · PSI 229',
                // i18n-ignore: scene data text, shown verbatim like shot titles
                label: 'LTA camera 4798 · Telok Blangah toward Sentosa',
              },
            ],
          },
          beats: [
            {
              at: 3,
              lat: 1.445,
              lon: 103.77,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Woodlands Causeway',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Oct 16, 3pm',
              hold: 9,
            },
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 16-19: Singapore goes after the companies',
        lat: 1.235,
        lon: 103.84,
        alt: 4000,
        heading: 0,
        pitch: -32,
        roll: 0,
        duration: 5,
        hold: 6,
        move: {
          from: {
            lat: 1.415,
            lon: 103.77,
            alt: 1500,
            heading: 0,
            pitch: -18,
          },
          easing: 'cubic-in-out',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-16',
          to: '2026-10-19',
          seconds: 6,
          ease: 1,
          fires: false,
          haze: {
            data: '/scene-assets/singapore-haze-2026/weather.json',
            tint: true,
            readout: {
              lat: 1.35,
              lon: 103.82,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Singapore',
            },
          },
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              at: 1.5,
              lat: 1.3069,
              lon: 103.8346,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'National Environment Agency',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Transboundary Haze Pollution Act notices',
              hold: 8,
              card: {
                // i18n-ignore: scene data text, shown verbatim like shot titles
                title: 'Notices to Indonesian firms',
                lines: [
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Oct 16, Sumatra: PT Bumi Andalas Permai, PT Bumi Mekar Hijau, PT Paramitra Mulia Langgeng, PT Sumatera Alam Anugerah, PT SBA Wood Industries, PT Hutan Lestari Raya, PT Bangkanesia',
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Oct 19, Kalimantan: PT Buana Megatama Jaya, PT Mananjung Hayak, PT Baratama Putra Perkasa',
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Oct 19, SGX queries: Golden Agri-Resources, Bumitama Agri, First Resources, Wilmar, Kencana Agri, Indofood Agri, TSH Resources',
                ],
                // i18n-ignore: scene data text, shown verbatim like shot titles
                note: 'Notices are not findings of liability. TSH and First Resources deny causing the haze. Sources: NEA, SGX RegCo.',
              },
            },
            {
              at: 7,
              lat: 1.29,
              lon: 103.85,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Shanmugam, Oct 19',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '"Every legal lever"',
              clip: {
                videoId: 'CxyAEx__Edg',
                start: 5,
                seconds: 4,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'CNA · Oct 19',
              },
            },
          ],
        },
      },
      // Act 4: back to the source. Who is named, who protests.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 4, Back to the source: Singapore and Jakarta act',
        lat: -2.0,
        lon: 107.0,
        alt: 3400000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 5,
        hold: 6.5,
        move: {
          from: {
            lat: 1.235,
            lon: 103.84,
            alt: 4000,
            heading: 0,
            pitch: -32,
          },
          easing: 'dive',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-16',
          to: '2026-10-23',
          seconds: 10,
          ease: 1,
          cell: 0.1,
          bbox: [95, -6.5, 119.5, 6.5],
          arcs: [
            {
              at: 2.5,
              from: {
                lat: 1.3,
                lon: 103.83,
              },
              to: {
                lat: -1.6,
                lon: 102.6,
              },
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Oct 16 · 7 firms · Sumatra concessions',
            },
            {
              at: 4.5,
              from: {
                lat: 1.3,
                lon: 103.83,
              },
              to: {
                lat: -1.6,
                lon: 113.4,
              },
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Oct 19 · 3 firms · Kalimantan concessions',
            },
          ],
          beats: [
            {
              at: 3.5,
              lat: -6.2125,
              lon: 106.8007,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Jakarta',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Indonesia\'s Forestry Ministry',
              hold: 8,
              card: {
                // i18n-ignore: scene data text, shown verbatim like shot titles
                title: 'Meanwhile, Indonesia acts',
                lines: [
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Sep 16 · 26 company licences suspended',
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Oct 19 · 32 companies sanctioned, 5 permits revoked',
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Oct 23 · police name 11 corporate suspects, identities withheld',
                ],
                // i18n-ignore: scene data text, shown verbatim like shot titles
                note: 'Sources: Antara, Tempo, NST.',
              },
            },
            {
              at: 7.5,
              lat: -6.17,
              lon: 106.83,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Prabowo, Sep 7',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '"I want the names of those corporations"',
              clip: {
                videoId: 'psaPauHrnIc',
                start: 40,
                seconds: 4,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'Kompas.com · Oct 22',
              },
            },
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 13-22: the students march',
        lat: -1.0,
        lon: 108.6,
        alt: 2900000,
        heading: 0,
        pitch: -88,
        roll: 0,
        duration: 4,
        hold: 10.0,
        move: {
          from: {
            lat: -2.0,
            lon: 107.0,
            alt: 3400000,
            heading: 0,
            pitch: -90,
          },
          easing: 'cubic-in-out',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-13',
          to: '2026-10-22',
          seconds: 9,
          ease: 1,
          cell: 0.1,
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              date: '2026-10-13',
              lat: 0.51,
              lon: 101.45,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Pekanbaru, Oct 13',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Students at the Riau Governor\'s Office',
              clip: {
                videoId: 'oFu_fG69Ek8',
                start: 20,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'PekanbaruTV',
              },
            },
            {
              date: '2026-10-19',
              lat: -2.21,
              lon: 113.92,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Palangkaraya, Oct 19',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: '500+ at the governor\'s office',
              clip: {
                videoId: '13mtRrVlslI',
                start: 30,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'Roya News',
              },
            },
            {
              date: '2026-10-21',
              lat: -0.03,
              lon: 109.34,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Pontianak, Oct 21',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'A night protest turns chaotic',
              clip: {
                videoId: '85g5B1i_R6c',
                start: 18,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'KompasTV',
              },
            },
            {
              date: '2026-10-22',
              lat: -3.32,
              lon: 114.59,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Banjarmasin, Oct 22',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'Students demand stronger action',
              clip: {
                videoId: 'KZtUXIpqH_s',
                start: 12,
                seconds: 5,
                // i18n-ignore: scene data text, shown verbatim like shot titles
                credit: 'The Star',
              },
            },
          ],
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 24: the fires still burn',
        lat: 1.0,
        lon: 108.4,
        alt: 4400000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 8,
        hold: 0.5,
        move: {
          from: {
            lat: 1.0,
            lon: 108.0,
            alt: 4600000,
            heading: 0,
            pitch: -90,
          },
          easing: 'linear',
        },
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': true,
        },
        // Satellite fire detections light up day by day under a ticker
        // that speeds up; each beat starts on its date and may overlap.
        fireStory: {
          data: '/scene-assets/singapore-haze-2026/fires-viirs.json',
          from: '2026-10-20',
          to: '2026-10-23',
          seconds: 5,
          ease: 1,
          cell: 0.1,
          bbox: [95, -6.5, 119.5, 6.5],
          beats: [
            {
              at: 2,
              lat: 1.35,
              lon: 103.82,
              // i18n-ignore: scene data text, shown verbatim like shot titles
              label: 'Singapore, Oct 24',
              // i18n-ignore: scene data text, shown verbatim like shot titles
              sub: 'PSI still unhealthy: 117 to 150',
              hold: 6,
              card: {
                // i18n-ignore: scene data text, shown verbatim like shot titles
                title: 'The fires still burn',
                lines: [
                  // i18n-ignore: scene data text, shown verbatim like shot titles
                  'Indonesia\'s forestry ministry warns the crisis could last until November.',
                ],
                // i18n-ignore: scene data text, shown verbatim like shot titles
                note: 'NEA live readings · Reuters',
              },
            },
          ],
        },
      },
  ],
});

const EVENT_RECIPES = [
  BHOTE_KOSHI_NEPAL_BOOTSTRAP_RECIPE,
  SINGAPORE_HAZE_RECIPE,
].filter(Boolean);

const PUBLIC_SCENE_RECIPES = [
  {
    id: 'flights-radar',
    title: msg('Global Flights Radar'),
    durationSec: 30,
    style: 'retro',
    ui: { hidePanels: true, hudMode: 'minimal', safeFrame: '16:9' },
    layers: {
      flights: true,
      satellites: false,
      earthquakes: false,
      traffic: false,
    },
    post: {
      bloom: 62,
      sharpen: true,
      detectionMode: 'OFF',
    },
    cameraPath: [
      {
        lat: 20.0,
        lon: -30.0,
        alt: 19000000,
        heading: 25,
        pitch: -65,
        roll: 0,
        duration: 6,
        hold: 1,
      },
      {
        lat: 46.0,
        lon: 2.0,
        alt: 8000000,
        heading: 40,
        pitch: -52,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.0,
        lon: 139.0,
        alt: 4200000,
        heading: 22,
        pitch: -46,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 37.6,
        lon: -122.4,
        alt: 1700000,
        heading: 8,
        pitch: -40,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 0.0,
        lon: -20.0,
        alt: 12000000,
        heading: -10,
        pitch: -70,
        roll: 0,
        duration: 4,
        hold: 0,
      },
    ],
  },
  {
    id: 'orbital-watch',
    title: msg('Orbital Watch'),
    durationSec: 32,
    style: 'surveillance',
    ui: { hidePanels: true, hudMode: 'full', safeFrame: '16:9' },
    layers: {
      flights: false,
      satellites: true,
      earthquakes: false,
      traffic: false,
    },
    post: {
      bloom: 58,
      sharpen: false,
      detectionMode: 'SPARSE',
      styleParams: {
        surveillance: {
          gain: 0.62,
          bloom: 0.38,
          scanlineStr: 0.9,
          pixelation: 2.1,
        },
      },
    },
    cameraPath: [
      {
        lat: 28.0,
        lon: -82.0,
        alt: 22000000,
        heading: 0,
        pitch: -82,
        roll: 0,
        duration: 7,
        hold: 1,
      },
      {
        lat: 10.0,
        lon: 20.0,
        alt: 12000000,
        heading: 18,
        pitch: -74,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.7,
        lon: 139.7,
        alt: 6500000,
        heading: 24,
        pitch: -64,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 48.8,
        lon: 2.3,
        alt: 3000000,
        heading: 32,
        pitch: -58,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 30.0,
        lon: -25.0,
        alt: 15000000,
        heading: -20,
        pitch: -78,
        roll: 0,
        duration: 4,
        hold: 0,
      },
    ],
  },
  {
    id: 'thermal-threats',
    title: msg('Thermal Threat Board'),
    durationSec: 26,
    style: 'thermal',
    ui: { hidePanels: true, hudMode: 'full', safeFrame: '16:9' },
    layers: {
      flights: false,
      satellites: false,
      earthquakes: true,
      traffic: false,
    },
    post: {
      bloom: 72,
      sharpen: true,
      detectionMode: 'OFF',
      styleParams: {
        thermal: {
          sensitivity: 0.84,
          bloom: 0.78,
          mode: 0.0,
          pixelation: 1.9,
        },
      },
    },
    cameraPath: [
      {
        lat: 37.0,
        lon: -121.0,
        alt: 5200000,
        heading: 20,
        pitch: -62,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.7,
        lon: 140.0,
        alt: 3100000,
        heading: 5,
        pitch: -55,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: -36.8,
        lon: 174.7,
        alt: 2600000,
        heading: -12,
        pitch: -50,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 38.0,
        lon: -10.0,
        alt: 9000000,
        heading: 12,
        pitch: -70,
        roll: 0,
        duration: 4,
        hold: 0,
      },
    ],
  },
  {
    id: 'city-overload',
    title: msg('City Overload'),
    durationSec: 30,
    style: 'surveillance',
    ui: { hidePanels: true, hudMode: 'minimal', safeFrame: '9:16' },
    layers: {
      flights: true,
      satellites: true,
      earthquakes: false,
      traffic: true,
    },
    post: {
      bloom: 65,
      sharpen: true,
      detectionMode: 'PANOPTIC',
      styleParams: {
        surveillance: {
          gain: 0.68,
          bloom: 0.42,
          scanlineStr: 1.0,
          pixelation: 2.4,
        },
      },
    },
    cameraPath: [
      {
        lat: 40.73,
        lon: -74.0,
        alt: 1500000,
        heading: 25,
        pitch: -44,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 40.73,
        lon: -74.0,
        alt: 550000,
        heading: 58,
        pitch: -36,
        roll: 0,
        duration: 4,
        hold: 1,
      },
      {
        lat: 40.73,
        lon: -74.0,
        alt: 260000,
        heading: 102,
        pitch: -33,
        roll: 0,
        duration: 4,
        hold: 1,
      },
      {
        lat: 34.05,
        lon: -118.24,
        alt: 1200000,
        heading: 45,
        pitch: -42,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 51.5,
        lon: -0.12,
        alt: 1200000,
        heading: 22,
        pitch: -44,
        roll: 0,
        duration: 5,
        hold: 0,
      },
    ],
  },
  {
    id: 'omniscience-pullback',
    title: msg('Omniscience Pullback'),
    durationSec: 36,
    style: 'retro',
    ui: { hidePanels: true, hudMode: 'full', safeFrame: '16:9' },
    layers: {
      flights: true,
      satellites: true,
      earthquakes: true,
      traffic: true,
    },
    post: {
      bloom: 68,
      sharpen: true,
      detectionMode: 'SPARSE',
      styleParams: {
        retro: {
          pixelation: 4.4,
          distortion: 0.42,
          instability: 0.58,
        },
      },
    },
    cameraPath: [
      {
        lat: 35.68,
        lon: 139.76,
        alt: 280000,
        heading: 30,
        pitch: -26,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.68,
        lon: 139.76,
        alt: 900000,
        heading: 26,
        pitch: -38,
        roll: 0,
        duration: 4,
        hold: 1,
      },
      {
        lat: 35.68,
        lon: 139.76,
        alt: 3800000,
        heading: 18,
        pitch: -52,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 20.0,
        lon: 110.0,
        alt: 9500000,
        heading: 8,
        pitch: -66,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 5.0,
        lon: 30.0,
        alt: 18000000,
        heading: -8,
        pitch: -78,
        roll: 0,
        duration: 6,
        hold: 0,
      },
    ],
  },
];

/** Build the recipe list without mutating stored user-authored projects. */
function createSceneRecipes({ localDemoRecipes = EVENT_RECIPES } = {}) {
  return [...localDemoRecipes, ...PUBLIC_SCENE_RECIPES];
}

export const SCENE_RECIPES = createSceneRecipes();

export const SCENE_APPEND_RECIPES = BHOTE_KOSHI_NEPAL_APPEND_RECIPE
  ? [BHOTE_KOSHI_NEPAL_APPEND_RECIPE]
  : [];

function getSceneRecipeById(id) {
  return SCENE_RECIPES.find((recipe) => recipe.id === id) || null;
}

export function getSceneAppendRecipeById(id) {
  return SCENE_APPEND_RECIPES.find((recipe) => recipe.id === id) || null;
}

// Built-in shot titles stay English in recipes and saved projects (upgrades
// and bindings match them verbatim). These are their display names; a title
// the user typed shows as typed. Place names inside them stay Latin.
const BUILTIN_SHOT_TITLES = new Set([
  msg('Global Incident Context'),
  msg('Nepal-Focused Globe Rotation'),
  msg('Bhote Koshi Regional Approach'),
  msg('Bhote Koshi Nearby Cities'),
  msg('Bhote Koshi Incident Corridor'),
  msg('Bhote Koshi Flood Path'),
  msg('Bhote Koshi Corridor Overview'),
  msg('Bhote Koshi Upper Valley'),
  msg('Upper Valley Collapse'),
  msg('Debris-Dammed Lake'),
  msg('Nepal-China Border Gate'),
  msg('Timure Evidence Cluster'),
  msg('Syabru Besi Passage'),
  msg('Bidur / Trishuli Consequence'),
  msg('Second landslide'),
  msg('Mailung / Upper Trishuli bridge'),
  msg('Dandagaun viewpoint restaurant'),
  msg('Devighat / Taadi Khola Bridge'),
  msg('Final view'),
]);

/**
 * Display title for a scene: the localized recipe name while the stored title
 * still matches the built-in verbatim, the stored title otherwise.
 * @param {{id?: string, title?: string}} scene
 * @returns {string}
 */
export function displaySceneTitle(scene) {
  const builtin = SCENE_RECIPES.find((recipe) => recipe.id === scene?.id);
  if (builtin?.title && scene.title === builtin.title) return t(builtin.title);
  const title = scene?.title || '';
  // Only the generated "Scene N" localizes; an operator-typed "Scene 007"
  // keeps its digits, so the number stays a string (no Number() round trip).
  const numbered = /^Scene ([1-9]\d*)$/.exec(title);
  return numbered ? t('Scene {n}', { n: numbered[1] }) : title;
}

/**
 * Display title for a shot: built-in titles and the numbered "Shot N"
 * fallback localize; any other title shows as stored.
 *
 * With `shot`, a built-in title localizes only for a recipe shot
 * (`sourcePackId`), so a typed title that matches a built-in one stays as
 * typed. Without `shot`, the title alone decides.
 * @param {string} title
 * @param {{sourcePackId?: string}} [shot]
 * @param {{id?: string}} [scene] The shot's scene, for projects saved before
 *   shots recorded their source pack.
 * @returns {string}
 */
export function displayShotTitle(title, shot = undefined, scene = undefined) {
  const text = typeof title === 'string' ? title : '';
  const fromRecipe = shot
    ? Boolean(shot.sourcePackId) || recipeDeclaresShotTitle(scene?.id, text)
    : true;
  if (fromRecipe && BUILTIN_SHOT_TITLES.has(text)) return t(text);
  const numbered = /^Shot ([1-9]\d*)$/.exec(text);
  return numbered ? t('Shot {n}', { n: numbered[1] }) : text;
}

/** Whether the built-in recipe behind a scene declares a shot with this title. */
function recipeDeclaresShotTitle(sceneId, title) {
  const recipe = sceneId ? getSceneRecipeById(sceneId) : null;
  return Boolean(
    recipe?.cameraPath?.some((keyframe) => keyframe?.title === title),
  );
}
