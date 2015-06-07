"use strict";

module.exports = (function() {
  var http = require("http");

  function HTTPSync(cfg) {
    this._config = cfg;
  }

  HTTPSync.prototype.initialise = function(cb) {
    // Nothing to do .
    process.nextTick(cb);
  };

  HTTPSync.prototype.sendData = function(dataIn, cb) {
    var self = this;

    var data = {
      hubId: this._config.hubId,
      payload: JSON.parse(dataIn)
    };

    var options = {
      hostname: this._config.syncServer,
      port: this._config.syncPort,
      path: "/" + this._config.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };

    var req = http.request(options, function(res) {
      var body = "";

      res.setEncoding("utf8");
      res.on("data", function(chunk) {
        body += chunk;
      });
      res.on("end", function() {
        if (res.statusCode === 200) {
          try {
            var result = JSON.parse(body);
            if (result.ok === true) {
              cb(null, result);
            } else {
              cb(new Error("server failed request"), result);
            }
          } catch(e) {
            cb(new Error("corrupt server response: " + e.message));
          }
        } else {
          cb(new Error("bad request: " + body));
        }
      });
    });

    req.on("error", function(err) {
      cb(err);
    });

    req.write(JSON.stringify(data));
    req.end();
  };

  HTTPSync.prototype.close = function() {
    // Nothing to do.
  };

  return HTTPSync;
}());