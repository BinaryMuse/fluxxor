var Fluxxor = require("../../");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Store", function() {
  it("passes one object from constructor to initialize", function(done) {
    var Store = Fluxxor.createStore({
      initialize: function(opt, nothing) {
        expect(opt).to.equal(42);
        expect(nothing).to.be.undefined;
        done();
      }
    });
    new Store(42, 100);
  });

  it("copies properties from the spec", function() {
    var Store = Fluxxor.createStore({
      answer: {is: 42}
    });
    var store = new Store();
    expect(store.answer).to.eql({is: 42});
  });

  it("disallows reserved property names", function() {
    expect(function() {
      Fluxxor.createStore({
        flux: true
      });
    }).to.throw(/reserved.*flux/i);

    expect(function() {
      Fluxxor.createStore({
        waitFor: true
      });
    }).to.throw(/reserved.*waitFor/i);
  });

  it("allows registering actions via an actions hash", function() {
    var Store = Fluxxor.createStore({
      actions: {
        "ACTION": "handleAction"
      },

      handleAction: function() {}
    });
    var store = new Store();
    store.handleAction = sinon.spy();
    var payload = {val: 42};
    store.__handleAction__({type: "ACTION", payload: payload});
    expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
  });

  it("allows registering actions via bindActions", function() {
    // also tests that methods are autobound to the store instance
    var Store = Fluxxor.createStore({
      actions: {
        "ACTION": "handleAction"
      },

      initialize: function() {
        this.bindActions("ACTION2", "handleAction2",
                         "ACTION3", this.handleAction3)
      },

      handleAction: function() {},
      handleAction2: function() {},
      handleAction3: function() {
        this.value = 42;
      },
    });
    var store = new Store();
    store.handleAction = sinon.spy();
    store.handleAction2 = sinon.spy();
    var payload = {val: 42};
    store.__handleAction__({type: "ACTION", payload: payload});
    expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
    store.__handleAction__({type: "ACTION2", payload: payload});
    expect(store.handleAction2).to.have.been.calledWith(payload, "ACTION2");
    store.__handleAction__({type: "ACTION3", payload: payload});
    expect(store.value).to.equal(42);
  });
});
