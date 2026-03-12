/**
 * Shopify Admin API Helper
 * Handles GraphQL calls with rate limiting and error handling
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2024-10';
const ENDPOINT = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

let availableCost = 2000;

async function graphql(query, variables = {}) {
  // Simple rate limiting - wait if low on cost
  if (availableCost < 100) {
    console.log('  [rate-limit] Waiting 2s for cost restore...');
    await new Promise(r => setTimeout(r, 2000));
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.extensions?.cost?.throttleStatus) {
    availableCost = json.extensions.cost.throttleStatus.currentlyAvailable;
  }

  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
  }

  return json;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = { graphql, sleep, STORE };
