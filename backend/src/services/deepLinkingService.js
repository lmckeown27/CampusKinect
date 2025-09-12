const { query } = require('../config/database');
const { redisGet, redisSet } = require('../config/redis');
const crypto = require('crypto');

class DeepLinkingService {
  constructor() {
    this.baseUrl = process.env.DEEP_LINK_BASE_URL || 'https://campuskinect.net';
    this.customScheme = process.env.CUSTOM_URL_SCHEME || 'campuskinect';
    this.linkExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Generate deep link for post
  async generatePostLink(postId, userId = null, trackingData = {}) {
    try {
      const linkId = this.generateLinkId();
      const linkData = {
        type: 'post',
        postId,
        userId,
        trackingData,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.linkExpiry
      };

      // Store link data
      await this.storeLinkData(linkId, linkData);

      const universalLink = `${this.baseUrl}/app/post/${postId}?link=${linkId}`;
      const customSchemeLink = `${this.customScheme}://post/${postId}?link=${linkId}`;

      return {
        success: true,
        linkId,
        universalLink,
        customSchemeLink,
        expiresAt: linkData.expiresAt
      };

    } catch (error) {
      console.error('Error generating post link:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate deep link for user profile
  async generateUserProfileLink(targetUserId, userId = null, trackingData = {}) {
    try {
      const linkId = this.generateLinkId();
      const linkData = {
        type: 'user_profile',
        targetUserId,
        userId,
        trackingData,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.linkExpiry
      };

      await this.storeLinkData(linkId, linkData);

      const universalLink = `${this.baseUrl}/app/user/${targetUserId}?link=${linkId}`;
      const customSchemeLink = `${this.customScheme}://user/${targetUserId}?link=${linkId}`;

      return {
        success: true,
        linkId,
        universalLink,
        customSchemeLink,
        expiresAt: linkData.expiresAt
      };

    } catch (error) {
      console.error('Error generating user profile link:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate deep link for conversation
  async generateConversationLink(conversationId, userId = null, trackingData = {}) {
    try {
      // Verify user has access to conversation
      if (userId) {
        const hasAccess = await this.verifyConversationAccess(conversationId, userId);
        if (!hasAccess) {
          return { success: false, error: 'Access denied to conversation' };
        }
      }

      const linkId = this.generateLinkId();
      const linkData = {
        type: 'conversation',
        conversationId,
        userId,
        trackingData,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.linkExpiry
      };

      await this.storeLinkData(linkId, linkData);

      const universalLink = `${this.baseUrl}/app/chat/${conversationId}?link=${linkId}`;
      const customSchemeLink = `${this.customScheme}://chat/${conversationId}?link=${linkId}`;

      return {
        success: true,
        linkId,
        universalLink,
        customSchemeLink,
        expiresAt: linkData.expiresAt
      };

    } catch (error) {
      console.error('Error generating conversation link:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate invitation link
  async generateInvitationLink(inviterId, inviteType = 'general', metadata = {}) {
    try {
      const linkId = this.generateLinkId();
      const linkData = {
        type: 'invitation',
        inviterId,
        inviteType,
        metadata,
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days for invitations
      };

      await this.storeLinkData(linkId, linkData);

      const universalLink = `${this.baseUrl}/app/invite/${linkId}`;
      const customSchemeLink = `${this.customScheme}://invite/${linkId}`;

      return {
        success: true,
        linkId,
        universalLink,
        customSchemeLink,
        expiresAt: linkData.expiresAt
      };

    } catch (error) {
      console.error('Error generating invitation link:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate share link for post
  async generateShareLink(postId, sharerId, shareType = 'general') {
    try {
      const linkId = this.generateLinkId();
      const linkData = {
        type: 'share',
        postId,
        sharerId,
        shareType,
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days for shares
      };

      await this.storeLinkData(linkId, linkData);

      // Track share action
      await this.trackShareAction(postId, sharerId, shareType);

      const universalLink = `${this.baseUrl}/app/shared/${linkId}`;
      const customSchemeLink = `${this.customScheme}://shared/${linkId}`;

      return {
        success: true,
        linkId,
        universalLink,
        customSchemeLink,
        expiresAt: linkData.expiresAt
      };

    } catch (error) {
      console.error('Error generating share link:', error);
      return { success: false, error: error.message };
    }
  }

  // Resolve deep link
  async resolveDeepLink(linkId, userId = null, deviceInfo = {}) {
    try {
      const linkData = await this.getLinkData(linkId);
      
      if (!linkData) {
        return { success: false, error: 'Link not found or expired' };
      }

      // Check expiry
      if (Date.now() > linkData.expiresAt) {
        await this.deleteLinkData(linkId);
        return { success: false, error: 'Link has expired' };
      }

      // Track link click
      await this.trackLinkClick(linkId, userId, deviceInfo);

      // Resolve based on link type
      const resolution = await this.resolveLinkByType(linkData, userId);

      return {
        success: true,
        linkData,
        resolution
      };

    } catch (error) {
      console.error('Error resolving deep link:', error);
      return { success: false, error: error.message };
    }
  }

  // Resolve link based on type
  async resolveLinkByType(linkData, userId) {
    switch (linkData.type) {
      case 'post':
        return await this.resolvePostLink(linkData, userId);
      
      case 'user_profile':
        return await this.resolveUserProfileLink(linkData, userId);
      
      case 'conversation':
        return await this.resolveConversationLink(linkData, userId);
      
      case 'invitation':
        return await this.resolveInvitationLink(linkData, userId);
      
      case 'share':
        return await this.resolveShareLink(linkData, userId);
      
      default:
        throw new Error(`Unknown link type: ${linkData.type}`);
    }
  }

  // Resolve post link
  async resolvePostLink(linkData, userId) {
    try {
      // Get post data
      const postResult = await query(`
        SELECT 
          p.id, p.content, p.location, p.created_at, p.is_active,
          u.first_name, u.last_name, u.username, u.profile_picture,
          univ.name as university_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN universities univ ON u.university_id = univ.id
        WHERE p.id = $1
      `, [linkData.postId]);

      if (postResult.rows.length === 0) {
        return { 
          action: 'error', 
          error: 'Post not found',
          fallback: { screen: 'home' }
        };
      }

      const post = postResult.rows[0];

      if (!post.is_active) {
        return { 
          action: 'error', 
          error: 'Post is no longer available',
          fallback: { screen: 'home' }
        };
      }

      return {
        action: 'navigate',
        screen: 'post_detail',
        params: {
          postId: linkData.postId,
          post: post
        },
        metadata: linkData.trackingData
      };

    } catch (error) {
      return { 
        action: 'error', 
        error: error.message,
        fallback: { screen: 'home' }
      };
    }
  }

  // Resolve user profile link
  async resolveUserProfileLink(linkData, userId) {
    try {
      const userResult = await query(`
        SELECT 
          u.id, u.first_name, u.last_name, u.username, u.profile_picture,
          u.year, u.major, u.hometown, u.bio, u.is_active,
          univ.name as university_name
        FROM users u
        LEFT JOIN universities univ ON u.university_id = univ.id
        WHERE u.id = $1
      `, [linkData.targetUserId]);

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return { 
          action: 'error', 
          error: 'User not found',
          fallback: { screen: 'home' }
        };
      }

      return {
        action: 'navigate',
        screen: 'user_profile',
        params: {
          userId: linkData.targetUserId,
          user: userResult.rows[0]
        },
        metadata: linkData.trackingData
      };

    } catch (error) {
      return { 
        action: 'error', 
        error: error.message,
        fallback: { screen: 'home' }
      };
    }
  }

  // Resolve conversation link
  async resolveConversationLink(linkData, userId) {
    try {
      if (!userId) {
        return {
          action: 'authenticate',
          redirectAfterAuth: {
            screen: 'conversation',
            params: { conversationId: linkData.conversationId }
          }
        };
      }

      // Verify access
      const hasAccess = await this.verifyConversationAccess(linkData.conversationId, userId);
      if (!hasAccess) {
        return { 
          action: 'error', 
          error: 'Access denied to conversation',
          fallback: { screen: 'messages' }
        };
      }

      return {
        action: 'navigate',
        screen: 'conversation',
        params: {
          conversationId: linkData.conversationId
        },
        metadata: linkData.trackingData
      };

    } catch (error) {
      return { 
        action: 'error', 
        error: error.message,
        fallback: { screen: 'messages' }
      };
    }
  }

  // Resolve invitation link
  async resolveInvitationLink(linkData, userId) {
    try {
      // Get inviter info
      const inviterResult = await query(`
        SELECT first_name, last_name, username, profile_picture
        FROM users WHERE id = $1
      `, [linkData.inviterId]);

      if (inviterResult.rows.length === 0) {
        return { 
          action: 'error', 
          error: 'Invitation is no longer valid',
          fallback: { screen: 'home' }
        };
      }

      if (!userId) {
        return {
          action: 'authenticate',
          message: `${inviterResult.rows[0].first_name} invited you to join CampusKinect!`,
          redirectAfterAuth: { screen: 'home' }
        };
      }

      // Process invitation (could track referrals, etc.)
      await this.processInvitation(linkData, userId);

      return {
        action: 'navigate',
        screen: 'home',
        message: `Welcome! You joined through ${inviterResult.rows[0].first_name}'s invitation.`,
        metadata: linkData.metadata
      };

    } catch (error) {
      return { 
        action: 'error', 
        error: error.message,
        fallback: { screen: 'home' }
      };
    }
  }

  // Resolve share link
  async resolveShareLink(linkData, userId) {
    try {
      // Track share click
      await this.trackShareClick(linkData.linkId, userId);

      // Redirect to the shared post
      return await this.resolvePostLink({ 
        ...linkData, 
        postId: linkData.postId,
        type: 'post' 
      }, userId);

    } catch (error) {
      return { 
        action: 'error', 
        error: error.message,
        fallback: { screen: 'home' }
      };
    }
  }

  // Helper methods
  generateLinkId() {
    return crypto.randomBytes(16).toString('hex');
  }

  async storeLinkData(linkId, linkData) {
    // Store in Redis for fast access
    await redisSet(`deeplink:${linkId}`, JSON.stringify(linkData), linkData.expiresAt - Date.now());
    
    // Also store in database for persistence
    await query(`
      INSERT INTO deep_links (link_id, link_type, link_data, expires_at)
      VALUES ($1, $2, $3, $4)
    `, [linkId, linkData.type, JSON.stringify(linkData), new Date(linkData.expiresAt)]);
  }

  async getLinkData(linkId) {
    // Try Redis first
    const cached = await redisGet(`deeplink:${linkId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const result = await query(`
      SELECT link_data FROM deep_links 
      WHERE link_id = $1 AND expires_at > NOW()
    `, [linkId]);

    if (result.rows.length > 0) {
      const linkData = JSON.parse(result.rows[0].link_data);
      // Re-cache for future use
      await redisSet(`deeplink:${linkId}`, JSON.stringify(linkData), linkData.expiresAt - Date.now());
      return linkData;
    }

    return null;
  }

  async deleteLinkData(linkId) {
    await redisDel(`deeplink:${linkId}`);
    await query('DELETE FROM deep_links WHERE link_id = $1', [linkId]);
  }

  async verifyConversationAccess(conversationId, userId) {
    const result = await query(`
      SELECT COUNT(*) as count FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId]);

    return parseInt(result.rows[0].count) > 0;
  }

  async trackLinkClick(linkId, userId, deviceInfo) {
    try {
      await query(`
        INSERT INTO deep_link_analytics (link_id, user_id, device_info, clicked_at)
        VALUES ($1, $2, $3, NOW())
      `, [linkId, userId, JSON.stringify(deviceInfo)]);
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  }

  async trackShareAction(postId, sharerId, shareType) {
    try {
      await query(`
        INSERT INTO post_interactions (user_id, post_id, interaction_type)
        VALUES ($1, $2, 'share')
        ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
      `, [sharerId, postId]);

      // Update share count
      await query(`
        UPDATE posts SET share_count = share_count + 1 WHERE id = $1
      `, [postId]);
    } catch (error) {
      console.error('Error tracking share action:', error);
    }
  }

  async trackShareClick(linkId, userId) {
    try {
      await query(`
        UPDATE deep_link_analytics 
        SET share_clicked = true, share_clicked_at = NOW()
        WHERE link_id = $1
      `, [linkId]);
    } catch (error) {
      console.error('Error tracking share click:', error);
    }
  }

  async processInvitation(linkData, userId) {
    try {
      // Track referral
      await query(`
        INSERT INTO user_referrals (referrer_id, referred_id, referral_type, metadata)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (referrer_id, referred_id) DO NOTHING
      `, [
        linkData.inviterId, 
        userId, 
        linkData.inviteType, 
        JSON.stringify(linkData.metadata)
      ]);
    } catch (error) {
      console.error('Error processing invitation:', error);
    }
  }

  // Analytics methods
  async getLinkAnalytics(linkId) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) FILTER (WHERE share_clicked = true) as share_conversions,
          MIN(clicked_at) as first_click,
          MAX(clicked_at) as last_click
        FROM deep_link_analytics 
        WHERE link_id = $1
      `, [linkId]);

      return result.rows[0] || {};
    } catch (error) {
      console.error('Error getting link analytics:', error);
      return {};
    }
  }

  // Clean up expired links
  async cleanupExpiredLinks() {
    try {
      const result = await query(`
        DELETE FROM deep_links WHERE expires_at < NOW()
      `);

      console.log(`🧹 Cleaned up ${result.rowCount} expired deep links`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up expired links:', error);
      return 0;
    }
  }
}

module.exports = new DeepLinkingService(); 