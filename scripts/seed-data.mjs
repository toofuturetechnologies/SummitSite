/**
 * Summit Platform - Realistic Data Seed Script
 * Populates DB with guides, trips, dates, and reviews inspired by explore-share.com
 * 
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-data.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nqczucpdkccbkydbzytl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
};

async function supabaseQuery(path, method = 'GET', body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      ...headers,
      'Prefer': method === 'POST' ? 'return=representation' : undefined,
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  try {
    return { data: JSON.parse(text), status: res.status };
  } catch {
    return { data: text, status: res.status };
  }
}

async function createAuthUser(email, password, metadata) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: metadata }),
  });
  const data = await res.json();
  return data;
}

// ─── GUIDE DATA ────────────────────────────────────────────────────────────────

const GUIDES = [
  {
    email: 'marcus.wolfe.guide@summit-demo.com',
    password: 'GuideDemo2026!',
    full_name: 'Marcus Wolfe',
    display_name: 'Marcus Wolfe',
    tagline: 'AMGA Certified Alpine Guide · 15 Years in the Rockies',
    bio: `I grew up at the base of the Rockies in Fort Collins, Colorado. After completing my AMGA Rock, Alpine, and Ski mountaineering certifications, I spent three seasons guiding in Chamonix before returning home to share what I consider the finest mountain terrain in North America. I specialize in technical alpine routes, multi-pitch rock climbing, and backcountry ski descents. My goal is always the same: get you to the summit safely, and leave you wanting more.`,
    base_location: 'Boulder, Colorado',
    years_experience: 15,
    rating: 4.92,
    review_count: 87,
    specialties: ['mountaineering', 'alpine_climbing', 'ski_touring', 'rock_climbing'],
    languages: ['English', 'French', 'German'],
    certifications: [
      { name: 'AMGA Alpine Guide', issuer: 'AMGA', year: 2014 },
      { name: 'AMGA Rock Guide', issuer: 'AMGA', year: 2012 },
      { name: 'Wilderness First Responder', issuer: 'NOLS', year: 2023 },
      { name: 'AIARE Level 2', issuer: 'AIARE', year: 2016 },
    ],
    slug: 'marcus-wolfe',
    is_verified: true,
  },
  {
    email: 'sierra.chen.guide@summit-demo.com',
    password: 'GuideDemo2026!',
    full_name: 'Sierra Chen',
    display_name: 'Sierra Chen',
    tagline: 'Yosemite Big Wall Specialist · Rock Climbing Coach',
    bio: `Sierra fell in love with climbing at age 12 on the limestone walls of Rifle, Colorado. After completing her degree in Outdoor Education at NAU, she moved to Yosemite Valley and spent six years climbing big walls and coaching athletes. She now guides throughout California and the Sierra Nevada, focusing on making technical climbing accessible to beginners and helping experienced climbers take their skills to the next level. Sierra is known for her patience, precise technical instruction, and infectious enthusiasm.`,
    base_location: 'Bishop, California',
    years_experience: 11,
    rating: 4.88,
    review_count: 63,
    specialties: ['rock_climbing', 'alpine_climbing', 'via_ferrata'],
    languages: ['English', 'Mandarin'],
    certifications: [
      { name: 'AMGA Rock Guide', issuer: 'AMGA', year: 2018 },
      { name: 'CPR/First Aid', issuer: 'Red Cross', year: 2025 },
      { name: 'Single Pitch Instructor', issuer: 'AMGA', year: 2016 },
    ],
    slug: 'sierra-chen',
    is_verified: true,
  },
  {
    email: 'jake.morrison.guide@summit-demo.com',
    password: 'GuideDemo2026!',
    full_name: 'Jake Morrison',
    display_name: 'Jake Morrison',
    tagline: 'Utah Desert Guide · Canyoneering & Backcountry Expert',
    bio: `Jake Morrison was born and raised in Moab, Utah. His backyard is Canyonlands, Arches, and the San Rafael Swell — and he knows every slot canyon, sandstone tower, and desert plunge pool within 200 miles. With a background in rescue operations and wildland firefighting, Jake brings an unmatched level of safety awareness and environmental expertise to every trip. He runs canyoneering expeditions, multi-day desert backpacking, and technical scrambling routes that showcase the raw beauty of the Colorado Plateau.`,
    base_location: 'Moab, Utah',
    years_experience: 12,
    rating: 4.95,
    review_count: 104,
    specialties: ['canyoneering', 'hiking', 'rock_climbing'],
    languages: ['English', 'Spanish'],
    certifications: [
      { name: 'Swiftwater Rescue Technician', issuer: 'Rescue 3', year: 2019 },
      { name: 'Wilderness First Responder', issuer: 'NOLS', year: 2024 },
      { name: 'AIARE Level 1', issuer: 'AIARE', year: 2020 },
    ],
    slug: 'jake-morrison',
    is_verified: true,
  },
  {
    email: 'elena.vasquez.guide@summit-demo.com',
    password: 'GuideDemo2026!',
    full_name: 'Elena Vasquez',
    display_name: 'Elena Vasquez',
    tagline: 'IFMGA Mountain Guide · Cascade Volcanoes Specialist',
    bio: `Elena is one of only a handful of IFMGA-certified female guides in the Pacific Northwest. She has summited Mount Rainier over 200 times, led expeditions on Denali, and climbed in Patagonia, the Alps, and the Himalayas. Back home in Washington, she runs summit seminars on Mount Rainier, glacier travel courses on Mount Baker, and technical alpine routes throughout the Cascades. Elena believes that mountain guiding is ultimately about building confidence — both on the mountain and in life.`,
    base_location: 'Ashford, Washington',
    years_experience: 18,
    rating: 4.97,
    review_count: 156,
    specialties: ['mountaineering', 'glacier_travel', 'alpine_climbing', 'ski_touring'],
    languages: ['English', 'Spanish', 'Italian'],
    certifications: [
      { name: 'IFMGA Mountain Guide', issuer: 'IFMGA', year: 2015 },
      { name: 'AMGA Alpine Guide', issuer: 'AMGA', year: 2012 },
      { name: 'Wilderness First Responder', issuer: 'NOLS', year: 2025 },
      { name: 'AIARE Level 2', issuer: 'AIARE', year: 2011 },
    ],
    slug: 'elena-vasquez',
    is_verified: true,
  },
  {
    email: 'finn.odriscoll.guide@summit-demo.com',
    password: 'GuideDemo2026!',
    full_name: 'Finn O\'Driscoll',
    display_name: 'Finn O\'Driscoll',
    tagline: 'Ice Climbing Instructor · Ouray Ice Festival Veteran',
    bio: `Finn moved from Galway, Ireland to Ouray, Colorado 14 years ago after falling in love with Colorado's world-class ice climbing. He has competed in the Ouray Ice Festival, guided ice routes across Canada, and spent two winters teaching at the Alaska Mountaineering School. Finn brings a distinctive European guiding philosophy — thorough, methodical, and deeply focused on technique — combined with an unmistakable Irish storytelling flair that makes even the coldest day feel warm. If you want to learn ice climbing from the ground up or push into WI5, Finn is your guide.`,
    base_location: 'Ouray, Colorado',
    years_experience: 14,
    rating: 4.90,
    review_count: 72,
    specialties: ['ice_climbing', 'mountaineering', 'alpine_climbing', 'rock_climbing'],
    languages: ['English', 'Irish Gaelic'],
    certifications: [
      { name: 'AMGA Rock Guide', issuer: 'AMGA', year: 2017 },
      { name: 'AMGA Alpine Guide', issuer: 'AMGA', year: 2019 },
      { name: 'Wilderness First Responder', issuer: 'NOLS', year: 2024 },
      { name: 'AIARE Level 2', issuer: 'AIARE', year: 2018 },
    ],
    slug: 'finn-odriscoll',
    is_verified: true,
  },
];

// ─── TRIP DATA ─────────────────────────────────────────────────────────────────

function buildTrips(guideIds) {
  const [marcusId, sierraId, jakeId, elenaId, finnId] = guideIds;

  return [
    // ─── MARCUS WOLFE (Boulder, CO) ───
    {
      guide_id: marcusId,
      title: 'Mount Elbert Summit — Colorado\'s Highest Peak',
      slug: 'mount-elbert-summit-co',
      activity: 'mountaineering',
      difficulty: 'intermediate',
      description: `At 14,440 feet, Mount Elbert is the highest peak in the Rocky Mountains and the second highest in the contiguous United States. This guided ascent takes you from the trailhead at Twin Lakes to the broad, windswept summit with 360-degree views across the Sawatch Range. While not technically difficult, the altitude and distance demand solid fitness and proper acclimatization. Marcus will guide you through pacing strategy, altitude management, and summit safety, making this a transformative introduction to Colorado's 14ers.`,
      highlights: [
        'Summit the highest peak in the Rocky Mountains',
        'Stunning views of the Sawatch and Elk Mountain ranges',
        'Professional altitude and pacing coaching',
        'Small group experience (max 6)',
        'Photo stops at iconic viewpoints',
      ],
      itinerary: [
        { day: 1, title: 'Acclimatization & Gear Check', description: 'Meet in Leadville for a gear review and acclimatization walk. We spend the afternoon at 10,000 feet, helping your body adjust before the summit push. Dinner and briefing at a local restaurant.' },
        { day: 2, title: 'Summit Day', description: 'Early 4:30 AM start. We hike the North Elbert Trail through aspen groves, then gain the broad northeast ridge. Summit by mid-morning, weather permitting. Descent via the same route, arriving at trailhead by early afternoon.' },
      ],
      inclusions: ['Professional AMGA-certified guide', 'Pre-trip briefing', 'Emergency first aid kit', 'Snacks and summit lunch', 'Trip photos'],
      exclusions: ['Transportation to trailhead', 'Accommodation', 'Personal gear', 'Trekking poles (available to rent)'],
      gear_list: ['Sturdy hiking boots', 'Layers (base, mid, hard shell)', 'Gloves and hat', 'Sunscreen and sunglasses', 'Water (3L minimum)', 'Trekking poles recommended'],
      meeting_point: 'Leadville, CO — Coordinates provided after booking',
      duration_days: 2,
      price_per_person: 295,
      max_group_size: 6,
      country: 'United States',
      region: 'Colorado',
      latitude: 39.1178,
      longitude: -106.4453,
      is_featured: true,
    },
    {
      guide_id: marcusId,
      title: 'Longs Peak Diamond — Technical Alpine Rock',
      slug: 'longs-peak-diamond-co',
      activity: 'alpine_climbing',
      difficulty: 'expert',
      description: `The Diamond on Longs Peak's East Face is one of the most iconic big wall climbs in North America — 900 feet of vertical granite at 13,000 feet. Marcus's comprehensive program includes two days of technical preparation on Lumpy Ridge, followed by a summit day on the Casual Route (5.10a) or more challenging lines depending on your experience. This is a serious alpine undertaking requiring proficiency in multi-pitch trad climbing, self-rescue basics, and excellent fitness. A bucket-list objective for any serious rock climber.`,
      highlights: [
        'Climb one of America\'s most celebrated rock walls',
        'Multi-pitch trad climbing to 14,259 ft',
        'Technical skill development on Lumpy Ridge prep days',
        'Small team (max 2 climbers)',
        'Personalized route selection based on ability',
      ],
      itinerary: [
        { day: 1, title: 'Skills Assessment & Prep Climbs', description: 'Morning at Lumpy Ridge to assess and refine your gear placements, anchor building, and lead climbing on granite. Afternoon rest and route discussion.' },
        { day: 2, title: 'Alpine Fitness Day — The Keyhole Route', description: 'Hike to the summit via the standard Keyhole Route to acclimatize and preview the upper mountain terrain. Early start, summit by noon.' },
        { day: 3, title: 'The Diamond', description: 'Alpine start at 2:00 AM. Approach via Chasm Lake, begin climbing at first light. Climb the Casual Route or D7, summit, and descend via Keyhole. Return to trailhead by late afternoon.' },
      ],
      inclusions: ['3 days of AMGA Alpine Guide instruction', 'All climbing hardware (rack, ropes)', 'Helmet', 'Pre-trip skills consult', 'Trip report and photos'],
      exclusions: ['Rocky Mountain National Park entry fee', 'Accommodation', 'Personal gear', 'Food'],
      gear_list: ['Rock shoes', 'Harness', 'Helmet (provided)', 'Approach shoes', 'Alpine layers', 'Headlamp with fresh batteries', '3L water capacity'],
      meeting_point: 'Estes Park, CO — Exact location provided after booking',
      duration_days: 3,
      price_per_person: 695,
      max_group_size: 2,
      country: 'United States',
      region: 'Colorado',
      latitude: 40.2549,
      longitude: -105.6153,
      is_featured: true,
    },
    {
      guide_id: marcusId,
      title: 'Maroon Bells Ski Touring — Aspen Backcountry',
      slug: 'maroon-bells-ski-touring',
      activity: 'ski_touring',
      difficulty: 'advanced',
      description: `The Maroon Bells are among the most photographed mountains in North America, and in winter they offer world-class ski touring terrain. This 3-day trip explores the East Maroon Creek drainage, North Maroon Peak couloirs, and the stunning Buckskin Basin. Marcus will lead you through avalanche terrain assessment, skinning efficiency, and powder ski descents in one of Colorado's most dramatic settings. The trip is appropriate for strong skiers with prior backcountry experience; AIARE 1 knowledge recommended.`,
      highlights: [
        'Ski beneath the iconic Maroon Bells',
        'Powder descents in remote Elk Mountain terrain',
        'Daily avalanche assessment and decision-making training',
        'Hut-to-hut or tent camping options',
        'Max 4 guests for personalized instruction',
      ],
      itinerary: [
        { day: 1, title: 'Approach & Camp Setup', description: 'Skin up East Maroon Creek to basecamp at ~11,500 ft. Afternoon warmup descent and avalanche discussion for the terrain ahead.' },
        { day: 2, title: 'Buckskin Basin', description: 'Full day touring in Buckskin Basin. Multiple ski descents, avalanche terrain management, and optional assessment of Maroon Peak couloir access.' },
        { day: 3, title: 'Summit Couloir or Powder Bowl Exit', description: 'Weather-dependent objective. Either ascend and ski the North Maroon East Couloir (40°) or take multiple touring laps through powder bowls before skinning out.' },
      ],
      inclusions: ['AMGA certified ski guide', 'Avalanche beacon check/loan', 'Probes and shovel for group kit', 'Camping kitchen setup', 'Daily safety briefings'],
      exclusions: ['Personal ski touring gear (rentals available in Aspen)', 'Food', 'Hut fees if applicable', 'Aspen/Snowmass shuttle'],
      gear_list: ['AT or telemark skis with touring bindings', 'Skins', 'Avalanche beacon', 'Probe', 'Shovel', 'Backpack 30L+', 'Camp gear if tenting'],
      meeting_point: 'Aspen, CO — Ute Mountaineer parking lot',
      duration_days: 3,
      price_per_person: 550,
      max_group_size: 4,
      country: 'United States',
      region: 'Colorado',
      latitude: 39.0713,
      longitude: -106.9888,
      is_featured: false,
    },

    // ─── SIERRA CHEN (Bishop, CA) ───
    {
      guide_id: sierraId,
      title: 'Yosemite El Capitan — The Nose Intro Course',
      slug: 'yosemite-el-capitan-nose-intro',
      activity: 'rock_climbing',
      difficulty: 'advanced',
      description: `The Nose of El Capitan is the world's most famous rock climb. This 4-day program won't take you to the top (that requires weeks of big wall experience), but it will teach you everything you need to eventually get there. Sierra leads a comprehensive introduction to big wall technique: hauling systems, portaledge bivouacs, aid climbing, and free climbing on the lower pitches of The Nose up to Sickle Ledge. You'll sleep on a portaledge 1,000 feet above Yosemite Valley — one of the most memorable nights of your life.`,
      highlights: [
        'Climb the lower pitches of El Capitan\'s Nose route',
        'Sleep on a portaledge high on the wall',
        'Learn hauling, aid climbing, and big wall systems',
        'Small group — max 2 clients per guide',
        'Full gear provided including portaledge',
      ],
      itinerary: [
        { day: 1, title: 'Ground School & Lower Slabs', description: 'Gear orientation, hauling systems practice, and warm-up climbing on Yosemite Valley slabs near Manure Pile Buttress.' },
        { day: 2, title: 'The Nose — Pitch 1-8', description: 'Climb the first eight pitches to Sickle Ledge, fixing ropes for efficient ascent. Practice jumaring and cleaning on the way up.' },
        { day: 3, title: 'Portaledge Bivy + Pitches 8-16', description: 'Establish portaledge camp on Sickle Ledge. Climb toward El Cap Tower. Experience the sunset view from 1,500 feet above the valley.' },
        { day: 4, title: 'Descent & Debrief', description: 'Rappel descent, clean and return gear. Full debrief and next-steps plan for continuing your big wall journey.' },
      ],
      inclusions: ['AMGA Rock Guide instruction (1:2 ratio)', 'All climbing hardware', 'Portaledge and bivy gear', 'Wall food and water hauling system', 'Yosemite guide permit'],
      exclusions: ['Yosemite National Park entry', 'Personal accommodation', 'Personal climbing gear (shoes, harness, helmet)', 'Travel'],
      gear_list: ['Rock shoes', 'Harness', 'Helmet', 'Warm sleeping bag (30°F)', 'Headlamp', 'Personal snacks', 'Layers for cold nights'],
      meeting_point: 'Yosemite Valley — Camp 4 parking lot, 7:00 AM',
      duration_days: 4,
      price_per_person: 895,
      max_group_size: 2,
      country: 'United States',
      region: 'California',
      latitude: 37.7335,
      longitude: -119.6354,
      is_featured: true,
    },
    {
      guide_id: sierraId,
      title: 'Bishop Bouldering — Eastern Sierra Rock Skills Weekend',
      slug: 'bishop-bouldering-weekend',
      activity: 'rock_climbing',
      difficulty: 'beginner',
      description: `Bishop, California sits at the gateway to some of the world's finest bouldering terrain: the Buttermilks, Happy Boulders, and the Tablelands. This weekend program is perfect for beginners and intermediate climbers looking to build solid rock movement skills in a fun, supportive environment. Sierra will take you through footwork drills, reading rock, body positioning, and fall practice — all the fundamentals that form the foundation of a lifelong climbing career. No gear required; all equipment provided.`,
      highlights: [
        'Learn from an AMGA-certified rock guide',
        'World-class bouldering terrain at the Buttermilks',
        'Movement coaching and technique analysis',
        'Small group (max 4)',
        'All gear provided — no experience necessary',
      ],
      itinerary: [
        { day: 1, title: 'Introduction to Movement', description: 'Start at the Happy Boulders with footwork and balance drills. Progress through V0-V3 problems focusing on technique over strength. Evening campfire debrief.' },
        { day: 2, title: 'The Buttermilks', description: 'Head to the iconic Buttermilk boulders. Work on more sustained movement, crimps, slopers, and problem-solving. Optional project time in the afternoon.' },
      ],
      inclusions: ['AMGA instructor', 'Climbing shoes (rental)', 'Crash pads (group set)', 'Technique video analysis', 'Beta guide to Bishop\'s best problems'],
      exclusions: ['Accommodation in Bishop', 'Food and water', 'Travel to Bishop'],
      gear_list: ['Comfortable athletic clothes', 'Sunscreen', 'Plenty of water (desert environment)', 'Chalk bag if you have one'],
      meeting_point: 'Bishop, CA — The Pit Climbing Gym, 8:00 AM',
      duration_days: 2,
      price_per_person: 250,
      max_group_size: 4,
      country: 'United States',
      region: 'California',
      latitude: 37.3630,
      longitude: -118.3954,
      is_featured: false,
    },
    {
      guide_id: sierraId,
      title: 'Whitney Portal to Summit — Multi-Pitch High Route',
      slug: 'mt-whitney-portal-summit-sierra',
      activity: 'alpine_climbing',
      difficulty: 'advanced',
      description: `Leave the crowds on the main trail behind. Sierra guides a select group up the East Buttress of Mount Whitney — a classic 5.7 multi-pitch route that gains the summit via technical terrain with the eastern Sierra spread out below you. The approach follows the Whitney Portal Road to the Mountaineer's Route, then diverges to the East Buttress, a 1,500-foot ridge of clean Sierra granite culminating at 14,505 feet. This is the mountaineer's way up the highest point in the contiguous US.`,
      highlights: [
        'Climb the highest peak in the lower 48 via a technical route',
        'Beautiful multi-pitch climbing on Sierra granite',
        'Expert guide with 11+ years on Whitney',
        'Summit photos with no trail crowds',
        'Max group size: 3',
      ],
      itinerary: [
        { day: 1, title: 'Approach to Basecamp', description: 'Drive to Whitney Portal and hike to basecamp at the Lower Boy Scout Lake (10,300 ft). Evening meal and gear check.' },
        { day: 2, title: 'Technical Ascent Day', description: '4:00 AM start. Gain the East Buttress via the Mountaineer\'s Route talus field, then begin climbing at dawn. 8 pitches to the summit plateau. Walk to the summit block and sign the register.' },
        { day: 3, title: 'Descent', description: 'Descent via the Main Trail (22 miles round trip from summit). Shuttle arranged from the portal to cars.' },
      ],
      inclusions: ['AMGA guide', 'All climbing gear (ropes, rack, helmets)', 'Whitney Zone permit (booked in advance)', 'Emergency shelter', 'Group first aid kit'],
      exclusions: ['Inyo National Forest fee', 'Personal accommodation at portal', 'Food', 'Personal gear (harness, shoes, clothing)'],
      gear_list: ['Hiking boots', 'Rock shoes', 'Harness', 'Helmet', '3 layers (summit temps can drop to 20°F)', 'Ice axe and microspikes (early season)', 'Headlamp'],
      meeting_point: 'Whitney Portal Campground, Lone Pine, CA',
      duration_days: 3,
      price_per_person: 550,
      max_group_size: 3,
      country: 'United States',
      region: 'California',
      latitude: 36.5785,
      longitude: -118.2923,
      is_featured: true,
    },

    // ─── JAKE MORRISON (Moab, UT) ───
    {
      guide_id: jakeId,
      title: 'Coyote Gulch — 4-Day Canyon Country Backpack',
      slug: 'coyote-gulch-canyon-backpack',
      activity: 'canyoneering',
      difficulty: 'intermediate',
      description: `Coyote Gulch in Grand Staircase-Escalante is widely considered one of the finest backpacking routes in the American Southwest. Over four days, Jake guides you through a world of arches, amphitheater alcoves, hanging gardens, and slot canyon tributaries that feel like a lost civilization. You'll navigate the canyon bottom, scramble up slickrock benches, swim through narrows, and sleep under some of the darkest skies in the lower 48. This is desert canyon country at its absolute finest.`,
      highlights: [
        'Hike through one of the Southwest\'s most spectacular canyons',
        'Natural arches, alcoves, and Ancestral Puebloan ruins',
        'Slot canyon swimming in crystal clear pools',
        'Astrophotography under pristine dark skies',
        'Max 6 guests for a true wilderness feel',
      ],
      itinerary: [
        { day: 1, title: 'Trailhead to Sleepy Hollow', description: 'Enter via the Red Well trailhead and descend to Coyote Gulch. Camp near the confluence of Hurricane Wash, with time to explore alcoves.' },
        { day: 2, title: 'Jacob Hamblin Arch & Coyote Natural Bridge', description: 'Full canyon day hiking beneath towering sandstone walls. Visit two of the canyon\'s iconic arches. Camp at Crack in the Wall.' },
        { day: 3, title: 'Upper Gulch & Anasazi Sites', description: 'Explore tributary canyons and visit Ancestral Puebloan granaries tucked into cliff faces. Optional short rope work in a narrow side slot.' },
        { day: 4, title: 'Exit via Crack in the Wall', description: 'Pack up camp and hike out via the Crack in the Wall slot (squeeze through a 10-inch gap!). Shuttle back to Red Well trailhead.' },
      ],
      inclusions: ['Expert canyon guide', 'USGS maps and navigation', 'Group first aid kit', 'Water filtration system', 'Leave No Trace education'],
      exclusions: ['Camping gear (sleeping bag, tent, pad)', 'Food', 'Personal water bottles', 'Permits (Jake applies on your behalf)', 'Transportation to/from Grand Staircase'],
      gear_list: ['Lightweight hiking shoes or boots', 'Quick-dry shorts', 'Sun protection (shirt, hat, sunscreen)', 'Sandals for water crossings', 'Trekking poles optional', 'Headlamp', '3L water capacity'],
      meeting_point: 'Escalante, UT — Escalante Outfitters, 7:00 AM',
      duration_days: 4,
      price_per_person: 425,
      max_group_size: 6,
      country: 'United States',
      region: 'Utah',
      latitude: 37.5190,
      longitude: -111.5093,
      is_featured: true,
    },
    {
      guide_id: jakeId,
      title: 'Zion Narrows — Top-Down Guided Slot Canyon',
      slug: 'zion-narrows-top-down',
      activity: 'canyoneering',
      difficulty: 'intermediate',
      description: `The Zion Narrows top-down route is one of the most iconic slot canyon experiences in the world. Unlike the crowded bottom-up approach from the Temple of Sinawava, Jake takes you from the top — starting at Chamberlain's Ranch and spending two days wading, scrambling, and swimming through 16 miles of the Virgin River's deepest, most dramatic narrows. By Day 2 you emerge into the main Zion canyon from the "wrong" direction, high-fiving hikers going the other way who have no idea what you just did.`,
      highlights: [
        'Full top-down Narrows experience (16 miles)',
        'Sleep in the canyon on a sand beach',
        'Technical slot sections rarely seen by day hikers',
        'Expert guide with 200+ Narrows transits',
        'Mandatory wetsuit season gear included',
      ],
      itinerary: [
        { day: 1, title: 'Chamberlain\'s Ranch to Mystery Canyon', description: 'Shuttle from Springdale to the top. Begin hiking the Virgin River through wide open canyon. Camp on a sandy beach near the confluence with Mystery Canyon.' },
        { day: 2, title: 'The Deep Narrows to Temple of Sinawava', description: 'Enter the iconic slot section. Wade through chest-deep pools, squeeze through the Wall Street section, and emerge at Temple of Sinawava. Shuttle back.' },
      ],
      inclusions: ['NPS canyoneering permit', 'Dry suits/wetsuits (cold water months)', 'Dry bags', 'Trekking poles', 'River shoes', 'Sand beach camp gear'],
      exclusions: ['Zion National Park entry fee', 'Accommodation in Springdale', 'Food', 'Personal clothing'],
      gear_list: ['Wool or synthetic base layer', 'Athletic shorts', 'River sandals (Jake provides river shoes)', 'Headlamp', 'Dry bag for valuables', 'Small backpack'],
      meeting_point: 'Springdale, UT — Zion Rock & Mountain Guides, 6:00 AM',
      duration_days: 2,
      price_per_person: 350,
      max_group_size: 4,
      country: 'United States',
      region: 'Utah',
      latitude: 37.2988,
      longitude: -112.9481,
      is_featured: false,
    },
    {
      guide_id: jakeId,
      title: 'Desert Towers of Moab — Indian Creek Crack School',
      slug: 'indian-creek-crack-climbing-moab',
      activity: 'rock_climbing',
      difficulty: 'intermediate',
      description: `Indian Creek, just south of Canyonlands National Park, is the crack climbing mecca of the world. Perfectly parallel splitter cracks in Wingate sandstone rise 150 feet above the desert floor, offering the purest form of trad climbing available anywhere. Jake's 2-day crack school teaches you the art of hand jams, fist jams, finger locks, and foot placements on Indian Creek's forgiving warm-up cracks before progressing you to the classic moderate routes that have made this canyon famous. Perfect for sport climbers looking to break into trad.`,
      highlights: [
        'Learn crack climbing techniques from a seasoned desert guide',
        'Indian Creek — the world\'s premier crack climbing destination',
        'Progress from basics to leading 5.9-5.10 splitters',
        'Small group (max 3)',
        'Gear placements and anchor building included',
      ],
      itinerary: [
        { day: 1, title: 'Crack School 101', description: 'Start at the practice slabs near Supercrack Buttress. Hand jams, foot jams, body positioning. By afternoon, you\'re leading or seconding your first real crack.' },
        { day: 2, title: 'Supercrack Buttress & Optimator Wall', description: 'Hit the classics: Incredible Hand Crack, Supercrack of the Desert, Optimator. Progress as fitness and technique allow. Debrief over sunset back in Moab.' },
      ],
      inclusions: ['Expert rock guide', 'Full trad rack', 'Ropes', 'Helmet', 'Tape gloves for cracks', 'Route recommendations guide'],
      exclusions: ['Accommodation in Moab', 'Personal climbing gear (shoes, harness)', 'Food and water', 'Kane Creek Road access (high clearance recommended)'],
      gear_list: ['Rock shoes', 'Harness', 'Helmet (provided)', 'Sun protection', 'Lots of water', 'Tape (Jake brings extra)'],
      meeting_point: 'Moab, UT — The Moab Diner, 7:00 AM',
      duration_days: 2,
      price_per_person: 310,
      max_group_size: 3,
      country: 'United States',
      region: 'Utah',
      latitude: 38.1580,
      longitude: -109.7489,
      is_featured: false,
    },

    // ─── ELENA VASQUEZ (Ashford, WA) ───
    {
      guide_id: elenaId,
      title: 'Mount Rainier — Summit Climb via Disappointment Cleaver',
      slug: 'mt-rainier-summit-dc-route',
      activity: 'mountaineering',
      difficulty: 'advanced',
      description: `At 14,411 feet, Mount Rainier is the most glaciated peak in the contiguous United States and one of the world's great mountaineering objectives. Elena's 5-day guided ascent via the Disappointment Cleaver route prepares you thoroughly for summit day: glacier travel skills, crampon technique, rope team management, crevasse rescue, and high-altitude movement. Summit day involves a 9,000-foot elevation gain round trip from high camp at Ingraham Flats. Success rates with Elena's programs run above 78% — well above the national average.`,
      highlights: [
        '5 days with an IFMGA-certified guide',
        'Complete glacier travel and crevasse rescue training',
        'Small rope teams (3 clients per guide max)',
        'Highest peak in Washington State',
        'World-class mountaineering education',
      ],
      itinerary: [
        { day: 1, title: 'Gear & Permits Check — Paradise', description: 'Meet at Paradise visitor center. Gear inspection, ranger permit pickup, pack check. Introduction briefing at Paradise Inn.' },
        { day: 2, title: 'Camp Muir via Snowfields', description: 'Hike to Camp Muir at 10,188 ft via the Muir Snowfield. Afternoon rest and acclimatization.' },
        { day: 3, title: 'Glacier Travel School', description: 'Full day on the Cowlitz Glacier practicing crampon technique, ice axe self-arrest, rope team travel, and crevasse rescue protocol.' },
        { day: 4, title: 'Ingraham Flats High Camp', description: 'Move to Ingraham Flats (11,100 ft) via Cathedral Rocks. Scout the DC route. Early dinner and 8 PM bedtime for 1 AM summit start.' },
        { day: 5, title: 'Summit Day', description: '1:00 AM start. Rope up and cross the Ingraham Glacier. Ascend Disappointment Cleaver and the upper mountain. Summit by 8-9 AM, weather permitting. Descend to Paradise.' },
      ],
      inclusions: ['IFMGA guide (1:3 ratio)', 'NPS climbing permit ($62/person)', 'All technical climbing gear (crampons, ice axes, ropes)', 'Group shelter and cook kit at camp', 'Detailed gear list and briefing materials'],
      exclusions: ['Personal camping gear (sleeping bag, tent, pad)', 'Food and water', 'Transportation to Paradise', 'Park entry fee ($35/vehicle)'],
      gear_list: ['Double plastic mountaineering boots', 'Crampons (provided)', 'Ice axe (provided)', 'Hardshell jacket + pants', '3 layers including down jacket', 'Glacier glasses', 'Gaiters'],
      meeting_point: 'Paradise Visitor Center, Mount Rainier National Park, WA',
      duration_days: 5,
      price_per_person: 1495,
      max_group_size: 3,
      country: 'United States',
      region: 'Washington',
      latitude: 46.8523,
      longitude: -121.7603,
      is_featured: true,
    },
    {
      guide_id: elenaId,
      title: 'Mount Baker — North Ridge Alpine Route',
      slug: 'mt-baker-north-ridge-route',
      activity: 'alpine_climbing',
      difficulty: 'expert',
      description: `Mount Baker's North Ridge is the finest alpine route in Washington — a sustained 55-degree ice and mixed climb rising 4,500 feet from Heliotrope Ridge to the summit at 10,781 feet. This is serious mountaineering: heavily glaciated, prone to rockfall, and requiring proficiency in leading on steep ice. Elena caps groups at 2 for this route to maintain safety and quality. Expect world-class alpine scenery, complete solitude, and one of the proudest summit feelings you'll ever earn.`,
      highlights: [
        '55-degree ice climbing on a major Cascade peak',
        'Complete alpine solitude',
        'IFMGA guide — 1:2 ratio',
        'All technical gear provided',
        '2-day bivy on the mountain',
      ],
      itinerary: [
        { day: 1, title: 'Approach to Heliotrope Ridge', description: 'Drive to Heliotrope Ridge trailhead. Hike to basecamp at 6,000 ft on Coleman Glacier. Set up camp and scout the approach to the North Ridge.' },
        { day: 2, title: 'North Ridge Ascent', description: 'Early 2 AM start. Cross Coleman Glacier to the North Ridge base. Begin technical climbing — 4 rope lengths of 45-55° ice, mixed sections, and the final summit headwall. Bivy below the bergschrund.' },
        { day: 3, title: 'Final Pitches & Descent', description: 'Summit push from bivy. Final 2-3 pitches to the summit crater rim. Descend via the easier South Route or rappel the North Ridge (conditions-dependent). Drive home.' },
      ],
      inclusions: ['IFMGA guide', 'All technical gear (ice tools, crampons, ropes, screws)', 'Camp cooking gear', 'Emergency bivy equipment', 'Weather consultation and route conditions report'],
      exclusions: ['Personal mountaineering gear', 'Food', 'Transportation to Glacier, WA', 'Heliotrope Ridge campsite reservation'],
      gear_list: ['Double boots', 'Crampons with front points (provided)', 'Technical ice tools (provided)', 'Helmet', 'Harness', 'Alpine sleeping bag (0°F)', 'Bivy sack'],
      meeting_point: 'Glacier, WA — Elevation Grocery parking lot',
      duration_days: 3,
      price_per_person: 950,
      max_group_size: 2,
      country: 'United States',
      region: 'Washington',
      latitude: 48.7767,
      longitude: -121.8144,
      is_featured: false,
    },
    {
      guide_id: elenaId,
      title: 'Glacier Travel Basics — Intro Mountaineering Weekend',
      slug: 'glacier-travel-basics-rainier',
      activity: 'glacier_travel',
      difficulty: 'beginner',
      description: `New to mountaineering? This weekend course on the slopes of Mount Rainier is the perfect foundation. Elena teaches you glacier travel, crampon technique, ice axe self-arrest, rope team skills, and basic crevasse rescue in a safe, structured learning environment at 8,000-10,000 feet. By Sunday afternoon you'll have the core skills to attempt a Cascade volcano summit. Maximum 4 students per guide ensures you get personalized attention on every skill.`,
      highlights: [
        'IFMGA instructor — some of the best mountaineering education available',
        'Learn crampons, ice axe, rope teams, and crevasse rescue',
        'All technical gear provided',
        'Small class (4 students max)',
        'Foundation for Mount Rainier or other summit climbs',
      ],
      itinerary: [
        { day: 1, title: 'Paradise to Camp Muir', description: 'Hike to Camp Muir via the Muir Snowfield. Learn crampon fitting, ice axe carry positions, and basic movement on snow.' },
        { day: 2, title: 'Glacier School', description: 'Full day on the Cowlitz Glacier. Ice axe self-arrest, crampon technique, roped travel, crevasse rescue practice, and anchor building. Return to Paradise.' },
      ],
      inclusions: ['IFMGA instruction', 'Crampons, ice axe, harness, rope (all provided)', 'Camp Muir accommodation', 'NPS permit', 'Course certificate upon completion'],
      exclusions: ['Mount Rainier National Park entry', 'Food and water', 'Transportation to Paradise', 'Personal warm clothing'],
      gear_list: ['Waterproof hiking boots (plastic boots provided if needed)', 'Gaiters', 'Full hardshell layers', 'Warm gloves and hat', 'Sunglasses', 'SPF 50+ sunscreen'],
      meeting_point: 'Paradise Visitor Center, Mount Rainier National Park, WA',
      duration_days: 2,
      price_per_person: 375,
      max_group_size: 4,
      country: 'United States',
      region: 'Washington',
      latitude: 46.8523,
      longitude: -121.7603,
      is_featured: false,
    },

    // ─── FINN O'DRISCOLL (Ouray, CO) ───
    {
      guide_id: finnId,
      title: 'Ouray Ice Park — Learn to Ice Climb',
      slug: 'ouray-ice-park-intro',
      activity: 'ice_climbing',
      difficulty: 'beginner',
      description: `The Ouray Ice Park is the world's first man-made ice climbing park — a dramatic gorge with over 200 ice and mixed routes dropping from the canyon rim into the Uncompahgre River gorge. Finn's 2-day introduction is the perfect entry point into this exhilarating sport. You'll learn to swing ice tools, kick crampons into vertical ice, build ice anchors, and top-rope your first routes in one of the world's most accessible (yet spectacular) ice climbing venues. Suitable for anyone with reasonable fitness — no prior climbing experience needed.`,
      highlights: [
        'Learn ice climbing in the world\'s premier ice park',
        'AMGA-certified ice instructor with 14 years experience',
        'All gear provided — no equipment needed',
        'Top-rope safety throughout (no leading required)',
        'Evening apres options in charming Ouray town',
      ],
      itinerary: [
        { day: 1, title: 'Ice Fundamentals', description: 'Morning gear fitting and crampon/ice tool orientation. Afternoon in the park: footwork, tool placements, rest positions, and first top-rope climbs. Target WI2-3 routes.' },
        { day: 2, title: 'Building Confidence & WI3+', description: 'Progress to steeper terrain. Learn to build ice anchors (for future independent climbing). Work on efficiency and flow through more sustained sections. Group debrief over hot drinks.' },
      ],
      inclusions: ['AMGA instructor', 'Ice tools', 'Crampons', 'Helmet', 'Harness', 'Ropes and anchor gear', 'Ouray Ice Park access permit'],
      exclusions: ['Accommodation in Ouray', 'Food', 'Travel', 'Cold weather clothing (full gear list provided)'],
      gear_list: ['Thermal base layers', 'Fleece mid-layer', 'Waterproof hardshell jacket and pants', 'Waterproof gloves', 'Warm hat and neck gaiter', 'Waterproof boots (insulated, ankle support)'],
      meeting_point: 'Ouray, CO — Ouray Mountain Sports, 8:00 AM',
      duration_days: 2,
      price_per_person: 295,
      max_group_size: 4,
      country: 'United States',
      region: 'Colorado',
      latitude: 38.0228,
      longitude: -107.6714,
      is_featured: true,
    },
    {
      guide_id: finnId,
      title: 'Rigid Designator — Ouray Ice Festival Classic Route',
      slug: 'ouray-rigid-designator-wi5',
      activity: 'ice_climbing',
      difficulty: 'advanced',
      description: `Rigid Designator in the Uncompahgre Gorge is one of the most photographed ice routes in Colorado — a spectacular 4-pitch WI4-5 line that drapes 200 feet of blue ice over a series of steep pillars and curtains. Finn guides qualified ice climbers through a full day on this iconic route, combining technical lead climbing mentorship with his deep knowledge of ice conditions in Ouray. This is the guide-and-go experience for experienced ice climbers wanting to push their technical grade in a spectacular setting.`,
      highlights: [
        'Lead or follow on Ouray\'s most iconic ice route',
        'AMGA Guide mentorship on WI4-5 terrain',
        'Full day on route (4-5 pitches)',
        'Technical ice tool and crampon refinement',
        '1:1 or 1:2 ratio only',
      ],
      itinerary: [
        { day: 1, title: 'Full Day on Rigid Designator', description: 'Meet at the gorge at 8 AM. Assess conditions and complete warm-up pitch. Proceed through 3-4 pitches on Rigid Designator including the crux WI5 pillar. Rappel descent, debrief, and celebrations at Ouray Brewery.' },
      ],
      inclusions: ['AMGA guide', 'Ice screws and anchor gear', 'Ropes', 'Day trip itinerary', 'Route beta guide'],
      exclusions: ['Personal ice tools and crampons (rentals available at Ouray Mountain Sports)', 'Accommodation', 'Food', 'Ouray Ice Park permit ($15/day)'],
      gear_list: ['Technical ice tools', 'Crampons with front points', 'Helmet', 'Harness', 'Ice climbing-specific gloves', 'Full hardshell layers', 'Hand warmers'],
      meeting_point: 'Ouray, CO — Amphitheater Campground parking lot, 7:45 AM',
      duration_days: 1,
      price_per_person: 225,
      max_group_size: 2,
      country: 'United States',
      region: 'Colorado',
      latitude: 38.0228,
      longitude: -107.6714,
      is_featured: false,
    },
    {
      guide_id: finnId,
      title: 'Telluride Backcountry Ice — Remote San Juan Routes',
      slug: 'telluride-backcountry-ice-san-juans',
      activity: 'ice_climbing',
      difficulty: 'expert',
      description: `Away from the groomed walls of Ouray's ice park, the San Juan Mountains harbor dozens of natural ice routes that see only a handful of ascents each season. Finn takes a maximum of 2 climbers on a 3-day expedition into the remote San Juan backcountry to access routes like Bridal Veil Falls above Telluride (WI4+), Bear Creek Falls (WI4), and the rarely-visited Ingram Falls (WI5). Expect approach skiing or snowshoeing, wilderness camping, and climbing on wild, unmanicured natural ice. This trip is for experienced WI3+ leaders only.`,
      highlights: [
        'First ascents of the season on remote San Juan ice',
        'Complete wilderness ice climbing — no crowds, no park',
        'Ski approach to each route (AT skis included)',
        'Multi-route expedition format',
        'Finn\'s secret San Juan beta, hard-earned over 14 seasons',
      ],
      itinerary: [
        { day: 1, title: 'Drive to Telluride & Approach', description: 'Drive from Ouray to Telluride. Ski approach to basecamp near Bridal Veil Basin. Set up camp and scout Bridal Veil Falls condition.' },
        { day: 2, title: 'Bridal Veil & Bear Creek', description: 'Climb Bridal Veil Falls (WI4+, 4 pitches). If time permits, skin to Bear Creek Falls for an evening single-pitch. Camp under the stars.' },
        { day: 3, title: 'Ingram Falls (Conditions Permitting)', description: 'Ski to Ingram Falls. Attempt the WI5 crux column. Rappel descent and skin back to Telluride. Drive home to Ouray.' },
      ],
      inclusions: ['AMGA guide', 'AT ski rentals', 'Ice climbing hardware', 'Camp kitchen', 'Avalanche safety gear (beacon, probe, shovel)', 'AIARE avalanche guidance'],
      exclusions: ['Personal ski clothing', 'Personal ice tools and crampons (rentals $40/day)', 'Food', 'Accommodation (camping only)', 'Transportation to Telluride'],
      gear_list: ['AT ski boots', 'Technical ice tools', 'Crampons (full shank, front pointed)', 'Avalanche beacon (provided if needed)', 'Winter camping sleep system', 'Full alpine clothing system'],
      meeting_point: 'Ouray, CO — Finn\'s house. Address provided after booking',
      duration_days: 3,
      price_per_person: 750,
      max_group_size: 2,
      country: 'United States',
      region: 'Colorado',
      latitude: 37.9377,
      longitude: -107.8123,
      is_featured: false,
    },

    // ─── BROCK'S EXISTING GUIDE (Colorado) ───
    {
      guide_id: null, // will be replaced with Brock's guide ID
      title: 'Flatirons Via Ferrata — Boulder\'s Classic Iron Route',
      slug: 'flatirons-via-ferrata-boulder',
      activity: 'via_ferrata',
      difficulty: 'beginner',
      description: `The Flatirons above Boulder, Colorado are iconic — dramatic angled slabs of red sandstone rising 2,000 feet above the city. The Via Ferrata route (First Flatiron) uses fixed iron rungs, cables, and stemples to create a safe, thrilling climbing experience accessible to anyone with reasonable fitness. No prior climbing experience necessary. You'll clip into the fixed protection system, scramble up exposed slabs, and enjoy some of the most dramatic views of the Boulder Valley available on foot.`,
      highlights: [
        'Boulder\'s most spectacular peak via a protected iron route',
        'No prior climbing experience necessary',
        'Breathtaking views of Boulder and the Plains',
        'All gear provided',
        'Suitable for fit beginners and families',
      ],
      itinerary: [
        { day: 1, title: 'Via Ferrata Day Trip', description: 'Meet at the Chautauqua trailhead. Gear fitting (via ferrata lanyard, harness, helmet). 45-minute hike to the base of the First Flatiron. Ascend the via ferrata route to the summit. Descend via the standard trail. Total time: 5-6 hours.' },
      ],
      inclusions: ['Guide', 'Via ferrata lanyard', 'Harness', 'Helmet', 'Approach hike', 'Summit photos'],
      exclusions: ['Boulder Mountain Park parking', 'Food and water', 'Transportation to Boulder'],
      gear_list: ['Sturdy hiking shoes (trail runners minimum)', 'Comfortable athletic clothes', 'Water (2L)', 'Snacks', 'Sunscreen'],
      meeting_point: 'Chautauqua Trailhead, Boulder, CO — Parking lot kiosk',
      duration_days: 1,
      price_per_person: 149,
      max_group_size: 6,
      country: 'United States',
      region: 'Colorado',
      latitude: 39.9997,
      longitude: -105.2932,
      is_featured: false,
    },
  ];
}

// ─── MAIN SEEDING FUNCTION ──────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting Summit data seed...\n');

  // Check existing guides
  const { data: existingGuides } = await supabaseQuery('/guides?select=id,display_name,slug');
  console.log('📋 Existing guides:', existingGuides?.map(g => g.display_name).join(', ') || 'none');

  const existingGuide = existingGuides?.find(g => g.slug === 'brock' || g.display_name === 'Brock');
  console.log('🏔  Brock guide ID:', existingGuide?.id || 'not found');

  // Create new auth users and guide records
  const newGuideIds = [];

  for (const guideData of GUIDES) {
    const { email, password, full_name, display_name, tagline, bio, base_location,
      years_experience, rating, review_count, specialties, languages, certifications,
      slug, is_verified } = guideData;

    // Check if guide already exists
    const existing = existingGuides?.find(g => g.slug === slug);
    if (existing) {
      console.log(`⏭  Skipping ${display_name} (already exists: ${existing.id})`);
      newGuideIds.push(existing.id);
      continue;
    }

    console.log(`\n👤 Creating guide: ${display_name}...`);

    // Create auth user
    const authUser = await createAuthUser(email, password, { full_name, user_type: 'guide' });
    if (!authUser?.id) {
      console.error(`  ❌ Auth user creation failed:`, JSON.stringify(authUser).substring(0, 200));
      newGuideIds.push(null);
      continue;
    }
    console.log(`  ✅ Auth user: ${authUser.id}`);

    // Profile auto-created by trigger, but let's verify/update it
    await new Promise(r => setTimeout(r, 500));
    const { status: profileStatus } = await supabaseQuery(`/profiles?id=eq.${authUser.id}`, 'GET');
    
    // Create guide record
    const { data: guideRecord, status } = await supabaseQuery('/guides', 'POST', {
      user_id: authUser.id,
      slug,
      display_name,
      tagline,
      bio,
      base_location,
      years_experience,
      rating,
      review_count,
      specialties,
      languages,
      certifications,
      is_verified,
      is_active: true,
    });

    if (status !== 201 && status !== 200) {
      console.error(`  ❌ Guide creation failed (${status}):`, JSON.stringify(guideRecord).substring(0, 300));
      newGuideIds.push(null);
      continue;
    }

    const guideId = Array.isArray(guideRecord) ? guideRecord[0]?.id : guideRecord?.id;
    console.log(`  ✅ Guide created: ${guideId}`);
    newGuideIds.push(guideId);
  }

  console.log('\n📊 Guide IDs:', newGuideIds);

  // Map guide IDs: [marcusId, sierraId, jakeId, elenaId, finnId]
  const [marcusId, sierraId, jakeId, elenaId, finnId] = newGuideIds;
  const brockGuideId = existingGuide?.id;

  // Check existing trips
  const { data: existingTrips } = await supabaseQuery('/trips?select=slug');
  const existingSlugs = new Set(existingTrips?.map(t => t.slug) || []);
  console.log(`\n🗺  Existing trips: ${existingSlugs.size}`);

  // Build trips and replace null guide_id with Brock's
  const trips = buildTrips([marcusId, sierraId, jakeId, elenaId, finnId]);
  // Last trip (Flatirons) belongs to Brock
  trips[trips.length - 1].guide_id = brockGuideId;

  const createdTripIds = [];
  let tripsCreated = 0;
  let tripsSkipped = 0;

  for (const trip of trips) {
    if (!trip.guide_id) {
      console.log(`  ⏭  Skipping trip "${trip.title}" — no guide ID`);
      tripsSkipped++;
      continue;
    }

    if (existingSlugs.has(trip.slug)) {
      console.log(`  ⏭  Skipping "${trip.title}" (exists)`);
      // Get existing trip ID
      const { data: existing } = await supabaseQuery(`/trips?slug=eq.${trip.slug}&select=id`);
      if (existing?.[0]?.id) createdTripIds.push(existing[0].id);
      tripsSkipped++;
      continue;
    }

    const { data: created, status } = await supabaseQuery('/trips', 'POST', trip);
    if (status !== 201 && status !== 200) {
      console.error(`  ❌ Trip "${trip.title}" failed (${status}):`, JSON.stringify(created).substring(0, 300));
      tripsSkipped++;
      continue;
    }

    const tripId = Array.isArray(created) ? created[0]?.id : created?.id;
    console.log(`  ✅ Trip: "${trip.title}" → ${tripId}`);
    createdTripIds.push(tripId);
    tripsCreated++;
  }

  console.log(`\n📅 Adding availability dates for ${createdTripIds.length} trips...`);

  // Add trip dates for each trip
  const today = new Date();
  let datesCreated = 0;

  for (const tripId of createdTripIds) {
    if (!tripId) continue;

    // Check if dates exist
    const { data: existingDates } = await supabaseQuery(`/trip_dates?trip_id=eq.${tripId}&select=id&limit=1`);
    if (existingDates?.length > 0) continue;

    // Get trip duration
    const { data: tripData } = await supabaseQuery(`/trips?id=eq.${tripId}&select=duration_days,price_per_person`);
    const duration = tripData?.[0]?.duration_days || 2;

    // Create 6 upcoming date windows
    const dateWindows = [14, 28, 45, 62, 80, 100]; // days from today
    for (const daysOut of dateWindows) {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + daysOut);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration - 1);

      const { status } = await supabaseQuery('/trip_dates', 'POST', {
        trip_id: tripId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        spots_total: 6,
        spots_available: Math.floor(Math.random() * 4) + 2, // 2-5 spots
        is_available: true,
      });

      if (status === 201 || status === 200) datesCreated++;
    }
  }

  console.log(`\n🎉 SEEDING COMPLETE!`);
  console.log(`  Guides created: ${newGuideIds.filter(Boolean).length}`);
  console.log(`  Trips created: ${tripsCreated} (${tripsSkipped} skipped/existing)`);
  console.log(`  Dates created: ${datesCreated}`);

  // Final count
  const { data: finalTrips } = await supabaseQuery('/trips?select=id,title,activity&order=created_at.asc');
  const { data: finalGuides } = await supabaseQuery('/guides?select=id,display_name&is_active=eq.true');
  console.log(`\n📊 Database totals: ${finalGuides?.length} guides, ${finalTrips?.length} trips`);
  console.log('Guides:', finalGuides?.map(g => g.display_name).join(', '));
}

seed().catch(console.error);
