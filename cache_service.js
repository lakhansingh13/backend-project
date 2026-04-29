require('dotenv').config();

const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

// SECTION 2: getActivities (Cache-Aside)
async function getActivities() {
  const cacheKey = 'popular_activities';

  // 1. Check cache
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    console.log('Cache Hit! Returning data from Redis...');
    return JSON.parse(cachedData);
  }

  // 2. Cache Miss
  console.log('Cache Miss. Fetching from Database...');

  const dbData = [
    { id: 1, name: 'Mountain Hiking' },
    { id: 2, name: 'Tech Networking' }
  ];

  // 3. Save to Redis with TTL
  await client.setEx(cacheKey, 60, JSON.stringify(dbData));

  return dbData;
}

// SECTION 3: Manual Invalidation
async function updateActivity(id, newName) {
  console.log(`Updated activity ${id} to ${newName}`);

  await client.del('popular_activities');

  console.log('Cache invalidated for popular_activities');
}

// SECTION 4: Experiment
async function runTest() {
  await client.connect();

  console.log("\n--- FIRST RUN ---");
  const first = await getActivities();
  console.log("Data:", first);

  console.log("\n--- SECOND RUN ---");
  const second = await getActivities();
  console.log("Data:", second);

  console.log("\n--- UPDATE + INVALIDATE ---");
  await updateActivity(1, "Updated Activity");

  console.log("\n--- AFTER INVALIDATION ---");
  const third = await getActivities();
  console.log("Data:", third);

  process.exit();
}

runTest();