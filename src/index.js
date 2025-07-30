#!/usr/bin/env node

/**
 * Fractal Agent System - Main Entry Point
 * 
 * This is the main entry point for the refactored Fractal Agent System.
 * It provides a clean interface to all the system components.
 */

const path = require('path');
const FractalAgentCLI = require('./agents/fractal_agent_cli');
const { AgentCommunicationProtocol } = require('./agents/agent_communication_protocol');
const { AutonomousBusinessRunner } = require('./agents/autonomous_business_runner');
const { RealBusinessOperations } = require('./agents/real_business_operations');

class FractalAgentSystem {
  constructor() {
    this.cli = new FractalAgentCLI();
    this.protocol = new AgentCommunicationProtocol();
    this.businessRunner = new AutonomousBusinessRunner();
    this.businessOps = new RealBusinessOperations();
  }

  async init() {
    console.log('🚀 Fractal Agent System - Initializing...');
    console.log('==========================================\n');
    
    try {
      await this.cli.init();
      console.log('✅ System initialized successfully');
    } catch (error) {
      console.error('❌ System initialization failed:', error.message);
      process.exit(1);
    }
  }

  async start() {
    await this.init();
    console.log('\n🎯 System ready for commands');
    console.log('Use --help for available options\n');
  }

  async runCommand(command, args = []) {
    switch (command) {
      case 'spawn':
        return await this.cli.spawnAgent(args[0], args.slice(1));
      
      case 'run':
        return await this.cli.runAgent(args[0], args[1]);
      
      case 'list':
        return this.cli.listAgents();
      
      case 'history':
        return this.cli.showHistory();
      
      case 'protocol':
        return await this.protocol.runCommunicationTest();
      
      case 'business':
        return await this.businessRunner.run();
      
      case 'real':
        return await this.businessOps.run();
      
      default:
        console.log('Unknown command:', command);
        this.showHelp();
    }
  }

  showHelp() {
    console.log('\n📖 Available Commands:');
    console.log('======================');
    console.log('spawn <type> [capabilities] - Spawn a new agent');
    console.log('run <agentId> [input]      - Run an agent');
    console.log('list                       - List all agents');
    console.log('history                    - Show spawn history');
    console.log('protocol                   - Test communication protocol');
    console.log('business                   - Start autonomous business system');
    console.log('real                       - Execute real business operations');
    console.log('help                       - Show this help');
  }
}

// CLI interface
async function main() {
  const system = new FractalAgentSystem();
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    await system.start();
    system.showHelp();
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  try {
    await system.init();
    await system.runCommand(command, commandArgs);
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FractalAgentSystem; 