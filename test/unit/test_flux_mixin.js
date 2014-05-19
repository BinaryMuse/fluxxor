var Fluxxor = require("../../"),
    jsdom = require("jsdom");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

function createComponent(React, FluxMixin) {
  var Parent = React.createClass({
    mixins: [FluxMixin],

    render: function() {
      return Child();
    }
  });

  var Child = React.createClass({
    render: function() {
      return Grandchild();
    }
  });

  var Grandchild = React.createClass({
    mixins: [Fluxxor.FluxChildMixin(React)],

    render: function() {
      return React.DOM.div();
    }
  });

  return {
    Parent: Parent,
    Child: Child,
    Grandchild: Grandchild
  };
}

describe("FluxMixin", function() {
  var React, TestUtils, FluxMixin, Parent, Child, Grandchild, flux;

  beforeEach(function() {
    global.window = jsdom.jsdom().createWindow("<html><body></body></html>");
    global.document = window.document;
    global.navigator = window.navigator;
    React = require("react/addons");
    TestUtils = React.addons.TestUtils;
    FluxMixin = Fluxxor.FluxMixin(React);
    objs = createComponent(React, FluxMixin);
    Parent = objs.Parent;
    Child = objs.Child;
    Grandchild = objs.Grandchild;
    flux = new Fluxxor.Flux({}, {});
  });

  afterEach(function() {
    delete global.window;
    delete global.document;
    delete global.navigator;
  });

  it("passes flux via getFlux() to descendants who ask for it", function() {
    var tree = TestUtils.renderIntoDocument(Parent({flux: flux}));
    expect(tree.getFlux()).to.equal(flux);
    var child = TestUtils.findRenderedComponentWithType(tree, Child);
    expect(child.getFlux).to.be.undefined;
    var grandchild = TestUtils.findRenderedComponentWithType(tree, Grandchild);
    expect(grandchild.getFlux()).to.equal(flux);
  });

  it("throws when attempting to mix in the function directly", function() {
    var Comp = React.createClass({
      mixins: [Fluxxor.FluxMixin],
      render: function() { return React.DOM.div(); }
    });
    expect(function() {
      React.renderComponentToString(Comp());
    }).to.throw(/FluxMixin.*function/);
  });

  it("throws when attempting to mix in the child function directly", function() {
    var Comp = React.createClass({
      mixins: [Fluxxor.FluxChildMixin],
      render: function() { return React.DOM.div(); }
    });
    expect(function() {
      React.renderComponentToString(Comp());
    }).to.throw(/FluxChildMixin.*function/);
  });
});
