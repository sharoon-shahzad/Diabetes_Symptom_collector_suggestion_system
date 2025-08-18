import { User } from '../models/User.js';

// Track recent email sends to prevent duplicates within a short time window
const recentEmailSends = new Map();

export async function canSendOnboardingEmail(userId, email) {
    const key = `${userId}-${email}`;
    const now = Date.now();
    const lastSent = recentEmailSends.get(key);
    
    // Prevent sending multiple emails within 5 minutes
    if (lastSent && (now - lastSent) < 5 * 60 * 1000) {
        return false;
    }
    
    // Double-check database state
    const user = await User.findById(userId);
    if (!user || user.onboardingCompleted) {
        return false;
    }
    
    // Mark this email as recently sent
    recentEmailSends.set(key, now);
    
    // Clean up old entries (older than 10 minutes)
    for (const [oldKey, oldTime] of recentEmailSends.entries()) {
        if (now - oldTime > 10 * 60 * 1000) {
            recentEmailSends.delete(oldKey);
        }
    }
    
    return true;
} 