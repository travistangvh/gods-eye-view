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
  version: 5,
  // Browsers that installed an older version get this one on next load,
  // unless the operator has captured their own shots into the scene.
  upgradeInstalledScene: true,
  // Shows each shot's title over the map while it plays.
  captions: true,
  title: msg('Singapore Haze 2026'),
  durationSec: 375.0,
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
      // Act 1: the fires. One descent, then close to the ground.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 1, The fires: Kalimantan, September 2026',
        lat: -1.5,
        lon: 110.0,
        alt: 3000000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 5,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: '-W8l4tLeLwY',
          start: 18,
          fullscreen: true,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Kalimantan, September 2026',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Fires have burned across Borneo and Sumatra since July. A strong El Niño and drained, dry peat made this the worst season in more than a decade (AP, Bloomberg).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'Ferry Irwandi · Sep 1 · watched 3.5 million times',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Sep 17: Ogan Komering Ilir, South Sumatra, 3,028 hotspots in a day',
        lat: -3.3642,
        lon: 105.6116,
        alt: 6000,
        heading: 0,
        pitch: -40,
        roll: 0,
        duration: 8,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: 'mCd4P89s9zo',
          start: 62,
          lat: -3.3,
          lon: 105.6,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Ogan Komering Ilir: the peat is burning',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'On Sep 17 satellites counted 12,357 hotspots across Indonesia in 24 hours, 3,028 of them in South Sumatra. Peat fires smoulder underground for weeks.',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'tvOneNews aerial footage · Sep 5',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Aug-Oct: fires burn across Sumatra and Kalimantan',
        lat: -1.5,
        lon: 109.3,
        alt: 4200000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 5,
        hold: 16,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        // Muted clips around the map, each joined to its place. Places are
        // approximate (province or district); start skips to raw footage.
        videoWall: [
          {
            videoId: '8lxZvoUZu_s',
            lat: 0.4,
            lon: 101.9,
            start: 15,
            // i18n-ignore: scene data text, shown verbatim like shot titles
            label: 'Riau · peat fire · Aug 25 · tvOneNews',
          },
          {
            videoId: 'm8gGc4DE8O8',
            lat: -1.6,
            lon: 103.8,
            start: 45,
            // i18n-ignore: scene data text, shown verbatim like shot titles
            label: 'Muaro Jambi · Oct 20 · Metro TV',
          },
          {
            videoId: 'mCd4P89s9zo',
            lat: -3.3,
            lon: 105.6,
            start: 62,
            // i18n-ignore: scene data text, shown verbatim like shot titles
            label: 'Ogan Komering Ilir, South Sumatra · Sep 5 · tvOneNews',
          },
          {
            videoId: 'mll1VmKZ18U',
            lat: -2.9,
            lon: 111.9,
            start: 10,
            // i18n-ignore: scene data text, shown verbatim like shot titles
            label: 'Tanjung Puting National Park · Oct 13 · Liputan6',
          },
          {
            videoId: 'COfQO_xF-78',
            lat: -2.2,
            lon: 113.9,
            start: 40,
            // i18n-ignore: scene data text, shown verbatim like shot titles
            label: 'Central Kalimantan from the air · Oct 17 · KompasTV',
          },
          {
            videoId: '7GVaRIqWFas',
            lat: -0.97,
            lon: 116.7,
            start: 12,
            // i18n-ignore: scene data text, shown verbatim like shot titles
            label: 'Near the new capital, East Kalimantan · Oct 18 · KompasTV',
          },
        ],
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct: Palembang disappears into smoke',
        lat: -3.0681,
        lon: 104.7916,
        alt: 8000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: 'v5owKwId92Q',
          start: 30,
          lat: -2.9761,
          lon: 104.7754,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Palembang disappears into smoke',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Smoke from the surrounding peat covered South Sumatra\'s capital. On Oct 18 it disrupted flights, and the disaster agency seeded clouds for rain (Metro TV).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'Trisno DriveOne drone footage · Oct 5',
        },
      },
      // Act 2: the crossing. One low flight north toward Singapore.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 2, The crossing: the smoke heads north to Singapore',
        lat: 0.2,
        lon: 104.0,
        alt: 30000,
        heading: 350,
        pitch: -20,
        roll: 0,
        duration: 10,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: true,
          'recent-imagery': false,
          'ais-live-vessels': true,
          'air-quality': false,
        },
        videoFeature: {
          videoId: 'YI9P0Zmd7EE',
          start: 34,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'The smoke crosses the strait',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Prevailing winds carry the smoke from Sumatra north across the Strait of Malacca to Singapore and Malaysia. The wind shown is today\'s.',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'CNA Explains · Sep 19',
        },
      },
      // Act 3: the reach. One featured clip per place, with what happened there.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 3, The reach: the smoke spreads across Southeast Asia',
        lat: 4.0,
        lon: 110.0,
        alt: 5200000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 5,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: 'cw3UJ-h1oeY',
          start: 10,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'The smoke spreads across Southeast Asia',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Smoke from fires in Sumatra and Kalimantan has drifted over Malaysia, Singapore, the Philippines and East Timor (Africanews, Oct 15).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'Al Jazeera English · Oct 13',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 16: Singapore\'s PSI peaks at 229',
        lat: 1.2178,
        lon: 103.8666,
        alt: 6000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': {
            enabled: true,
            params: { at: '2026-10-16T15:00:00+08:00' },
          },
        },
        videoFeature: {
          videoId: '2l7irQkN2b0',
          start: 3,
          lat: 1.2868,
          lon: 103.8545,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Singapore: the worst haze in more than a decade',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'The 24-hour PSI reached 212 on Oct 15 and 229 on Oct 16, and the minister warned it could pass 300 (NEA, CNA).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'The Star · Sep 14',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 9-11: the Grand Prix runs under haze',
        lat: 1.2569,
        lon: 103.8701,
        alt: 3000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': false,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': {
            enabled: true,
            params: { at: '2026-10-09T17:00:00+08:00' },
          },
        },
        videoFeature: {
          videoId: 'yALg1in78o0',
          start: 9,
          lat: 1.2914,
          lon: 103.864,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'The Grand Prix runs under haze',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Singapore\'s Formula 1 weekend went ahead on Oct 9-11 under a haze cloud; organisers had prepared contingency plans (Reuters, Al Jazeera).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'Reuters · Oct 9',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 6: Batu Pahat, Johor, closes about 200 schools',
        lat: 1.7628,
        lon: 102.9487,
        alt: 8000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 14,
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
        videoFeature: {
          videoId: 'ZSCHjeYQwzk',
          start: 5,
          lat: 1.8548,
          lon: 102.9325,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Batu Pahat: about 200 schools close',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Schools in Batu Pahat closed as the haze thickened. Malaysian schools close wherever the Air Pollutant Index passes 180 (CNA, Malay Mail).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'CNA · Oct 6',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 9: Malaysia shuts schools in Kuala Lumpur and six states',
        lat: 3.0889,
        lon: 101.7244,
        alt: 6000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 14,
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
        videoFeature: {
          videoId: 'c_OA2lTt2cE',
          start: 5,
          lat: 3.1579,
          lon: 101.7123,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Kuala Lumpur: classes move home',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'On Oct 9 Malaysia closed schools in Kuala Lumpur, Putrajaya, Selangor, Johor, Melaka, Negeri Sembilan and part of Pahang (Reuters via Al Jazeera).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'AP Archive · Oct 13',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Sep 2: the haze reaches the Philippines',
        lat: 9.6242,
        lon: 118.7558,
        alt: 10000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 8,
        hold: 14,
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
        videoFeature: {
          videoId: '-KeYnUlS5cU',
          start: 2,
          lat: 9.7392,
          lon: 118.7353,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'The Philippines: the farthest reach',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'By Sep 2 haze from Indonesia had reached Palawan, the Visayas and Mindanao (ABS-CBN TV Patrol).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'ABS-CBN News · Sep 2',
        },
      },
      // Act 4: back to the source. Who suffers, who is named, who protests.
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Act 4, Back to the source: Pontianak closes schools in thick smoke',
        lat: -0.1183,
        lon: 109.3587,
        alt: 8000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 8,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: 'gJOM0L3PsZA',
          start: 60,
          lat: -0.0263,
          lon: 109.3425,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Pontianak: schools close as the smoke thickens',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Thick smoke cut visibility across the West Kalimantan capital and schools were closed (Metro TV, Sep 1).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'Metro TV · Sep 1',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 12-15: Palangkaraya, Central Kalimantan, turns yellow',
        lat: -2.3016,
        lon: 113.9375,
        alt: 8000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: 'ZbaFgyvEP4w',
          start: 20,
          lat: -2.2096,
          lon: 113.9213,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Palangkaraya: a city swallowed by smoke',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Thick yellow smoke cut visibility to a few dozen metres on Oct 15, and the air pollution index passed 1,200, four times the hazardous level (Euronews, EnviroLink).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'tvOneNews · Oct 12',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 16-23: Singapore names companies',
        lat: 1.2782,
        lon: 103.8397,
        alt: 2500,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 18,
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
        videoFeature: {
          videoId: 'CxyAEx__Edg',
          start: 5,
          lat: 1.3069,
          lon: 103.8346,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Singapore names companies',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Notices under the Transboundary Haze Pollution Act to companies Singapore suspects are linked to the fires. Notices are not findings of liability; TSH and First Resources deny causing the haze.',
          points: [
            // i18n-ignore: scene data text, shown verbatim like shot titles
            'Oct 16, Sumatra: PT Bumi Andalas Permai, PT Bumi Mekar Hijau, PT Paramitra Mulia Langgeng, PT Sumatera Alam Anugerah, PT SBA Wood Industries, PT Hutan Lestari Raya, PT Bangkanesia',
            // i18n-ignore: scene data text, shown verbatim like shot titles
            'Oct 19, Kalimantan: PT Buana Megatama Jaya, PT Mananjung Hayak, PT Baratama Putra Perkasa',
            // i18n-ignore: scene data text, shown verbatim like shot titles
            'Oct 19, SGX queries: Golden Agri-Resources, Bumitama Agri, First Resources, Wilmar, Kencana Agri, Indofood Agri, TSH Resources',
            // i18n-ignore: scene data text, shown verbatim like shot titles
            'Oct 23: information notices to 10 Singapore-registered firms, including Wilmar and Asia Pulp & Paper',
          ],
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'CNA · Oct 19 · sources: NEA, SGX RegCo, Business Today, The Edge',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Sep-Oct: Indonesia suspends company licences',
        lat: -6.2585,
        lon: 106.8088,
        alt: 4000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 8,
        hold: 14,
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
        videoFeature: {
          videoId: 'psaPauHrnIc',
          start: 40,
          lat: -6.2125,
          lon: 106.8007,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Jakarta: licences suspended',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Indonesia suspended 26 companies\' licences on Sep 16; by Oct 19 it had sanctioned 32 and revoked 5 permits. On Oct 23 police named 11 corporate suspects without releasing their names.',
          points: [
            // i18n-ignore: scene data text, shown verbatim like shot titles
            'Prabowo, Sep 7: \'I want the names of those corporations to be quickly handed to me.\'',
          ],
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'Kompas.com · Oct 22 · sources: Antara, Tempo, NST',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 13: students protest in Pekanbaru, Riau',
        lat: 0.4723,
        lon: 101.4538,
        alt: 3000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 5,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: 'oFu_fG69Ek8',
          start: 20,
          lat: 0.5068,
          lon: 101.4477,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Pekanbaru: students march on the governor',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'Hundreds of students rallied at the Riau Governor\'s Office, demanding action on the fires and the smoke. Their banner: \'Forests burn, the people suffer, the state must act.\'',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'PekanbaruTV · Oct 13',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 19: hundreds protest at the Central Kalimantan Governor\'s Office',
        lat: -2.2334,
        lon: 113.9175,
        alt: 2000,
        heading: 0,
        pitch: -38,
        roll: 0,
        duration: 8,
        hold: 16,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': false,
        },
        videoFeature: {
          videoId: '13mtRrVlslI',
          start: 30,
          lat: -2.2104,
          lon: 113.9135,
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'Palangkaraya: \'the people are on the brink of death\'',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'More than 500 protesters gathered at the Central Kalimantan Governor\'s Office, demanding the fires be declared a national disaster (AP, Liputan6). The banner\'s words are the title.',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'Roya News · Oct 19',
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Oct 24: the fires still burn',
        lat: 3.0,
        lon: 108.0,
        alt: 4800000,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 8,
        hold: 14,
        layers: {
          flights: false,
          satellites: false,
          earthquakes: false,
          traffic: false,
          'local-firms': true,
          wind: false,
          'recent-imagery': false,
          'ais-live-vessels': false,
          'air-quality': true,
        },
        videoFeature: {
          // i18n-ignore: scene data text, shown verbatim like shot titles
          title: 'The fires still burn',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          summary: 'On Oct 24 Singapore\'s PSI was still unhealthy, between 117 and 150. Indonesia\'s forestry ministry has warned the crisis could last until November (Reuters).',
          // i18n-ignore: scene data text, shown verbatim like shot titles
          label: 'NEA live readings · Reuters',
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
