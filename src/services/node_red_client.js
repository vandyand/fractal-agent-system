const axios = require('axios');

class NodeRedClient {
  constructor(baseUrl = 'http://localhost:1880') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async ensureAvailable(timeoutMs = 10000) {
    const start = Date.now();
    let lastErr;
    while (Date.now() - start < timeoutMs) {
      try {
        await axios.get(`${this.baseUrl}/flows`, { timeout: 2000 });
        return true;
      } catch (err) {
        lastErr = err;
        await new Promise(r => setTimeout(r, 500));
      }
    }
    throw new Error(`Node-RED not available at ${this.baseUrl}: ${lastErr?.message}`);
  }

  async getFlows() {
    const res = await axios.get(`${this.baseUrl}/flows`);
    return Array.isArray(res.data) ? res.data : [];
  }

  async deployFlowSet(flowSet) {
    if (!Array.isArray(flowSet)) {
      throw new Error('deployFlowSet expects an array of nodes (flow set)');
    }
    // Merge with existing flows, replacing nodes with the same id
    const existing = await this.getFlows();
    const incomingIds = new Set(flowSet.map(n => n.id));
    const preserved = existing.filter(n => !incomingIds.has(n.id));
    const merged = preserved.concat(flowSet);
    const res = await axios.post(`${this.baseUrl}/flows`, merged, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res;
  }

  async replaceFlows(flowSet) {
    if (!Array.isArray(flowSet)) {
      throw new Error('replaceFlows expects an array of nodes (flow set)');
    }
    const res = await axios.post(`${this.baseUrl}/flows`, flowSet, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res;
  }

  async removeFlowByTabId(tabId) {
    const flows = await this.getFlows();
    const remaining = flows.filter(n => !(n.type === 'tab' && n.id === tabId) && n.z !== tabId);
    const res = await axios.post(`${this.baseUrl}/flows`, remaining, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res;
  }
}

module.exports = { NodeRedClient };
