import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const IP_STORAGE_KEY = '@backend_ip';
const IP_EXPIRY_KEY = '@backend_ip_expiry';
const IP_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Common local IP address ranges
 * We'll scan the most common private network ranges
 */
const COMMON_IP_RANGES = [
  '192.168.1.',
  '192.168.0.',
  '192.168.2.',
  '192.168.100.',
  '192.168.43.',
  '10.0.0.',
  '172.16.0.',
  '172.20.10.',
];

/**
 * Get the cached backend IP if still valid
 */
export async function getCachedIP() {
  try {
    const cachedIP = await AsyncStorage.getItem(IP_STORAGE_KEY);
    const expiry = await AsyncStorage.getItem(IP_EXPIRY_KEY);
    
    if (cachedIP && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        console.log('📦 Using cached IP:', cachedIP);
        return cachedIP;
      }
    }
  } catch (error) {
    console.log('⚠️ Could not read cached IP:', error.message);
  }
  return null;
}

/**
 * Save discovered IP to cache
 */
async function cacheIP(ip) {
  try {
    await AsyncStorage.setItem(IP_STORAGE_KEY, ip);
    await AsyncStorage.setItem(IP_EXPIRY_KEY, (Date.now() + IP_CACHE_DURATION).toString());
    console.log('💾 Cached IP:', ip);
  } catch (error) {
    console.log('⚠️ Could not cache IP:', error.message);
  }
}

/**
 * Test if a specific IP:port combination is reachable
 */
async function testIP(ip, port = 5000, timeout = 2000) {
  try {
    const url = `http://${ip}:${port}/api/v1/server-info`;
    const response = await axios.get(url, { timeout });
    
    if (response.data && response.data.success) {
      console.log(`✅ Found server at ${ip}:${port}`);
      return true;
    }
  } catch (error) {
    // Silently fail for each test
  }
  return false;
}

/**
 * Scan a range of IPs to find the backend server
 */
async function scanIPRange(baseIP, port = 5000) {
  console.log(`🔍 Scanning range: ${baseIP}x`);
  
  // Test common IPs first (1, 2, 5, 10, 100)
  const priorityIPs = [1, 2, 5, 10, 100];
  for (const lastOctet of priorityIPs) {
    const ip = `${baseIP}${lastOctet}`;
    if (await testIP(ip, port)) {
      return ip;
    }
  }
  
  // Then scan remaining range (1-254)
  for (let i = 1; i <= 254; i++) {
    if (priorityIPs.includes(i)) continue; // Skip already tested
    
    const ip = `${baseIP}${i}`;
    if (await testIP(ip, port)) {
      return ip;
    }
  }
  
  return null;
}

/**
 * Discover the backend server IP automatically
 */
export async function discoverBackendIP(port = 5000) {
  console.log('🔍 Starting IP discovery...');
  
  // First, check cache
  const cachedIP = await getCachedIP();
  if (cachedIP) {
    // Verify cached IP is still valid
    if (await testIP(cachedIP, port)) {
      return `http://${cachedIP}:${port}/api/v1`;
    } else {
      console.log('⚠️ Cached IP is no longer valid');
    }
  }
  
  // Scan common IP ranges
  for (const baseIP of COMMON_IP_RANGES) {
    console.log(`🔍 Checking range: ${baseIP}x`);
    const foundIP = await scanIPRange(baseIP, port);
    if (foundIP) {
      await cacheIP(foundIP);
      return `http://${foundIP}:${port}/api/v1`;
    }
  }
  
  console.log('❌ Could not discover backend server');
  return null;
}

/**
 * Quick discovery using only cached IP or common IPs with parallel scanning
 */
export async function quickDiscoverBackendIP(port = 5000) {
  console.log('⚡ Quick IP discovery...');
  
  // Check cache first
  const cachedIP = await getCachedIP();
  if (cachedIP && await testIP(cachedIP, port)) {
    console.log('✅ Using cached IP:', cachedIP);
    return `http://${cachedIP}:${port}/api/v1`;
  }
  
  // Test most common IPs in parallel for speed
  const commonIPs = [
    '192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5',
    '192.168.1.10', '192.168.1.100', '192.168.1.254',
    '192.168.0.1', '192.168.0.2', '192.168.0.5', '192.168.0.10',
    '10.0.0.1', '10.0.0.2', '10.0.0.100',
    '172.20.10.1', '172.20.10.2',
  ];
  
  // Test in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < commonIPs.length; i += batchSize) {
    const batch = commonIPs.slice(i, i + batchSize);
    const promises = batch.map(ip => testIP(ip, port, 1500));
    const results = await Promise.all(promises);
    
    for (let j = 0; j < results.length; j++) {
      if (results[j]) {
        const foundIP = batch[j];
        await cacheIP(foundIP);
        return `http://${foundIP}:${port}/api/v1`;
      }
    }
  }
  
  return null;
}

/**
 * Clear cached IP (useful for troubleshooting)
 */
export async function clearIPCache() {
  try {
    await AsyncStorage.removeItem(IP_STORAGE_KEY);
    await AsyncStorage.removeItem(IP_EXPIRY_KEY);
    console.log('🗑️ IP cache cleared');
  } catch (error) {
    console.log('⚠️ Could not clear IP cache:', error.message);
  }
}

/**
 * Get backend URL - NO FALLBACK, must discover
 */
export async function getBackendURL(useFullScan = true) {
  try {
    console.log('🔍 Starting backend discovery...');
    
    // Try quick discovery first
    let url = await quickDiscoverBackendIP();
    
    // If quick discovery fails, do full scan
    if (!url && useFullScan) {
      console.log('⚠️ Quick discovery failed, starting full scan...');
      url = await discoverBackendIP();
    }
    
    if (!url) {
      throw new Error(
        'Cannot find backend server. Please ensure:\n' +
        '1. Backend server is running\n' +
        '2. Both devices are on the same WiFi network\n' +
        '3. Firewall is not blocking port 5000'
      );
    }
    
    console.log('✅ Backend discovered:', url);
    return url;
  } catch (error) {
    console.error('❌ Backend discovery failed:', error.message);
    throw error;
  }
}
