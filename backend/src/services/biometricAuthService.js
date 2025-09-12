const crypto = require('crypto');
const { query } = require('../config/database');
const { redisGet, redisSet, redisDel } = require('../config/redis');

class BiometricAuthService {
  constructor() {
    this.encryptionKey = process.env.BIOMETRIC_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.tokenExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate a secure biometric token for the device
  async generateBiometricToken(userId, deviceId, biometricType = 'touchid') {
    try {
      const tokenData = {
        userId,
        deviceId,
        biometricType,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.tokenExpiry
      };

      // Encrypt the token data
      const encryptedToken = this.encryptData(JSON.stringify(tokenData));
      
      // Store in database
      await query(`
        INSERT INTO biometric_tokens (user_id, device_id, encrypted_token, biometric_type, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, device_id) 
        DO UPDATE SET 
          encrypted_token = $3,
          biometric_type = $4,
          expires_at = $5,
          updated_at = NOW()
      `, [
        userId,
        deviceId,
        encryptedToken,
        biometricType,
        new Date(tokenData.expiresAt)
      ]);

      // Cache for quick access
      await redisSet(`biometric:${userId}:${deviceId}`, encryptedToken, this.tokenExpiry / 1000);

      return {
        success: true,
        token: encryptedToken,
        expiresAt: tokenData.expiresAt
      };

    } catch (error) {
      console.error('Error generating biometric token:', error);
      return { success: false, error: 'Failed to generate biometric token' };
    }
  }

  // Validate biometric token
  async validateBiometricToken(token, deviceId) {
    try {
      // Decrypt token
      const decryptedData = this.decryptData(token);
      const tokenData = JSON.parse(decryptedData);

      // Check expiry
      if (Date.now() > tokenData.expiresAt) {
        await this.revokeBiometricToken(tokenData.userId, deviceId);
        return { valid: false, error: 'Token expired' };
      }

      // Verify device ID matches
      if (tokenData.deviceId !== deviceId) {
        return { valid: false, error: 'Device mismatch' };
      }

      // Check if token exists in database
      const dbResult = await query(`
        SELECT user_id, biometric_type, is_active 
        FROM biometric_tokens 
        WHERE user_id = $1 AND device_id = $2 AND encrypted_token = $3
      `, [tokenData.userId, deviceId, token]);

      if (dbResult.rows.length === 0 || !dbResult.rows[0].is_active) {
        return { valid: false, error: 'Token not found or inactive' };
      }

      // Update last used timestamp
      await query(`
        UPDATE biometric_tokens 
        SET last_used_at = NOW() 
        WHERE user_id = $1 AND device_id = $2
      `, [tokenData.userId, deviceId]);

      return {
        valid: true,
        userId: tokenData.userId,
        biometricType: tokenData.biometricType,
        deviceId: tokenData.deviceId
      };

    } catch (error) {
      console.error('Error validating biometric token:', error);
      return { valid: false, error: 'Invalid token format' };
    }
  }

  // Revoke biometric token
  async revokeBiometricToken(userId, deviceId = null) {
    try {
      if (deviceId) {
        // Revoke specific device
        await query(`
          UPDATE biometric_tokens 
          SET is_active = false, revoked_at = NOW() 
          WHERE user_id = $1 AND device_id = $2
        `, [userId, deviceId]);

        await redisDel(`biometric:${userId}:${deviceId}`);
      } else {
        // Revoke all devices for user
        const devices = await query(`
          SELECT device_id FROM biometric_tokens 
          WHERE user_id = $1 AND is_active = true
        `, [userId]);

        await query(`
          UPDATE biometric_tokens 
          SET is_active = false, revoked_at = NOW() 
          WHERE user_id = $1
        `, [userId]);

        // Clear cache for all devices
        for (const device of devices.rows) {
          await redisDel(`biometric:${userId}:${device.device_id}`);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error revoking biometric token:', error);
      return { success: false, error: 'Failed to revoke token' };
    }
  }

  // Get user's biometric devices
  async getUserBiometricDevices(userId) {
    try {
      const result = await query(`
        SELECT 
          device_id,
          biometric_type,
          created_at,
          last_used_at,
          expires_at,
          is_active
        FROM biometric_tokens 
        WHERE user_id = $1
        ORDER BY last_used_at DESC NULLS LAST, created_at DESC
      `, [userId]);

      return result.rows.map(row => ({
        deviceId: row.device_id,
        biometricType: row.biometric_type,
        createdAt: row.created_at,
        lastUsedAt: row.last_used_at,
        expiresAt: row.expires_at,
        isActive: row.is_active,
        isExpired: new Date() > new Date(row.expires_at)
      }));
    } catch (error) {
      console.error('Error getting user biometric devices:', error);
      return [];
    }
  }

  // Generate secure challenge for biometric authentication
  generateBiometricChallenge(userId, deviceId) {
    const challenge = {
      userId,
      deviceId,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };

    const challengeToken = this.encryptData(JSON.stringify(challenge));
    
    // Cache challenge for validation
    redisSet(`challenge:${userId}:${deviceId}`, challengeToken, 300); // 5 minutes

    return {
      challenge: challengeToken,
      nonce: challenge.nonce,
      expiresAt: challenge.expiresAt
    };
  }

  // Validate biometric challenge response
  async validateBiometricChallenge(challengeToken, responseSignature, userId, deviceId) {
    try {
      // Get cached challenge
      const cachedChallenge = await redisGet(`challenge:${userId}:${deviceId}`);
      
      if (!cachedChallenge || cachedChallenge !== challengeToken) {
        return { valid: false, error: 'Challenge not found or expired' };
      }

      // Decrypt and validate challenge
      const decryptedChallenge = this.decryptData(challengeToken);
      const challenge = JSON.parse(decryptedChallenge);

      if (Date.now() > challenge.expiresAt) {
        await redisDel(`challenge:${userId}:${deviceId}`);
        return { valid: false, error: 'Challenge expired' };
      }

      // Validate signature (this would be device-specific implementation)
      const isValidSignature = this.validateSignature(
        challenge.nonce, 
        responseSignature, 
        userId, 
        deviceId
      );

      if (!isValidSignature) {
        return { valid: false, error: 'Invalid biometric signature' };
      }

      // Clean up challenge
      await redisDel(`challenge:${userId}:${deviceId}`);

      return { valid: true, userId, deviceId };

    } catch (error) {
      console.error('Error validating biometric challenge:', error);
      return { valid: false, error: 'Challenge validation failed' };
    }
  }

  // Validate signature (placeholder for actual biometric validation)
  validateSignature(nonce, signature, userId, deviceId) {
    // In a real implementation, this would:
    // 1. Use the device's public key to verify the signature
    // 2. Ensure the signature was created using biometric authentication
    // 3. Validate the nonce was signed correctly
    
    // For now, we'll do a basic validation
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.encryptionKey)
        .update(`${nonce}:${userId}:${deviceId}`)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      return false;
    }
  }

  // Encrypt sensitive data
  encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  // Decrypt sensitive data
  decryptData(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Clean up expired tokens
  async cleanupExpiredTokens() {
    try {
      const result = await query(`
        UPDATE biometric_tokens 
        SET is_active = false, revoked_at = NOW() 
        WHERE expires_at < NOW() AND is_active = true
      `);

      console.log(`🧹 Cleaned up ${result.rowCount} expired biometric tokens`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  // Get biometric authentication statistics
  async getBiometricStats(timeframe = '30 days') {
    try {
      const result = await query(`
        SELECT 
          biometric_type,
          COUNT(*) as total_tokens,
          COUNT(*) FILTER (WHERE is_active = true) as active_tokens,
          COUNT(*) FILTER (WHERE last_used_at >= NOW() - INTERVAL $1) as recently_used,
          AVG(EXTRACT(EPOCH FROM (last_used_at - created_at))) as avg_usage_duration
        FROM biometric_tokens 
        WHERE created_at >= NOW() - INTERVAL $1
        GROUP BY biometric_type
        ORDER BY total_tokens DESC
      `, [timeframe]);

      return result.rows.map(row => ({
        biometricType: row.biometric_type,
        totalTokens: parseInt(row.total_tokens),
        activeTokens: parseInt(row.active_tokens),
        recentlyUsed: parseInt(row.recently_used),
        avgUsageDuration: parseFloat(row.avg_usage_duration) || 0
      }));
    } catch (error) {
      console.error('Error getting biometric stats:', error);
      return [];
    }
  }

  // Security audit log
  async logBiometricEvent(userId, deviceId, eventType, metadata = {}) {
    try {
      await query(`
        INSERT INTO biometric_audit_log (user_id, device_id, event_type, metadata, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId,
        deviceId,
        eventType,
        JSON.stringify(metadata),
        metadata.ipAddress || null,
        metadata.userAgent || null
      ]);
    } catch (error) {
      console.error('Error logging biometric event:', error);
    }
  }

  // Check if biometric authentication is available for user
  async isBiometricAvailable(userId, deviceId) {
    try {
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM biometric_tokens 
        WHERE user_id = $1 AND device_id = $2 AND is_active = true AND expires_at > NOW()
      `, [userId, deviceId]);

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }
}

module.exports = new BiometricAuthService(); 