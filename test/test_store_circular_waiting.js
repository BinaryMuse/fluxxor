var expect = require("chai").expect;

var Fluxbox = require("../");

function createStore(storeNameToWaitOn) {
  return Fluxbox.createStore({
    actions: {
      "ACTION": "handleAction"
    },

    handleAction: function() {
      this.waitFor([storeNameToWaitOn], function() {});
    }
  });
}

function createDirectCircularFlux() {
  var Store1 = createStore("Store2");
  var Store2 = createStore("Store1");

  var stores = {
    Store1: new Store1(),
    Store2: new Store2(),
  };

  var actions = {
    action: function() {
      this.dispatch("ACTION");
    }
  };

  return new Fluxbox.Flux(stores, actions);
}

function createIndirectCircularFlux() {
  var Store1 = createStore("Store4");
  var Store2 = createStore("Store1");
  var Store3 = createStore("Store2");
  var Store4 = createStore("Store3");

  var stores = {
    Store1: new Store1(),
    Store2: new Store2(),
    Store3: new Store3(),
    Store4: new Store4()
  };

  var actions = {
    action: function() {
      this.dispatch("ACTION");
    }
  };

  return new Fluxbox.Flux(stores, actions);
}

describe("Circular waitFor dependencies", function() {
  it("detects direct circular waitFor calls", function() {
    var flux = createDirectCircularFlux();
    expect(function directCircularWaitFor() {
      flux.actions.action();
    }).to.throw("Circular");
  });

  xit("detects indirect circular waitFor calls", function() {
    var flux = createIndirectCircularFlux();
    // expect(function indirectCircularWaitFor() {
      flux.actions.action();
    // }).to.throw("Circular");
  });
});
