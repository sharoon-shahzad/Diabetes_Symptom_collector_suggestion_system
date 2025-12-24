/**
 * Mobile App Configuration
 * 
 * IMPORTANT: Update BACKEND_IP with your computer's local IP address
 * To find your IP:
 * - Windows: Run "ipconfig" in Command Prompt, look for "IPv4 Address"
 * - Mac/Linux: Run "ifconfig" or "ip addr"
 * 
 * Make sure both your computer and phone are on the same WiFi network!
 */

// Set this to your computer's local IP address
export const BACKEND_IP = '192.168.1.22';

// Backend port (usually 5000)
export const BACKEND_PORT = 5000;

// Automatically constructed API URL
export const API_URL = `http://${BACKEND_IP}:${BACKEND_PORT}/api/v1`;

// Enable auto-discovery as fallback (if manual IP doesn't work)
export const ENABLE_AUTO_DISCOVERY = true;

// Discovery timeout (in milliseconds)
export const DISCOVERY_TIMEOUT = 3000;

export default {
  BACKEND_IP,
  BACKEND_PORT,
  API_URL,
  ENABLE_AUTO_DISCOVERY,
  DISCOVERY_TIMEOUT,
};
