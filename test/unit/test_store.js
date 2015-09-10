var Fluxxor = require("../../");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    FunctionChainingError = require('../../lib/function_chaining_error');

chai.use(sinonChai);

describe("Store", function() {
  it("passes one object from constructor to initialize", function(done) {
    /* jshint expr:true */
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

  describe("#bindActions", function() {
    it("allows registering actions via an argument list", function() {
      // also tests that methods are autobound to the store instance
      var Store = Fluxxor.createStore({
        actions: {
          "ACTION": "handleAction"
        },

        initialize: function() {
          this.bindActions("ACTION2", "handleAction2",
                          "ACTION3", this.handleAction3);
        },

        handleAction: function() {},
        handleAction2: function() {},
        handleAction3: function() {
          this.value = 42;
        }
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

    it("allows registering actions via a hash", function() {
      var Store = Fluxxor.createStore({
        actions: {
          "ACTION": "handleAction"
        },

        initialize: function() {
          this.bindActions({
            "ACTION2": "handleAction2",
            "ACTION3": this.handleAction3
          });
        },

        handleAction: function() {},
        handleAction2: function() {},
        handleAction3: function() {
          this.value = 42;
        }
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

  it("throws when binding to a falsy action type", function() {
    var Store = Fluxxor.createStore({
      initialize: function() {
        this.bindActions(
          "TYPE_ONE", "handleOne",
          null, "handleTwo"
        );
      }
    });

    expect(function() {
      new Store();
    }).to.throw(/Argument 3.*bindActions.*falsy/);
  });

  it("throws when using a non-function action handler", function() {
    var Store = Fluxxor.createStore({
      actions: {
        "ACTION": "handleAction"
      }
    });

    var store = new Store();
    expect(function() {
      store.__handleAction__({type: "ACTION"});
    }).to.throw(/handler.*type ACTION.*not.*function/);

    expect(function() {
      store.__handleAction__({type: "ACTION2"});
    }).not.to.throw();
  });

  it("throws when binding an action type to a falsy handler", function() {
    var Store = Fluxxor.createStore({
      actions: {
        "ACTION": this.handleAction
      },

      handleAction: function() {}
    });

    expect(function() {
      new Store();
    }).to.throw(/handler.*type ACTION.*falsy/);
  });

  it("Allows use of mixins", function() {
    var value = 0;
    var mixin = {
      actions: {
        "ACTION3": "handleAction3"
      },
      handleAction: function() {
        value++;
      },
      handleAction3: function() {
        value++;
      }
    };
    var mixin2 = {
      handleAction2: function() {
        value++;
      }
    };

    var Store = Fluxxor.createStore({
      mixins: [mixin, mixin2],
      actions: {
        "ACTION": "handleAction",
        "ACTION2": "handleAction2"
      },

      handleAction: function() {
        value++;
      },
      handleAction2: function() {
        value++;
      }
    });
    var store = new Store();

    store.__handleAction__({type: "ACTION"});
    expect(value).to.equal(2);
    store.__handleAction__({type: "ACTION2"});
    expect(value).to.equal(4);
    store.__handleAction__({type: "ACTION3"});
    expect(value).to.equal(5);
  });

  it("Throws errors when incorrectly using mixins", function() {
    var mixin = {
      handleAction: function() {}
    };
    // An error should be thrown when attempting to mix a string with a function.
    var mixin2 = {
      handleAction: "string"
    };

    function createStore(){
      var Store = Fluxxor.createStore({
        mixins: [mixin, mixin2],
        actions: {
          "ACTION": "handleAction"
        },

        handleAction: function() {}
      });
      return new Store();
    }

    expect(createStore).to.throw(
      FunctionChainingError,
      /You are attempting to define `handleAction`.*/
    );
  });
});
