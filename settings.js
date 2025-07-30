module.exports = {
  // The tcp port that the Node-RED web server is listening on
  uiPort: process.env.PORT || 1880,

  // By default, the Node-RED UI accepts connections on all IPv4 interfaces.
  // The following property can be used to listen on a specific interface. For
  // example, the following would only allow connections from the local machine.
  //uiHost: "127.0.0.1",
  
  // Listen on all interfaces for global access
  uiHost: "0.0.0.0",

  // Retry time in milliseconds for MQTT connections
  mqttReconnectTime: 15000,

  // Retry time in milliseconds for Serial port connections
  serialReconnectTime: 15000,

  // Retry time in milliseconds for TCP socket connections
  //tcpReconnectTime: 10000,

  // The maximum length, in characters, of any message sent to the debug sidebar tab
  debugMaxLength: 1000,

  // The maximum number of messages nodes will buffer internally as part of their
  // operation. This applies across a range of nodes that operate on message sequences.
  // default: no limit. A value of 0 also means no limit is applied.
  nodeMessageBufferMaxLength: 0,

  // To disable the option for using local files for storing keys and certificates in the TLS configuration
  // node, set this to true
  tlsConfigDisableLocalFiles: false,

  // Colourise the console output of the debug node
  debugUseColors: true,

  // The file containing the flows. If not set, it defaults to flows_<hostname>.json
  flowFile: "flows.json",

  // To enabled pretty-printing of the flow within the flow file, set the following
  // property to true:
  flowFilePretty: true,

  // By default, credentials are encrypted in storage using a generated key. To
  // specify your own secret, set the following property.
  // If you want to disable encryption of credentials, set this property to false.
  // Note: once you set this property, do not change it - doing so will prevent
  // node-red from being able to decrypt your existing credentials and they will be
  // lost.
  credentialSecret: process.env.NODE_RED_SECRET || "a-secret-key",

  // By default, all user data is stored in a directory called `.node-red` under
  // the user's home directory. To use a different location, the following
  // property can be used
  userDir: "/data",

  // Node-RED scans the `nodes` directory in the userDir to find local node files.
  // The following property can be used to specify an additional directory to scan.
  //nodesDir: '/home/nol/.node-red/nodes',

  // By default, the Node-RED UI is available at http://localhost:1880/
  // The following property can be used to specify a different root path.
  // If set to false, this is disabled.
  httpRoot: "/",

  // The following property can be used to add a custom middleware function
  // in front of all HTTP in nodes. This can be used to set custom headers, for
  // example to handle authentication. The function should be added to the
  // projects array. You can enable/disable the middleware for the http-in node
  // by toggling the name in the projects array. The middleware can send errors
  // to the caller by throwing a string (which will be sent as the error status
  // message) or Error object (which will result in a 500 status code).
  //httpNodeMiddleware: function(req,res,next) {
  //    // Handle/reject requests as required.
  //    if (req.headers.authorization == "Bearer 123456") {
  //        next();
  //    } else {
  //        res.status(403).send("Forbidden");
  //    }
  //},

  // The following property can be used to verify websocket connection attempts.
  // This allows, for example, the HTTP request headers to be checked to ensure
  // they include valid authentication information.
  //webSocketNodeVerifyClient: function(info) {
  //    // 'info' has three properties:
  //    //   - origin : the value in the Origin header
  //    //   - req : the HTTP request
  //    //   - secure : true if req.connection.authorized or req.connection.encrypted is set
  //    //
  //    // The function should return true if the connection should be accepted, false otherwise.
  //    //
  //    // Alternatively, if this function is defined to accept a second argument, callback,
  //    // it can be used to verify the client asynchronously.
  //    // callback(true) should be called if the client should be accepted.
  //    // callback(false) should be called if the client should be rejected.
  //    return true;
  //},

  // Anything in this hash is globally available to all functions.
  // It is accessed as context.global.
  // eg:
  //    functionGlobalContext: { os:require('os') }
  // can be accessed in a function block as:
  //    context.global.os
  functionGlobalContext: {
    // os:require('os'),
    // jfive:require("johnny-five"),
    // j5board:require("johnny-five").Board({repl:false})
  },

  // Configure the logging output
  logging: {
    // Only console logging is currently supported
    console: {
      // Level of logging to be recorded. Options are:
      // fatal - only those errors which make the application unusable should be recorded
      // error - record errors which are deemed fatal for a particular request + fatal errors
      // warn - record problems which are non fatal + errors + fatal errors
      // info - record information about the general running of the application + warn + error + fatal errors
      // debug - record information which is more detailed than info + info + warn + error + fatal errors
      // trace - record very detailed logging + debug + info + warn + error + fatal errors
      // off - turn off all logging (doesn't affect metrics or audit)
      level: "info",
      // Whether or not to include metric events in the log output
      metrics: false,
      // Whether or not to include audit events in the log output
      audit: false,
    },
  },

  // Customising the editor
  editorTheme: {
    projects: {
      // To enable the Projects feature, set this value to true
      enabled: false,
    },
  },
};
