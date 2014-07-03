var Fluxxor = require("../../"),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    jsdom = require("jsdom");

var chai = require("chai"),
    expect = chai.expect;

describe("FluxMixin", function() {
  var SwappedComponent, createComponent, React, TestUtils, Comp, FluxMixin, FluxChildMixin, flux;

  beforeEach(function() {

    global.window = jsdom.jsdom().createWindow("<html><body></body></html>");
    global.document = window.document;
    global.navigator = window.navigator;
    for (var i in require.cache) {
      if(true) {
        delete require.cache[i];
      }
    }
    React = require("react/addons");
    TestUtils = React.addons.TestUtils;
    FluxMixin = Fluxxor.FluxMixin(React);
    FluxChildMixin = Fluxxor.FluxChildMixin(React);

    SwappedComponent = React.createClass({
      mixins: [FluxChildMixin, StoreWatchMixin("Store1")],

        getStateFromFlux: function() {
          return {
            store1state: this.getFlux().store("Store1").getState(),
          };
        },

        render: function() {
          return React.DOM.div(null, [
            React.DOM.span({key: 1}, String(this.state.store1state.value)),
            ]);
        }
    });

    createComponent = function createComponent(React) {
      var Component = React.createClass({
        mixins: [FluxMixin, StoreWatchMixin("Store1", "Store2")],

          getStateFromFlux: function() {
            this.getStateCalls = this.getStateCalls || 0;
            this.getStateCalls++;
            return {
              store1state: this.getFlux().store("Store1").getState(),
              store2state: this.getFlux().store("Store2").getState()
            };
          },

          render: function() {
            if(this.state.store1state.value === 0) {
              return React.DOM.div(null, SwappedComponent());
            }
            return React.DOM.div(null, [
              React.DOM.span({key: 1}, String(this.state.store1state.value)),
              React.DOM.span({key: 2}, String(this.state.store2state.value))
              ]);
          }
      });

      return Component;
    };

    var Store = Fluxxor.createStore({
      actions: {
        "ACTION": "handleAction"
      },

        initialize: function() {
          this.value = 0;
        },

        handleAction: function() {
          this.value++;
          this.emit("change");
        },

        getState: function() {
          return { value: this.value };
        }
    });

    var stores = {
      Store1: new Store(),
      Store2: new Store()
    };
    var actions = {
      act: function() {
        this.dispatch("ACTION", {});
      }
    };

    flux = new Fluxxor.Flux(stores, actions);
    
    Comp = createComponent(React);
  });

  afterEach(function() {
    delete global.window;
    delete global.document;
    delete global.navigator;
  });

  it("watches for store change events until the component is unmounted", function(done) {
    var tree = TestUtils.renderIntoDocument(Comp({flux: flux}));
    expect(tree.getStateCalls).to.eql(1);
    expect(tree.state).to.eql({store1state: {value: 0}, store2state: {value: 0}});
    flux.actions.act();
    expect(tree.getStateCalls).to.eql(3);
    expect(tree.state).to.eql({store1state: {value: 1}, store2state: {value: 1}});
    React.unmountComponentAtNode(tree.getDOMNode().parentNode);
    setTimeout(function() {
      flux.actions.act();
      expect(tree.getStateCalls).to.eql(3);
      expect(tree.state).to.eql({store1state: {value: 1}, store2state: {value: 1}});
      done();
    });
  });

  
  it("throws when attempting to mix in the function directly", function() {
    var Comp = React.createClass({
      mixins: [Fluxxor.StoreWatchMixin],
      render: function() { return React.DOM.div(); }
    });
    expect(function() {
      React.renderComponentToString(Comp());
    }).to.throw(/StoreWatchMixin.*function/);
  });
  
});
