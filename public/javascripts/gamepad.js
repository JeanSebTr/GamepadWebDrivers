
(function() {

  // event emitter support
  function emit() {
    if(!arguments.length) {
      throw new Error('You must pass an event name to Object.emit!');
    }
    var ev = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    if(this[ev]) {
      var i = this[ev].length;
      while(--i>=0) {
        this[ev][i].apply(null, args);
      }
    }
  }
  function on(ev, callback) {
    if(typeof callback != 'function') {
      throw new Error('Second argument of Object.on must be a function!');
    }
    if(!this[ev]) {
      this[ev] = [];
    }
    this[ev].push(callback);
  }

  // main GameControllers object
  var Controllers = {}, ctrlsEvents = {};
  Controllers.emit = emit.bind(ctrlsEvents);
  Controllers.on = on.bind(ctrlsEvents);
  
  // Controller class
  var Controller = function(pad) {
    var events = [];
    this.emit = emit.bind(events);
    this.on = on.bind(events);
    
    this.raw = pad;
    
    this.label = pad.id.match(/^([^(]+)/)[1] || 'unknow game controller';
    this.vendor = pad.id.match(/Vendor: (.{4})/)[1];
    this.product = pad.id.match(/Product: (.{4})/)[1];
    this.axes = [];
    this.shoulders = [];
    this.buttons = [];
  };
  
  function getPads() {
    return navigator.gamepads || navigator.webkitGamepads || navigator.mozGamepads;
  }
  
  // OS and browser
  var UA = navigator.userAgent;
  var isWindows = (UA.indexOf('Windows NT') != -1)
    , isMac     = (UA.indexOf('Macintosh') != -1)
    , isLinux   = !(isWindows || isMac)
    , isChrome  = (UA.indexOf('Chrome/') != -1)
    , isFirefox = (UA.indexOf('Firefox/') != -1)
    , earlyMoz  = (isFirefox && !getPads());
  
  
  var debug;
  Controllers.debug = function(cb) {
    if(typeof cb == 'function') {
      debug = cb;
    }
    else {
      debug = null;
    }
  };

  // TODO : keep up to date with bug 604039 in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=604039
  // We can't detect support in Firefox for now
  if(earlyMoz) {
    var mozPads = navigator.mozGamepads = [];
    window.addEventListener("MozGamepadConnected", function(e) {
      var i = mozPads.length;
      while(--i>=0) {
        if(mozPads[i] && mozPads[i].index == e.gamepad.index) {
          return mozPads[i] = e.gamepad;
        }
      }
      mozPads.push(e.gamepad);
    });
    window.addEventListener("MozGamepadDisconnected", function(e) {
      var i = mozPads.length;
      while(--i>=0) {
        if(mozPads[i] && mozPads[i].index == e.gamepad.index) {
          return mozPads = navigator.mozGamepads = mozPads.splice(i, 1);
        }
      }
    });
  }

  var ctrls = {};
  Controllers.getControllers = function() {
    return ctrls;
  };
  
  // update called in game loop
  Controllers.update = function(now) {
    if(!now) {
      now = Date.now();
    }
    
    // check change in gamepads
    var pads = getPads();
    var i = pads.length;
    while(--i>=0) {
      if(pads[i]) {
        var j = pads[i].index;
        if(!ctrls[j]) {
          ctrls[j] = new Controller(pads[i]); // TODO : create wrapper instance
          ctrls[j].connected = true;
          Controllers.emit('connection', ctrls[j]);
        }
        else {
          ctrls[j].raw = pads[i];
          ctrls[j].connected = true;
          ctrls[j].emit('reconnect');
        }
        ctrls[j].lastCheck = now;
      }
    }
    i = ctrls.length;
    while(--i>=0) {
      if(ctrls[i]) {
        if(ctrls[i].lastCheck < now && ctrls[i].connected) {
          ctrls[i].connected = false;
          ctrls[i].emit('disconnect');
        }
        else {
          ctrls[i].update(now);
        }
      }
    }
    
    // update connected
    i = ctrls.length;
    //while
  };
  
  var keyboards;
  Controllers.createKeyboard = function(def) {
    
  };
  
  // create a gamepad from multiple others
  Controllers.compose = function() {
    
  };
  
  Controllers.supported = !!getPads();

  window.GameControllers = Controllers;
})();
