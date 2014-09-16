var Fluxxor = require("../../");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Dispatcher", function() {
  var store1, store2, dispatcher;

  beforeEach(function() {
    var handleActionStub = sinon.stub();
    handleActionStub.returns(true);

    store1 = { __handleAction__: handleActionStub };
    store2 = { __handleAction__: sinon.spy() };
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
  });

  it("dispatches actions to every store", function() {
    var action = {type: "ACTION", payload: {val: 123}};
    dispatcher.dispatch(action);
    expect(store1.__handleAction__).to.have.been.calledWith(action);
    expect(store2.__handleAction__).to.have.been.calledWith(action);
  });

  it("does not allow cascading dispatches", function(done) {
    store1.__handleAction__ = function() {
      expect(function() {
        dispatcher.dispatch({type:"action"});
      }).to.throw(/another action/);
      done();
      return true;
    };
    dispatcher.dispatch({type:"action"});
  });

  it("allows back-to-back dispatches on the same tick", function() {
    dispatcher.dispatch({type:"action"});
    expect(function() {
      dispatcher.dispatch({type:"action"});
    }).not.to.throw();
  });

  it("gracefully handles exceptions in the action handlers", function() {
    var thrw = true;
    store1.__handleAction__ = function() {
      if (thrw) {
        throw new Error("omg");
      }
      return true;
    };

    expect(function() {
      dispatcher.dispatch({type:"action"});
    }).to.throw("omg");

    expect(function() {
      thrw = false;
      dispatcher.dispatch({type:"action"});
    }).not.to.throw();
  });

  it("throws when asked to dispatch an action with to 'type' property", function() {
    expect(function() {
      dispatcher.dispatch();
    }).to.throw(/dispatch.*type/);

    expect(function() {
      dispatcher.dispatch(false);
    }).to.throw(/dispatch.*type/);

    expect(function() {
      dispatcher.dispatch("");
    }).to.throw(/dispatch.*type/);

    expect(function() {
      dispatcher.dispatch(null);
    }).to.throw(/dispatch.*type/);

    expect(function() {
      dispatcher.dispatch({});
    }).to.throw(/dispatch.*type/);
  });

  it("allows stores to wait on other stores", function() {
    var callCount = 0;
    var Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store2"], function() {
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
      dispatcher.waitForStores();
    }).to.throw(/unless.*action.*dispatch/);
  });

  it("does not allow a store to wait on itself", function() {
    var Store = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {
        this.waitFor(["Store"], function() {
        });
      }
    });
    var store = new Store();
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
          });
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
    var store = new Store();
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
    var store3 = new Store3();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2, Store3: store3});
    expect(function() {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/circular.*Store1.*Store2.*Store3/i);
  });

  it("warns if a dispatched action is not handled by any store", function() {
    /* jshint -W030 */
    var warnStub = sinon.stub(console, "warn");

    var Store1 = Fluxxor.createStore({});
    var Store2 = Fluxxor.createStore({});

    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    dispatcher.dispatch({type: "ACTION"});

    expect(warnStub).to.have.been.calledOnce;

    warnStub.restore();
  });

  it("doesn't warn if a dispatched action is handled by any store", function() {
    /* jshint -W030 */
    var warnStub = sinon.stub(console, "warn");

    var Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction: function() {}
    });
    var Store2 = Fluxxor.createStore({});

    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    dispatcher.dispatch({type: "ACTION"});

    expect(warnStub).to.have.not.been.called;

    warnStub.restore();
  });
});
