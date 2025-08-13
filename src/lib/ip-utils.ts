import { NextRequest } from 'next/server';

/**
 * Get client IPv4 address from request headers
 * Handles various proxy configurations and header formats
 * Only returns IPv4 addresses, filters out IPv6
 */
export function getClientIP(request: NextRequest): string {
  // Try different headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
      // Check all IPs in the list to find the first valid IPv4
      const ips = value.split(',').map((ip) => ip.trim());

      for (const ip of ips) {
        // Only accept IPv4 addresses
        if (isValidIPv4(ip) && !isPrivateIP(ip)) {
          return ip;
        }
      }

      // If no public IPv4 found, try private IPv4s
      for (const ip of ips) {
        if (isValidIPv4(ip)) {
          return ip;
        }
      }
    }
  }

  // Fallback to connection remote address
  const remoteAddress =
    request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || '127.0.0.1';

  const fallbackIPs = remoteAddress.split(',').map((ip) => ip.trim());

  // Try to find IPv4 in fallback
  for (const ip of fallbackIPs) {
    if (isValidIPv4(ip)) {
      return ip;
    }
  }

  return '127.0.0.1'; // Ultimate fallback
}

/**
 * Validate IPv4 address format only
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  return ipv4Regex.test(ip);
}

/**
 * Validate IP address format (IPv4 and IPv6) - kept for compatibility
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Get geographical info from IP (optional - requires external service)
 * This is a placeholder for IP geolocation services
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getIPGeolocation(_ip: string): Promise<{
  country?: string;
  city?: string;
  region?: string;
}> {
  // Placeholder - you can integrate with services like:
  // - ipapi.co
  // - ipgeolocation.io
  // - MaxMind GeoIP

  return Promise.resolve({
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
  });
}

/**
 * Check if IPv4 address is from a local/private network
 */
export function isPrivateIP(ip: string): boolean {
  // Only check IPv4 private ranges
  if (!isValidIPv4(ip)) {
    return false; // Not IPv4, not private
  }

  const privateRanges = [
    /^127\./, // 127.0.0.0/8 (localhost)
    /^192\.168\./, // 192.168.0.0/16 (private)
    /^10\./, // 10.0.0.0/8 (private)
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12 (private)
    /^169\.254\./, // 169.254.0.0/16 (link-local)
  ];

  return privateRanges.some((range) => range.test(ip));
}

/**
 * Export IPv4 validation function for external use (alias)
 */
export const isValidIPv4Address = isValidIPv4;
