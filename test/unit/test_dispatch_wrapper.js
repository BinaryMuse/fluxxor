var Fluxxor = require("../../"),
    jsdom = require("jsdom");

var chai = require("chai"),
    expect = chai.expect;

var Store = Fluxxor.createStore({
  actions: {
    "ACTIVATE": "handleActivate",
    "LOAD_INITIAL_VALUE": "handleLoadInitialValue"
  },

  initialize: function() {
    this.activated = false;
    this.value = null;
  },

  handleActivate: function() {
    this.activated = true;
    this.emit("change");
  },

  handleLoadInitialValue: function() {
    this.value = "testing";
    this.emit("change");
  }
});

var actions = {
  activate: function(callback) {
    setTimeout(function() {
      try {
        this.dispatch("ACTIVATE");
        callback();
      } catch (ex) {
        callback(ex);
      }
    }.bind(this));
  },

  loadInitialValue: function() {
    this.dispatch("LOAD_INITIAL_VALUE");
  }
};

describe("Dispatch wrapper", function() {
  var React, TestUtils;
  var flux, App, ComponentA, ComponentB;

  beforeEach(function() {
    global.window = jsdom.jsdom().createWindow("<html><body></body></html>");
    global.document = window.document;
    global.navigator = window.navigator;
    React = require("react/addons");
    TestUtils = React.addons.TestUtils;

    flux = new Fluxxor.Flux({store: new Store()}, actions);

    App = React.createClass({
      mixins: [Fluxxor.FluxMixin(React), Fluxxor.StoreWatchMixin("store")],

      getStateFromFlux: function() {
        return {
          activated: this.getFlux().store("store").activated
        };
      },

      render: function() {
        if (!this.state.activated) {
          return React.createElement(ComponentA);
        } else {
          return React.createElement(ComponentB);
        }
      }
    });

    ComponentA = React.createClass({
      mixins: [
        Fluxxor.FluxMixin(React)
      ],

      render: function() {
        return React.DOM.div();
      }
    });

    ComponentB = React.createClass({
      mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin("store")
      ],

      getStateFromFlux: function() {
        return {
          value: this.getFlux().store("store").value
        };
      },

      componentWillMount: function() {
        this.getFlux().actions.loadInitialValue();
      },

      render: function() {
        return React.DOM.div();
      },
    });
  });

  afterEach(function() {
    delete global.window;
    delete global.document;
    delete global.navigator;
    for (var i in require.cache) {
      if (require.cache.hasOwnProperty(i)) {
        delete require.cache[i]; // ugh react why
      }
    }
  });

  it("doesn't wrap by default", function(done) {
    /* jshint expr:true */
    TestUtils.renderIntoDocument(React.createElement(App, {flux: flux}));
    flux.actions.activate(function(err) {
      expect(err).to.match(/dispatch.*another action/);
      done();
    });
  });

  it("allows wrapping", function(done) {
    /* jshint expr:true */
    flux.setDispatchWrapper(React.addons.batchedUpdates);

    TestUtils.renderIntoDocument(React.createElement(App, {flux: flux}));
    flux.actions.activate(function(err) {
      expect(err).to.be.undefined;
      done();
    });
  });
});
