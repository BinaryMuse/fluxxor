var _each = require("lodash-node/modern/collection/forEach"),
    _extend = require("lodash-node/modern/object/extend"),
    _isFunction = require("lodash-node/modern/lang/isFunction");

var FluxMixin = require("./flux_mixin");

module.exports = function(React) {
  var FluxController = React.createClass({
    mixins: [FluxMixin(React)],

    propTypes: {
      fluxxorStores: React.PropTypes.arrayOf(
        React.PropTypes.string
      ),
      fluxxorProps: React.PropTypes.func,
      fluxxorExtraContext: React.PropTypes.oneOfType([
        React.PropTypes.object,
        React.PropTypes.func
      ])
    },

    getDefaultProps: function() {
      return {
        fluxxorStores: [],
        fluxxorProps: function() {},
        fluxxorExtraContext: {}
      };
    },

    getStateFromFlux: function(props) {
      props = props || this.props;
      var flux = this.getFlux();
      var extraContext;
      if (_isFunction(this.props.fluxxorExtraContext)) {
        extraContext = this.props.fluxxorExtraContext(flux, this);
      } else {
        extraContext = this.props.fluxxorExtraContext;
      }
      var newState = { fluxProps: this.props.fluxxorProps(flux, props, extraContext) };
      return newState;
    },

    componentDidMount: function() {
      var flux = this.getFlux();
      _each(this.props.fluxxorStores, function(store) {
        flux.store(store).on("change", this._setStateFromFlux);
      }, this);
    },

    componentWillUnmount: function() {
      var flux = this.getFlux();
      _each(this.props.fluxxorStores, function(store) {
        flux.store(store).removeListener("change", this._setStateFromFlux);
      }, this);
    },

    componentWillReceiveProps: function(nextProps) {
      this.setState(this.getStateFromFlux(nextProps));
    },

    _setStateFromFlux: function() {
      if(this.isMounted()) {
        this.setState(this.getStateFromFlux());
      }
    },

    getInitialState: function() {
      return this.getStateFromFlux();
    },

    render: function() {
      var fluxProps = {};
      if (this.state.fluxProps) {
        Object.keys(this.state.fluxProps).forEach(function(key) {
          fluxProps[key] = this.state.fluxProps[key];
        }.bind(this));
      }
      if (this.props) {
        Object.keys(this.props).forEach(function(key) {
          fluxProps[key] = this.props[key];
        }.bind(this));
      }

      delete fluxProps.fluxxorStores;
      delete fluxProps.fluxxorProps;
      delete fluxProps.fluxxorExtraContext;

      if (this.props.render) {
        return this.props.render(fluxProps);
      }

      return React.createElement("div", {}, React.Children.map(this.props.children, function(child) {
        return React.cloneElement(child, fluxProps);
      }, this));
    }
  });

  FluxController.wrap = function(comp, stores, fluxProps, extraContext) {
    return React.createClass({
      render: function() {
        var props = _extend({}, this.props, {
          fluxxorStores: stores,
          fluxxorProps: fluxProps,
          fluxxorExtraContext: extraContext,
          render: function(fProps) {
            return React.createElement(comp, fProps);
          }
        });
        return React.createElement(FluxController, props);
      }
    });
  };

  FluxController.wrapStatic = function(comp, extraContext) {
    return FluxController.wrap(
      comp,
      comp.fluxxorStores,
      comp.fluxxorProps,
      extraContext
    );
  };

  return FluxController;
};
