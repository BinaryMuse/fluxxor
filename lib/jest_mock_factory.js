'use strict';
var _ = require('lodash');
function bindActions(target, actions, binder) {
	for (var key in actions) {
		if (key === 'events') {
			target[key] = actions[key];
			continue;
		}
		if (actions.hasOwnProperty(key)) {
			if (typeof actions[key] === "function") {
				target[key] = actions[key].bind(binder);
			} else if (typeof actions[key] === "object") {
				target[key] = {};
				bindActions(target[key], actions[key], binder);
			}
		}
	}
};

module.exports = function(jest) {
	if (!jest || typeof jest.mock !== 'function') {
		throw new Error('Jest is a required parameter');
	}
	return {
		fakeDispatchBoundActions: function(actions) {
			var result = {};
			bindActions(result, actions, result);
			result.dispatch = jest.genMockFn();
			return result;
		},
		attachFakeFluxToStore: function(store, actions) {
			store.flux = {
				actions: actions
			};
		},
		_fakeFluxStore: function(store) {
			var result = _.assign({}, store);
			_.each(result, function(func, key) {
				if (_.isFunction(func)) {
					result[key] = jest.genMockFn();
				}
			});
			result.on = jest.genMockFn();
			return result;
		},
		transformFluxStoresToFakes: function(stores) {
			_.each(stores, function(store, key) {
				if (_.isFunction(store)) {
					store = new store();
				}
				stores[key] = this._fakeFluxStore(store);
			}, this);
		},
		fakeFluxInstance: function(stores, actions) {
			this.transformFluxStoresToFakes(stores);
			return {
				store: jest.genMockFn().mockImpl(function(name) {
					return stores[name];
				}),
				actions: actions
			}
		},
		mountFluxChildComponent: function(React, flux, child) {
			var FluxMixin = require('fluxxor/lib/flux_mixin')(React),
				Parent = React.createClass({
					mixins: [FluxMixin],
					render: function() {
						return child();
					}
				});
			var parent = React.addons.TestUtils.renderIntoDocument(Parent({ flux: flux }));
			return parent._renderedComponent;
		},
		fakeFluxxor: function(flux) {
			jest.dontMock('util');
			var Fluxxor = require('fluxxor');
			Fluxxor.Flux = jest.genMockFn().mockImpl(function() {
				return flux;
			});
			return Fluxxor;
		}
	}
};
