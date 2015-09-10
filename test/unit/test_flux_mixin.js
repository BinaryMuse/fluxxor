var Fluxxor = require("../../"),
    jsdom = require("jsdom");

var chai = require("chai"),
    expect = chai.expect;

function createComponent(React, FluxMixin, FluxChildMixin) {
  var Parent = React.createClass({
    displayName: "Parent",
    mixins: [FluxMixin],

    render: function() {
      return React.createElement(Child);
    }
  });

  var Child = React.createClass({
    displayName: "Child",
    render: function() {
      return React.createElement(Grandchild);
    }
  });

  var Grandchild = React.createClass({
    displayName: "Grandchild",
    mixins: [FluxChildMixin],

    render: function() {
      return React.createElement(GreatGrandchild);
    }
  });

  var GreatGrandchild = React.createClass({
    displayName: "GreatGrandchild",
    mixins: [FluxMixin],

    render: function() {
      return React.DOM.div();
    }
  });

  return {
    Parent: Parent,
    Child: Child,
    Grandchild: Grandchild,
    GreatGrandchild: GreatGrandchild
  };
}

describe("FluxMixin", function() {
  var React, TestUtils, FluxMixin, FluxChildMixin;
  var Parent, Child, Grandchild, GreatGrandchild, flux, objs;

  beforeEach(function() {
    console._warn = console.warn;
    console.warn = function() {};

    var doc = jsdom.jsdom('<html><body></body></html>');
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = window.navigator;
    React = require("react/addons");
    TestUtils = React.addons.TestUtils;
    FluxMixin = Fluxxor.FluxMixin(React);
    FluxChildMixin = Fluxxor.FluxChildMixin(React);
    objs = createComponent(React, FluxMixin, FluxChildMixin);
    Parent = objs.Parent;
    Child = objs.Child;
    Grandchild = objs.Grandchild;
    GreatGrandchild = objs.GreatGrandchild;
    flux = new Fluxxor.Flux({}, {});
  });

  afterEach(function() {
    delete global.window;
    delete global.document;
    delete global.navigator;
    console.warn = console._warn;
  });

  it("passes flux via getFlux() to descendants who ask for it", function() {
    /* jshint expr:true */
    var tree = TestUtils.renderIntoDocument(React.createElement(Parent, {flux: flux}));
    expect(tree.getFlux()).to.equal(flux);
    var child = TestUtils.findRenderedComponentWithType(tree, Child);
    expect(child.getFlux).to.be.undefined;
    var grandchild = TestUtils.findRenderedComponentWithType(tree, Grandchild);
    expect(grandchild.getFlux()).to.equal(flux);
    var greatGrandchild = TestUtils.findRenderedComponentWithType(tree, GreatGrandchild);
    expect(greatGrandchild.getFlux()).to.equal(flux);
  });

  it("throws when it can't find flux on the props or context", function() {
    var Comp = React.createFactory(React.createClass({
      displayName: "TestComponent",
      mixins: [Fluxxor.FluxMixin(React)],
      render: function() { return React.DOM.div(); }
    }));
    expect(function() {
      React.renderToString(Comp());
    }).to.throw(/Could not find flux.*TestComponent/);
  });

  it("throws when attempting to mix in the function directly", function() {
    expect(function() {
      React.createClass({
        mixins: [Fluxxor.FluxMixin],
        render: function() { return React.DOM.div(); }
      });
    }).to.throw(/attempting to use a component class as a mixin/);
  });

  it("gives a deprecation warning when using FluxChildMixin", function() {
    var warned = false;
    console.warn = function(text) {
      if (text.match(/FluxChildMixin.*CompName.*deprecated/)) {
        warned = true;
      } else {
        console._warn(text);
      }
    };

    var Comp = React.createFactory(React.createClass({
      mixins: [Fluxxor.FluxChildMixin(React)],
      displayName: "CompName",
      render: function() { return React.DOM.div(); }
    }));
    React.renderToString(Comp());
    expect(warned).to.equal(true);
  });

  it("throws when attempting to mix in the child function directly", function() {
    expect(function() {
      React.createClass({
        mixins: [Fluxxor.FluxChildMixin],
        render: function() { return React.DOM.div(); }
      });
    }).to.throw(/attempting to use a component class as a mixin/);
  });
});
