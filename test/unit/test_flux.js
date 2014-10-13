var Fluxxor = require("../../");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Flux", function() {
  it("allows retrieval of stores added by constructor", function() {
    var store1 = {};
    var store2 = {};
    var stores = { Store1: store1, Store2: store2 };
    var flux = new Fluxxor.Flux(stores, {});
    expect(flux.store("Store1")).to.equal(store1);
    expect(flux.store("Store2")).to.equal(store2);
  });

  it("allows retrieval of stores added by addStores", function() {
    var store1 = {};
    var store2 = {};
    var stores = { Store1: store1, Store2: store2 };
    var flux = new Fluxxor.Flux({}, {});
    flux.addStores(stores);
    expect(flux.store("Store1")).to.equal(store1);
    expect(flux.store("Store2")).to.equal(store2);
  });

  it("allows retrieval of stores added by addStore", function() {
    var store1 = {};
    var store2 = {};
    var flux = new Fluxxor.Flux({}, {});
    flux.addStore("Store1", store1);
    flux.addStore("Store2", store2);
    expect(flux.store("Store1")).to.equal(store1);
    expect(flux.store("Store2")).to.equal(store2);
  });

  it("does not allow duplicate stores", function() {
    var store1 = {};
    var flux = new Fluxxor.Flux({}, {});
    flux.addStore("Store1", store1);
    expect(function() {
      flux.addStore("Store1", {});
    }).to.throw(/store.*Store1.*already exists/);
    expect(flux.store("Store1")).to.equal(store1);
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
      act: function() { this.dispatch("ABC", {val: 123}); }
    };
    var flux = new Fluxxor.Flux({}, actions);
    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.act();
    var action = {type: "ABC", payload: {val: 123}};
    expect(flux.dispatcher.dispatch).to.have.been.calledWith(action);
  });

  it("binds actions' `this.flux` to the flux instance", function(done) {
    var flux,
        actions = {
          act: function() {
            expect(this.flux).to.equal(flux);
            done();
          }
        };

    flux = new Fluxxor.Flux({}, actions);
    flux.actions.act();
  });

  it("allows namespaced actions", function() {
    var actions = {
      a: {
        b: {
          c: function() { this.dispatch("action", {name: "a.b.c"}); }
        },
        d: function() { this.dispatch("action", {name: "a.d"}); }
      },
      e: function() { this.dispatch("action", {name: "e"}); }
    };
    var flux = new Fluxxor.Flux({}, actions);
    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.e();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "e"}});
    flux.actions.a.d();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.d"}});
    flux.actions.a.b.c();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b.c"}});
  });

  it("allows adding actions after Flux creation via addActions", function() {
    var actions = {
      a: {
        b: {
          c: function() { this.dispatch("action", {name: "a.b.c"}); }
        },
        d: function() { this.dispatch("action", {name: "a.d"}); }
      },
      e: function() { this.dispatch("action", {name: "e"}); }
    };
    var flux = new Fluxxor.Flux({}, {});
    flux.addActions(actions);
    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.e();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "e"}});
    flux.actions.a.d();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.d"}});
    flux.actions.a.b.c();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b.c"}});
  });

  it("allows adding actions after Flux creation via addAction", function() {
    var actions = {
      a: {
        b: {
          c: function() { this.dispatch("action", {name: "a.b.c"}); }
        },
        d: function() { this.dispatch("action", {name: "a.d"}); }
      },
      e: function() { this.dispatch("action", {name: "e"}); }
    };
    var flux = new Fluxxor.Flux({}, actions);
    flux.addAction("f", function() { this.dispatch("action", {name: "f"}); });
    flux.addAction("a", "b", "g", function() { this.dispatch("action", {name: "a.b.g"}); });
    flux.addAction("h", "i", "j", function() { this.dispatch("action", {name: "h.i.j"}); });
    flux.addAction(["k", "l", "m"], function() { this.dispatch("action", {name: "k.l.m"}); });
    flux.dispatcher.dispatch = sinon.spy();

    flux.actions.f();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "f"}});
    flux.actions.a.b.g();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b.g"}});
    flux.actions.h.i.j();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "h.i.j"}});
    flux.actions.k.l.m();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "k.l.m"}});
  });

  it("does not allow replacing namespaces with actions", function() {
    var actions = {
      a: {
        b: function() { this.dispatch("action", {name: "a.b"}); }
      }
    };
    var flux = new Fluxxor.Flux({}, actions);
    expect(function() {
      flux.addAction("a", function() { this.dispatch("action", {name: "a.z"}); });
    }).to.throw(/namespace.*a.*already exists/);

    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.a.b();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b"}});
  });

  it("does not allow replacing actions", function() {
    var actions = {
      a: {
        b: function() { this.dispatch("action", {name: "a.b"}); }
      }
    };
    var flux = new Fluxxor.Flux({}, actions);
    expect(function() {
      flux.addAction("a", "b", "c", function() { this.dispatch("action", {name: "a.b.c"}); });
    }).to.throw(/action.*a\.b.*already exists/);
    expect(function() {
      flux.addAction("a", "b", function() { this.dispatch("action", {name: "a.b.c"}); });
    }).to.throw(/action.*a\.b.*exists/);

    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.a.b();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b"}});
  });

  it("deeply merges with existing actions", function() {
    var actions = {
      a: {
        b: function() { this.dispatch("action", {name: "a.b"}); },
        c: {
          d: function() { this.dispatch("action", {name: "a.c.d"}); },
        }
      }
    };
    var flux = new Fluxxor.Flux({}, actions);

    flux.addAction("a", "c", "e", function() { this.dispatch("action", {name: "a.c.e"}); });

    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.a.c.e();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.c.e"}});
  });

  it("throws when using addAction incorrectly", function() {
    var flux = new Fluxxor.Flux({}, {});

    expect(function() {
      flux.addAction();
    }).to.throw(/two arguments/);

    expect(function() {
      flux.addAction("a");
    }).to.throw(/two arguments/);

    expect(function() {
      flux.addAction("a", "b");
    }).to.throw(/last argument.*function/);

    expect(function() {
      flux.addAction("a", function(){}, "b");
    }).to.throw(/last argument.*function/);
  });

  describe("emitting dispatching", function() {
    beforeEach(function() {
      sinon.stub(console, "warn");
    });

    afterEach(function() {
      console.warn.restore();
    });

    it("emits an event when dispatching an action", function() {
      /* jshint -W030 */
      var payload1 = {payload: "1", thing: [1, 2, 3]},
          payload2 = {payload: "2", thing: [1, 2, 3]},
          actions = {
            a: function() { this.dispatch("ACTION_1", payload1); },
            b: function() { this.dispatch("ACTION_2", payload2); }
          };

      var flux = new Fluxxor.Flux({}, actions);

      var spy1 = sinon.spy(),
          spy2 = sinon.spy(),
          callback = function(type, payload) {
            if (type === "ACTION_1") { spy1(payload); }
            if (type === "ACTION_2") { spy2(payload); }
          };

      flux.on("dispatch", callback);

      flux.actions.a();
      expect(spy1).to.have.been.calledWith(payload1);
      expect(spy2).not.to.have.been.called;
      flux.actions.b();
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledWith(payload2);
    });
  });
});
