#!/usr/bin/env node

const { CompanyLifeController } = require('../services/company_life_controller');
const readline = require('readline');

/**
 * Company Life Loop CLI
 * 
 * Command-line interface for managing the autonomous digital company
 */
class CompanyCLI {
  constructor() {
    this.controller = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.commands = {
      'start': this.start.bind(this),
      'stop': this.stop.bind(this),
      'status': this.status.bind(this),
      'metrics': this.metrics.bind(this),
      'add-task': this.addTask.bind(this),
      'emergency-stop': this.emergencyStop.bind(this),
      'help': this.help.bind(this),
      'exit': this.exit.bind(this)
    };
  }

  /**
   * Start the CLI
   */
  async start() {
    console.log('🚀 Autonomous Digital Company CLI');
    console.log('=====================================');
    console.log('Type "help" for available commands');
    console.log('');

    // Set up event listeners
    this.setupEventListeners();
    
    // Start the prompt loop
    this.prompt();
  }

  /**
   * Set up event listeners for the controller
   */
  setupEventListeners() {
    if (!this.controller) return;

    this.controller.on('started', (state) => {
      console.log('\n✅ Company life loop started');
      console.log(`📊 Initial state: ${state.phase} phase, $${state.revenue.toFixed(2)} revenue`);
    });

    this.controller.on('stopped', (state) => {
      console.log('\n🛑 Company life loop stopped');
      console.log(`📊 Final state: ${state.phase} phase, $${state.revenue.toFixed(2)} revenue`);
    });

    this.controller.on('cycleCompleted', (data) => {
      console.log(`\n🔄 Cycle ${data.cycle} completed (${data.phase})`);
      console.log(`📋 Tasks: ${data.tasks}, Revenue: $${data.revenue.toFixed(2)}`);
    });

    this.controller.on('taskAdded', (task) => {
      console.log(`📥 Task added: ${task.type} (${task.priority})`);
    });

    this.controller.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
    });

    this.controller.on('emergencyStop', (data) => {
      console.log(`🚨 Emergency stop: ${data.reason}`);
    });
  }

  /**
   * Start the company life loop
   */
  async start() {
    if (this.controller && this.controller.isRunning) {
      console.log('⚠️ Company life loop is already running');
      return;
    }

    try {
      this.controller = new CompanyLifeController({
        nodeRedUrl: 'http://localhost:1880',
        lifeLoopInterval: 30000, // 30 seconds
        maxConcurrentTasks: 10,
        enableMetrics: true,
        enableFlowRegistry: true
      });

      this.setupEventListeners();
      await this.controller.start();
      
    } catch (error) {
      console.error('❌ Failed to start company life loop:', error.message);
    }
  }

  /**
   * Stop the company life loop
   */
  async stop() {
    if (!this.controller || !this.controller.isRunning) {
      console.log('⚠️ Company life loop is not running');
      return;
    }

    try {
      await this.controller.stop();
    } catch (error) {
      console.error('❌ Failed to stop company life loop:', error.message);
    }
  }

  /**
   * Show current status
   */
  status() {
    if (!this.controller) {
      console.log('❌ Company life loop not initialized');
      return;
    }

    const state = this.controller.getState();
    
    console.log('\n📊 Company Status');
    console.log('==================');
    console.log(`Phase: ${state.phase}`);
    console.log(`Cycle: ${state.cycle}`);
    console.log(`Revenue: $${state.revenue.toFixed(2)}`);
    console.log(`Customers: ${state.customers}`);
    console.log(`Market Position: ${state.marketPosition}`);
    console.log(`Success Rate: ${(state.successRate * 100).toFixed(1)}%`);
    console.log('');
    console.log('📋 Task Status');
    console.log('==============');
    console.log(`Completed: ${state.completedTasks}`);
    console.log(`Failed: ${state.failedTasks}`);
    console.log(`Active: ${state.activeTasks}`);
    console.log(`Queued: ${state.queuedTasks}`);
    console.log('');
    console.log('🤖 System Status');
    console.log('================');
    console.log(`Registered Flows: ${state.registeredFlows}`);
    console.log(`Running: ${this.controller.isRunning ? 'Yes' : 'No'}`);
    console.log(`Last Updated: ${state.lastUpdated}`);
  }

  /**
   * Show metrics
   */
  metrics() {
    if (!this.controller) {
      console.log('❌ Company life loop not initialized');
      return;
    }

    const state = this.controller.getState();
    const metrics = this.controller.metrics;
    
    console.log('\n📈 Company Metrics');
    console.log('==================');
    
    if (metrics.length > 0) {
      const recentMetrics = metrics.slice(-10);
      
      console.log('Recent Metrics (last 10 cycles):');
      recentMetrics.forEach((metric, index) => {
        console.log(`${index + 1}. Cycle ${metric.cycle} (${metric.phase}): $${metric.revenue.toFixed(2)} revenue, ${metric.completedTasks} tasks`);
      });
      
      console.log('');
      console.log('Summary:');
      console.log(`Total Cycles: ${state.cycle}`);
      console.log(`Total Revenue: $${state.revenue.toFixed(2)}`);
      console.log(`Average Success Rate: ${(state.successRate * 100).toFixed(1)}%`);
    } else {
      console.log('No metrics available yet');
    }
  }

  /**
   * Add a task to the queue
   */
  addTask() {
    if (!this.controller) {
      console.log('❌ Company life loop not initialized');
      return;
    }

    this.rl.question('Task type: ', (type) => {
      this.rl.question('Priority (urgent/high/medium/low): ', (priority) => {
        this.rl.question('Agent: ', (agent) => {
          const task = {
            type: type,
            priority: priority || 'medium',
            agent: agent || 'general_agent'
          };
          
          this.controller.addTask(task);
        });
      });
    });
  }

  /**
   * Emergency stop
   */
  async emergencyStop() {
    if (!this.controller) {
      console.log('❌ Company life loop not initialized');
      return;
    }

    this.rl.question('Emergency stop reason: ', async (reason) => {
      await this.controller.emergencyStop(reason || 'manual emergency stop');
    });
  }

  /**
   * Show help
   */
  help() {
    console.log('\n📖 Available Commands');
    console.log('=====================');
    console.log('start           - Start the company life loop');
    console.log('stop            - Stop the company life loop');
    console.log('status          - Show current company status');
    console.log('metrics         - Show company metrics');
    console.log('add-task        - Add a task to the queue');
    console.log('emergency-stop  - Emergency stop the system');
    console.log('help            - Show this help message');
    console.log('exit            - Exit the CLI');
    console.log('');
  }

  /**
   * Exit the CLI
   */
  async exit() {
    if (this.controller && this.controller.isRunning) {
      console.log('🛑 Stopping company life loop before exit...');
      await this.controller.stop();
    }
    
    console.log('👋 Goodbye!');
    process.exit(0);
  }

  /**
   * Process user input
   */
  async processInput(input) {
    const command = input.trim().toLowerCase();
    
    if (this.commands[command]) {
      await this.commands[command]();
    } else if (command) {
      console.log(`❌ Unknown command: ${command}`);
      console.log('Type "help" for available commands');
    }
  }

  /**
   * Show the prompt
   */
  prompt() {
    this.rl.question('\n🏢 Company> ', async (input) => {
      await this.processInput(input);
      this.prompt();
    });
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  if (global.companyCLI && global.companyCLI.controller) {
    await global.companyCLI.controller.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (global.companyCLI && global.companyCLI.controller) {
    await global.companyCLI.controller.stop();
  }
  process.exit(0);
});

// Start the CLI if this file is run directly
if (require.main === module) {
  global.companyCLI = new CompanyCLI();
  global.companyCLI.start();
}

module.exports = { CompanyCLI }; 