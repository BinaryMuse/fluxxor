var Fluxxor = require("../../");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Dispatcher", function() {
  var store1, store2, dispatcher;
  beforeEach(function() {
    store1 = { __handleAction__: sinon.spy() },
    store2 = { __handleAction__: sinon.spy() }
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
  });

  it("dispatches actions to every store", function() {
    var action = {type: "ACTION", payload: {val: 123}};
    dispatcher.dispatch(action);
    expect(store1.__handleAction__).to.have.been.calledWith(action);
    expect(store2.__handleAction__).to.have.been.calledWith(action);
  });

  it("does not allow dispatching while another action is dispatching", function(done) {
    dispatcher.dispatch();
    expect(function() {
      dispatcher.dispatch();
    }).to.throw(/another action/);

    setTimeout(function() {
      expect(function() {
        dispatcher.dispatch();
      }).not.to.throw();
      done();
    });
  });

  it("allows stores to wait on other stores", function() {
    var callCount = 0;
    var Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store2"], function(store2) {
          this.value = ++callCount;
        });
      }
    });
    var Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.value = ++callCount;
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    dispatcher.dispatch({type: "ACTION"});
    expect(store1.value).to.equal(2);
    expect(store2.value).to.equal(1);
  });

  it("does not allow stores to wait unless an action is being dispatched", function() {
    expect(function() {
      dispatcher.waitForStores()
    }).to.throw(/unless.*action.*dispatch/);
  });

  it("does not allow a store to wait on itself", function() {
    var Store = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store"], function(store2) {
          this.value = ++callCount;
        });
      }
    });
    store = new Store();
    dispatcher = new Fluxxor.Dispatcher({Store: store});
    expect(function() {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/wait.*itself/);
  });

  it("does not allow a store to wait more than once in the same loop", function() {
    var Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store2"], sinon.spy());
        this.waitFor(["Store2"], sinon.spy());
      }
    });
    var Store2 = Fluxxor.createStore({});
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    expect(function() {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/already.*waiting/);
  });

  it("allows a store to wait on a store more than once in different loops", function() {
    var Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store2"], function() {
          this.waitFor(["Store2"], function(store2) {
            this.value = store2.value;
          })
        });
      }
    });
    var Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.value = 42;
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    dispatcher.dispatch({type: "ACTION"});
    expect(store1.value).to.equal(42);
  });

  it("does not allow waiting on non-existant stores", function() {
    var Store = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["StoreFake"], sinon.spy());
      }
    });
    store = new Store();
    dispatcher = new Fluxxor.Dispatcher({Store: store});
    expect(function() {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/wait.*StoreFake/);
  });

  it("detects direct circular dependencies between stores", function() {
    var Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store2"], sinon.spy());
      }
    });
    var Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store1"], sinon.spy());
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    expect(function() {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/circular.*Store2.*Store1/i);
  });

  it("detects indirect circular dependencies between stores", function() {
    var Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store2"], sinon.spy());
      }
    });
    var Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store3"], sinon.spy());
      }
    });
    var Store3 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store1"], sinon.spy());
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    store3 = new Store3();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2, Store3: store3});
    expect(function() {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/circular.*Store1.*Store2.*Store3/i);
  });
});
