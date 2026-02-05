/**
 * Session store for Visualize.AI with Supabase persistence
 * Stores image context and conversation history
 * Falls back to in-memory storage if Supabase is not configured
 */

const { supabase } = require('./supabase');

class SessionStore {
  constructor() {
    this.sessions = new Map(); // Fallback in-memory store
    this.maxAge = 60 * 60 * 1000; // 1 hour session expiry
    this.useSupabase = !!supabase;
    
    // Cleanup expired sessions every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);

    if (this.useSupabase) {
      console.log('📦 SessionStore: Using Supabase for persistence');
    } else {
      console.log('📦 SessionStore: Using in-memory storage (Supabase not configured)');
    }
  }

  /**
   * Store session data
   * @param {string} sessionId - Unique session identifier
   * @param {object} data - Session data to store
   */
  async set(sessionId, data) {
    const expiresAt = new Date(Date.now() + this.maxAge).toISOString();
    
    if (this.useSupabase) {
      try {
        const sessionData = {
          session_id: sessionId,
          image_data: data.imageData || null,
          image_type: data.imageType || null,
          image_description: data.imageDescription || null,
          components: data.components || [],
          conversation_history: data.conversationHistory || [],
          difficulty: data.difficulty || 'Beginner',
          expires_at: expiresAt,
        };

        const { error } = await supabase
          .from('sessions')
          .upsert(sessionData, { onConflict: 'session_id' });

        if (error) {
          console.error('❌ Supabase set error:', error.message);
          // Fallback to in-memory
          this.sessions.set(sessionId, { ...data, expiresAt: Date.now() + this.maxAge });
        }
      } catch (err) {
        console.error('❌ SessionStore set error:', err.message);
        this.sessions.set(sessionId, { ...data, expiresAt: Date.now() + this.maxAge });
      }
    } else {
      this.sessions.set(sessionId, { ...data, expiresAt: Date.now() + this.maxAge });
    }
  }

  /**
   * Retrieve session data
   * @param {string} sessionId - Session identifier
   * @returns {object|null} Session data or null if not found/expired
   */
  async get(sessionId) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_id', sessionId)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          return null;
        }

        // Refresh expiry on access
        await supabase
          .from('sessions')
          .update({ expires_at: new Date(Date.now() + this.maxAge).toISOString() })
          .eq('session_id', sessionId);

        // Transform to expected format
        return {
          imageData: data.image_data,
          imageType: data.image_type,
          imageDescription: data.image_description,
          components: data.components || [],
          conversationHistory: data.conversation_history || [],
          difficulty: data.difficulty,
          expiresAt: new Date(data.expires_at).getTime(),
        };
      } catch (err) {
        console.error('❌ SessionStore get error:', err.message);
        return this.sessions.get(sessionId) || null;
      }
    } else {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return null;
      }

      // Check if expired
      if (Date.now() > session.expiresAt) {
        this.sessions.delete(sessionId);
        return null;
      }

      // Refresh expiry on access
      session.expiresAt = Date.now() + this.maxAge;
      
      return session;
    }
  }

  /**
   * Update session data (partial update)
   * @param {string} sessionId - Session identifier
   * @param {object} updates - Fields to update
   */
  async update(sessionId, updates) {
    if (this.useSupabase) {
      try {
        const updateData = {};
        
        if (updates.conversationHistory !== undefined) {
          updateData.conversation_history = updates.conversationHistory;
        }
        if (updates.components !== undefined) {
          updateData.components = updates.components;
        }
        if (updates.difficulty !== undefined) {
          updateData.difficulty = updates.difficulty;
        }
        if (updates.imageDescription !== undefined) {
          updateData.image_description = updates.imageDescription;
        }

        updateData.expires_at = new Date(Date.now() + this.maxAge).toISOString();

        const { error } = await supabase
          .from('sessions')
          .update(updateData)
          .eq('session_id', sessionId);

        if (error) {
          console.error('❌ Supabase update error:', error.message);
        }
      } catch (err) {
        console.error('❌ SessionStore update error:', err.message);
      }
    } else {
      const session = this.sessions.get(sessionId);
      if (session) {
        Object.assign(session, updates);
        session.expiresAt = Date.now() + this.maxAge;
      }
    }
  }

  /**
   * Check if session exists
   * @param {string} sessionId - Session identifier
   * @returns {boolean} True if session exists and is not expired
   */
  async has(sessionId) {
    const session = await this.get(sessionId);
    return session !== null;
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session identifier
   * @returns {boolean} True if session existed and was deleted
   */
  async delete(sessionId) {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('session_id', sessionId);

        return !error;
      } catch (err) {
        console.error('❌ SessionStore delete error:', err.message);
        return false;
      }
    } else {
      return this.sessions.delete(sessionId);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanup() {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .delete()
          .lt('expires_at', new Date().toISOString())
          .select('session_id');

        if (!error && data && data.length > 0) {
          console.log(`🧹 Cleaned up ${data.length} expired sessions from Supabase`);
        }
      } catch (err) {
        console.error('❌ Cleanup error:', err.message);
      }
    } else {
      const now = Date.now();
      let cleaned = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.sessions.delete(sessionId);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
      }
    }
  }

  /**
   * Get store statistics
   * @returns {object} Store statistics
   */
  async getStats() {
    if (this.useSupabase) {
      try {
        const { count, error } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .gt('expires_at', new Date().toISOString());

        return {
          activeSessions: error ? 0 : count,
          maxAge: this.maxAge / 1000 / 60, // in minutes
          storage: 'supabase',
        };
      } catch (err) {
        return {
          activeSessions: 0,
          maxAge: this.maxAge / 1000 / 60,
          storage: 'supabase',
          error: err.message,
        };
      }
    }

    return {
      activeSessions: this.sessions.size,
      maxAge: this.maxAge / 1000 / 60,
      storage: 'memory',
    };
  }

  /**
   * Clear all sessions (for testing)
   */
  async clear() {
    if (this.useSupabase) {
      try {
        await supabase.from('sessions').delete().neq('session_id', '');
      } catch (err) {
        console.error('❌ Clear error:', err.message);
      }
    }
    this.sessions.clear();
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance
module.exports = new SessionStore();
