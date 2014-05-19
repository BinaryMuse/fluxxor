var Fluxxor = require("../../");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Flux", function() {
  it("allows retrieval of stores", function() {
    var store1 = {};
    var store2 = {};
    var stores = { Store1: store1, Store2: store2 };
    var flux = new Fluxxor.Flux(stores, {});
    expect(flux.store("Store1")).to.equal(store1);
    expect(flux.store("Store2")).to.equal(store2);
  });

  it("sets a 'flux' property on stores", function() {
    var store1 = {};
    var store2 = {};
    var stores = { Store1: store1, Store2: store2 };
    var flux = new Fluxxor.Flux(stores, {});
    expect(store1.flux).to.equal(flux);
    expect(store2.flux).to.equal(flux);
  });

  it("binds actions' `this.dispatch` to the dispatcher", function() {
    var actions = {
      act: function() { this.dispatch("ABC", {val: 123}) }
    };
    var flux = new Fluxxor.Flux({}, actions);
    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.act();
    var action = {type: "ABC", payload: {val: 123}};
    expect(flux.dispatcher.dispatch).to.have.been.calledWith(action);
  })
});
