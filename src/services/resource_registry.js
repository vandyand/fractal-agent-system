const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

/**
 * Resource Registry
 * 
 * Central system for agents to share documents, context, and resources.
 * Provides versioning, access control, and real-time synchronization.
 */
class ResourceRegistry extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      basePath: config.basePath || path.join(process.cwd(), 'data/resources'),
      maxFileSize: config.maxFileSize || 100 * 1024 * 1024, // 100MB
      enableVersioning: config.enableVersioning !== false,
      enableAccessControl: config.enableAccessControl !== false,
      ...config
    };
    
    this.resources = new Map();
    this.accessControl = new Map();
    this.resourceLocks = new Map();
    
    // Ensure base directory exists
    this.ensureDirectoryExists(this.config.basePath);
    
    // Load existing resources
    this.loadResources();
  }

  /**
   * Register a new resource
   */
  async registerResource(resourceData) {
    const {
      id,
      name,
      type,
      content,
      metadata = {},
      agentId,
      accessLevel = 'public',
      tags = []
    } = resourceData;

    const resourceId = id || this.generateResourceId();
    const timestamp = new Date().toISOString();
    
    // Validate resource
    if (!name || !type || !content) {
      throw new Error('Resource must have name, type, and content');
    }

    // Create resource object
    const resource = {
      id: resourceId,
      name,
      type,
      content,
      metadata,
      agentId,
      accessLevel,
      tags,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      size: this.calculateResourceSize(content),
      checksum: this.calculateChecksum(content)
    };

    // Store resource
    await this.storeResource(resource);
    
    // Update registry
    this.resources.set(resourceId, resource);
    
    // Set up access control
    if (this.config.enableAccessControl) {
      this.setupAccessControl(resourceId, accessLevel, agentId);
    }

    console.log(`📄 Resource registered: ${name} (${resourceId})`);
    this.emit('resourceRegistered', resource);
    
    return resource;
  }

  /**
   * Get a resource by ID
   */
  async getResource(resourceId, agentId = null) {
    const resource = this.resources.get(resourceId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }

    // Check access control
    if (this.config.enableAccessControl && !this.hasAccess(resourceId, agentId)) {
      throw new Error(`Access denied to resource: ${resourceId}`);
    }

    // Load content if not in memory
    if (!resource.content && resource.filePath) {
      resource.content = await this.loadResourceContent(resource.filePath);
    }

    return resource;
  }

  /**
   * Update an existing resource
   */
  async updateResource(resourceId, updates, agentId = null) {
    const resource = await this.getResource(resourceId, agentId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }

    // Check if agent can modify this resource
    if (this.config.enableAccessControl && resource.agentId !== agentId) {
      throw new Error(`Permission denied: Cannot modify resource ${resourceId}`);
    }

    // Create new version if versioning is enabled
    if (this.config.enableVersioning) {
      await this.createVersion(resource);
    }

    // Update resource
    const updatedResource = {
      ...resource,
      ...updates,
      version: resource.version + 1,
      updatedAt: new Date().toISOString(),
      size: updates.content ? this.calculateResourceSize(updates.content) : resource.size,
      checksum: updates.content ? this.calculateChecksum(updates.content) : resource.checksum
    };

    // Store updated resource
    await this.storeResource(updatedResource);
    
    // Update registry
    this.resources.set(resourceId, updatedResource);

    console.log(`📝 Resource updated: ${updatedResource.name} (v${updatedResource.version})`);
    this.emit('resourceUpdated', updatedResource);
    
    return updatedResource;
  }

  /**
   * Delete a resource
   */
  async deleteResource(resourceId, agentId = null) {
    const resource = await this.getResource(resourceId, agentId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }

    // Check if agent can delete this resource
    if (this.config.enableAccessControl && resource.agentId !== agentId) {
      throw new Error(`Permission denied: Cannot delete resource ${resourceId}`);
    }

    // Remove from storage
    await this.removeResourceFromStorage(resource);
    
    // Remove from registry
    this.resources.delete(resourceId);
    
    // Remove access control
    if (this.config.enableAccessControl) {
      this.accessControl.delete(resourceId);
    }

    console.log(`🗑️ Resource deleted: ${resource.name} (${resourceId})`);
    this.emit('resourceDeleted', resource);
    
    return { success: true, message: `Resource ${resourceId} deleted` };
  }

  /**
   * Search resources
   */
  async searchResources(query, filters = {}) {
    const {
      type,
      agentId,
      tags,
      accessLevel,
      dateFrom,
      dateTo
    } = filters;

    let results = Array.from(this.resources.values());

    // Filter by query (search in name, content, and tags)
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(resource => 
        resource.name.toLowerCase().includes(searchTerm) ||
        (typeof resource.content === 'string' && resource.content.toLowerCase().includes(searchTerm)) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by type
    if (type) {
      results = results.filter(resource => resource.type === type);
    }

    // Filter by agent
    if (agentId) {
      results = results.filter(resource => resource.agentId === agentId);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(resource => 
        tags.some(tag => resource.tags.includes(tag))
      );
    }

    // Filter by access level
    if (accessLevel) {
      results = results.filter(resource => resource.accessLevel === accessLevel);
    }

    // Filter by date range
    if (dateFrom) {
      results = results.filter(resource => new Date(resource.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      results = results.filter(resource => new Date(resource.createdAt) <= new Date(dateTo));
    }

    return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Share resource with another agent
   */
  async shareResource(resourceId, targetAgentId, accessLevel = 'read') {
    const resource = await this.getResource(resourceId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }

    if (this.config.enableAccessControl) {
      this.grantAccess(resourceId, targetAgentId, accessLevel);
    }

    console.log(`📤 Resource shared: ${resource.name} with ${targetAgentId} (${accessLevel} access)`);
    this.emit('resourceShared', { resourceId, targetAgentId, accessLevel });
    
    return { success: true, message: `Resource shared with ${targetAgentId}` };
  }

  /**
   * Lock a resource for exclusive access
   */
  async lockResource(resourceId, agentId, timeout = 300000) { // 5 minutes default
    if (this.resourceLocks.has(resourceId)) {
      const lock = this.resourceLocks.get(resourceId);
      if (Date.now() < lock.expiresAt) {
        throw new Error(`Resource ${resourceId} is locked by ${lock.agentId}`);
      }
    }

    const lock = {
      agentId,
      lockedAt: Date.now(),
      expiresAt: Date.now() + timeout
    };

    this.resourceLocks.set(resourceId, lock);
    
    console.log(`🔒 Resource locked: ${resourceId} by ${agentId}`);
    this.emit('resourceLocked', { resourceId, agentId });
    
    return lock;
  }

  /**
   * Unlock a resource
   */
  async unlockResource(resourceId, agentId) {
    const lock = this.resourceLocks.get(resourceId);
    
    if (!lock) {
      return { success: true, message: 'Resource not locked' };
    }

    if (lock.agentId !== agentId) {
      throw new Error(`Cannot unlock resource: Locked by ${lock.agentId}`);
    }

    this.resourceLocks.delete(resourceId);
    
    console.log(`🔓 Resource unlocked: ${resourceId} by ${agentId}`);
    this.emit('resourceUnlocked', { resourceId, agentId });
    
    return { success: true, message: 'Resource unlocked' };
  }

  /**
   * Get resource statistics
   */
  getStats() {
    const resources = Array.from(this.resources.values());
    
    return {
      totalResources: resources.length,
      totalSize: resources.reduce((sum, r) => sum + r.size, 0),
      byType: this.groupByType(resources),
      byAgent: this.groupByAgent(resources),
      byAccessLevel: this.groupByAccessLevel(resources),
      lockedResources: this.resourceLocks.size
    };
  }

  /**
   * Store resource to file system
   */
  async storeResource(resource) {
    const filePath = path.join(this.config.basePath, `${resource.id}.json`);
    
    // Store metadata
    const metadata = {
      ...resource,
      content: undefined, // Don't store content in metadata file
      filePath: filePath
    };
    
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    
    // Store content separately if it's large
    if (resource.size > 1024 * 1024) { // 1MB
      const contentPath = path.join(this.config.basePath, `${resource.id}_content.json`);
      fs.writeFileSync(contentPath, JSON.stringify(resource.content, null, 2));
      resource.contentFilePath = contentPath;
      resource.content = undefined; // Remove from memory
    }
  }

  /**
   * Load resource content from file
   */
  async loadResourceContent(filePath) {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  }

  /**
   * Remove resource from storage
   */
  async removeResourceFromStorage(resource) {
    const filePath = path.join(this.config.basePath, `${resource.id}.json`);
    const contentPath = path.join(this.config.basePath, `${resource.id}_content.json`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    if (fs.existsSync(contentPath)) {
      fs.unlinkSync(contentPath);
    }
  }

  /**
   * Load existing resources from storage
   */
  loadResources() {
    try {
      const files = fs.readdirSync(this.config.basePath);
      
      files.forEach(file => {
        if (file.endsWith('.json') && !file.includes('_content')) {
          const filePath = path.join(this.config.basePath, file);
          const resourceData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          this.resources.set(resourceData.id, resourceData);
        }
      });
      
      console.log(`📂 Loaded ${this.resources.size} existing resources`);
    } catch (error) {
      console.log('📂 No existing resources found');
    }
  }

  /**
   * Generate unique resource ID
   */
  generateResourceId() {
    return `resource_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Calculate resource size
   */
  calculateResourceSize(content) {
    return Buffer.byteLength(JSON.stringify(content), 'utf8');
  }

  /**
   * Calculate content checksum
   */
  calculateChecksum(content) {
    return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Set up access control for a resource
   */
  setupAccessControl(resourceId, accessLevel, ownerId) {
    this.accessControl.set(resourceId, {
      owner: ownerId,
      permissions: new Map([[ownerId, 'full']])
    });
  }

  /**
   * Check if agent has access to resource
   */
  hasAccess(resourceId, agentId) {
    const resource = this.resources.get(resourceId);
    if (!resource) return false;
    
    if (resource.accessLevel === 'public') return true;
    if (resource.agentId === agentId) return true;
    
    const access = this.accessControl.get(resourceId);
    if (access && access.permissions.has(agentId)) return true;
    
    return false;
  }

  /**
   * Grant access to resource
   */
  grantAccess(resourceId, agentId, accessLevel) {
    if (!this.accessControl.has(resourceId)) {
      this.accessControl.set(resourceId, {
        owner: this.resources.get(resourceId)?.agentId,
        permissions: new Map()
      });
    }
    
    this.accessControl.get(resourceId).permissions.set(agentId, accessLevel);
  }

  /**
   * Create version of resource
   */
  async createVersion(resource) {
    const versionPath = path.join(this.config.basePath, 'versions', `${resource.id}_v${resource.version}.json`);
    this.ensureDirectoryExists(path.dirname(versionPath));
    
    fs.writeFileSync(versionPath, JSON.stringify(resource, null, 2));
  }

  /**
   * Group resources by type
   */
  groupByType(resources) {
    return resources.reduce((groups, resource) => {
      const type = resource.type;
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group resources by agent
   */
  groupByAgent(resources) {
    return resources.reduce((groups, resource) => {
      const agent = resource.agentId;
      groups[agent] = (groups[agent] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group resources by access level
   */
  groupByAccessLevel(resources) {
    return resources.reduce((groups, resource) => {
      const level = resource.accessLevel;
      groups[level] = (groups[level] || 0) + 1;
      return groups;
    }, {});
  }
}

module.exports = { ResourceRegistry }; 