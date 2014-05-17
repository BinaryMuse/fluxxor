var expect = require("chai").expect;

var Fluxbox = require("../");

function createFlux() {
  var INC_ACTION = "INCREMENT",
      DEC_ACTION = "DECREMENT";

  var MyStore = Fluxbox.createStore({
    initialize: function(options) {
      this.value = options.value;
      this.bindActions(INC_ACTION, this.handleIncrement,
                       DEC_ACTION, "handleDecrement");
    },

    handleIncrement: function(payload) {
      this.value = this.value + payload.amount;
      this.emit("change");
    },

    handleDecrement: function(payload) {
      this.value = this.value - payload.amount;
      this.emit("change");
    },

    getValue: function() {
      return this.value;
    }
  });

  var stores = {
    "FirstStore": new MyStore({value: 1}),
    "SecondStore": new MyStore({value: 2})
  };

  var actions = {
    increment: function(amount) {
      this.dispatch(INC_ACTION, {amount: amount});
    },

    decrement: function(amount) {
      this.dispatch(DEC_ACTION, {amount: amount});
    }
  };

  return new Fluxbox.Flux(stores, actions);
}

describe("Flux", function() {
  var flux;
  beforeEach(function() {
    flux = createFlux();
  });

  it("increments", function(done) {
    changeEvents = 0;
    var firstStore = flux.store("FirstStore"),
        secondStore = flux.store("SecondStore"),
        changeEvents = 0,
        handleChange = function() {
          if (++changeEvents == 2) {
            expect(firstStore.getValue()).to.equal(3);
            expect(secondStore.getValue()).to.equal(4);
            done();
          }
        };
    expect(firstStore.getValue()).to.equal(1);
    expect(secondStore.getValue()).to.equal(2);
    firstStore.once("change", handleChange);
    secondStore.once("change", handleChange);
    flux.actions.increment(2);
  });

  it("decrements", function(done) {
    changeEvents = 0;
    var firstStore = flux.store("FirstStore"),
        secondStore = flux.store("SecondStore"),
        changeEvents = 0,
        handleChange = function() {
          if (++changeEvents == 2) {
            expect(firstStore.getValue()).to.equal(-1);
            expect(secondStore.getValue()).to.equal(0);
            done();
          }
        };
    expect(firstStore.getValue()).to.equal(1);
    expect(secondStore.getValue()).to.equal(2);
    firstStore.once("change", handleChange);
    secondStore.once("change", handleChange);
    flux.actions.decrement(2);
  });
});
