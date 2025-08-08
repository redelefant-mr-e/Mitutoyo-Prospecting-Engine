#!/usr/bin/env node

const https = require('https');
const http = require('http');

const GITHUB_PAGES_URL = 'https://redelefant-mr-e.github.io/Mitutoyo-Prospecting-Engine/';
const DATA_FILES = [
  'data/All%20Companies.csv',
  'data/All%20Companies%20Denmark.csv',
  'data/Companies%20-%20Medium,%20High,%20or%20Perfect%20Match.csv',
  'data/Enrich%20Contact%20Data%20-%20Medium,%20High,%20or%20Perfect%20Match.csv',
  'data/Enrich%20Contact%20Data%20Denmark%20-%20Medium,%20High,%20or%20Perfect%20Match.csv'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 300
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        ok: false,
        error: err.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        ok: false,
        error: 'Request timeout'
      });
    });
  });
}

async function checkDeployment() {
  console.log('🔍 Checking GitHub Pages deployment...\n');
  
  // Check main page
  const mainPage = await checkUrl(GITHUB_PAGES_URL);
  console.log(`📄 Main page: ${mainPage.ok ? '✅' : '❌'} ${mainPage.status} ${mainPage.url}`);
  
  if (!mainPage.ok) {
    console.log(`   Error: ${mainPage.error || 'Unknown error'}`);
  }
  
  console.log('\n📊 Checking data files...');
  
  // Check data files
  const dataFileChecks = await Promise.all(
    DATA_FILES.map(file => checkUrl(GITHUB_PAGES_URL + file))
  );
  
  dataFileChecks.forEach(check => {
    console.log(`   ${check.ok ? '✅' : '❌'} ${check.status} ${check.url.split('/').pop()}`);
    if (!check.ok) {
      console.log(`      Error: ${check.error || 'Unknown error'}`);
    }
  });
  
  const allFilesOk = dataFileChecks.every(check => check.ok);
  const mainPageOk = mainPage.ok;
  
  console.log('\n📋 Summary:');
  console.log(`   Main page: ${mainPageOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Data files: ${allFilesOk ? '✅ All working' : '❌ Some failed'}`);
  
  if (mainPageOk && allFilesOk) {
    console.log('\n🎉 Deployment is working correctly!');
    console.log(`   Visit: ${GITHUB_PAGES_URL}`);
  } else {
    console.log('\n⚠️  Deployment has issues. Check GitHub Actions for build status.');
  }
}

checkDeployment().catch(console.error);
