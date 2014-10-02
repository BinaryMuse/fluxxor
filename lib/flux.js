var Dispatcher = require("./dispatcher");

function bindActions(target, actions, dispatchBinder) {
  for (var key in actions) {
    if (actions.hasOwnProperty(key)) {
      if (typeof actions[key] === "function") {
        if (target[key] === undefined) {
          target[key] = actions[key].bind(dispatchBinder);
        } else {
          // TODO: pass in the sequence of keys by which we arrived here to provide in the error
          throw new Error("An action by the name of '" + key + "' already exists here");
        }
      } else if (typeof actions[key] === "object") {
        if (typeof target[key] === "function") {
          throw new Error("An action by the name of '" + key + "' already exists where namespace was expected");
        } else if (target[key] === undefined) {
          target[key] = {}; 
        }
        bindActions(target[key], actions[key], dispatchBinder);
      }   
    }   
  }
}

var Flux = function(stores, actions) {
  this.dispatcher = new Dispatcher(stores);
  this.actions = {};
  this.stores = {};

  this.addActions(actions);
  this.addStores(stores);

};

Flux.prototype.addActions = function(actions) {
  var dispatcher = this.dispatcher,
      dispatchBinder = { 
        flux: this,
        dispatch: function(type, payload) {
          dispatcher.dispatch({type: type, payload: payload});
        }
      };  
  
  bindActions(this.actions, actions, dispatchBinder);
};

// addAction has two signatures:
// 1: string[, string, string, string...], actionFunction
// 2: arrayOfStrings, actionFunction
Flux.prototype.addAction = function() {
  if (arguments.length < 2) {
    throw new Error("addAction requires at least two arguments, a string (or array of strings), and a function");
  }
  var hasSignature1 = typeof arguments[0] === "string";
  if (hasSignature1) {
    var args = []; 
    for (var i = 0; i<arguments.length; i++) {
      if (typeof arguments[i] === "string") {
        args.push(arguments[i]);
      } else if (typeof arguments[i] === "function" && i===arguments.length-1) {
        return this.addAction(args, arguments[i]);
      } else {
        throw new Error("didn't understand argument " + (i+1) + " to addAction");
      }   
    }   
    throw new Error("didn't find action function in " + arguments.length + " arguments to addAction");
  } else {
    var keys = arguments[0];
    var actionFunc = arguments[1];
    var actions = {}; 
    actions[keys.pop()] = actionFunc;
    while (keys.length) {
      var key = keys.pop();
      var outer = {}; 
      outer[key] = actions;
      actions = outer;
    }
    this.addActions(actions);
  }
};

Flux.prototype.store = function(name) {
  return this.stores[name];
};

Flux.prototype.addStore = function(name, store) {
  if (name in this.stores) {
    throw new Error("A store keyed by '" + name + "' already exists");
  }
  store.flux = this;
  this.stores[name] = store;
  this.dispatcher.addStore(name, store);
};

Flux.prototype.addStores = function(stores) {
  for (var key in stores) {
    if (stores.hasOwnProperty(key)) {
      this.addStore(key, stores[key]);
    }
  }
};

module.exports = Flux;
