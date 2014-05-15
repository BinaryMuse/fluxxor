var expect = require("chai").expect;

var Fluxbox = require("../");

function createFlux() {
  var PiStore = Fluxbox.createStore({
    initialize: function() {
      this.value = 0;
      this.bindActions("CALCULATE", this.handleCalculate);
    },

    handleCalculate: function() {
      this.value = Math.PI;
      this.emit("change");
    },

    getPi: function() {
      return this.value;
    }
  });

  var CircleAreaStore = Fluxbox.createStore({
    initialize: function() {
      this.value = 0;
      this.bindActions("CALCULATE", this.handleCalculate);
    },

    handleCalculate: function(payload) {
      this.waitFor(["PiStore"], function(piStore) {
        // this.value = piStore.getPi() * payload.radius * payload.radius;
        // this.emit("changed");
        console.log("ONE");
        this.waitFor(["PiStore"], function(piStore) {
          console.log("TWO");
          this.waitFor(["PiStore"], function(piStore) {
            console.log("THREE");
            this.value = piStore.getPi() * payload.radius * payload.radius;
            this.emit("changed");
          })
        })
      });
    },

    getArea: function() {
      return this.value;
    }
  });

  var stores = {
    CircleAreaStore: new CircleAreaStore(),
    PiStore: new PiStore()
  };

  var actions = {
    calculate: function(radius) {
      this.dispatch("CALCULATE", {radius: radius});
    }
  };

  return new Fluxbox.Flux(stores, actions);
}

describe("Waiting on other stores", function() {
  var flux;
  beforeEach(function() {
    flux = createFlux();
  });

  it.only("waits on other stores to finish processing an action", function(done) {
    var areaStore = flux.store("CircleAreaStore");
    expect(areaStore.getArea()).to.equal(0);
    areaStore.on("changed", function() {
      expect(areaStore.getArea()).to.equal(Math.PI * 2 * 2);
      done();
    });
    flux.actions.calculate(2);
  });
});
