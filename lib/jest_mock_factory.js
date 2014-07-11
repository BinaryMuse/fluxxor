'use script';
var _ = require('lodash');

// helper function to fake bound actions for testing actions in isolation
function _bindActions(target, actions, binder) {
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
				_bindActions(target[key], actions[key], binder);
			}
		}
	}
};

// helper function to fake a flux store for a React component
function _fakeFluxStore(jest, store) {
	var result = _.assign({}, store);
	_.each(result, function(func, key) {
		if (_.isFunction(func)) {
			result[key] = jest.genMockFn();
		}
	});
	result.on = jest.genMockFn();
	return result;
};
function _transformFluxStoresToFakes(jest, stores) {
	_.each(stores, function(store, key) {
		if (_.isFunction(store)) {
			store = new store();
		}
		stores[key] = _fakeFluxStore(jest, store);
	}, this);
	return stores;
};

module.exports = function(jest) {
	if (!jest || typeof jest.genMockFn !== 'function') {
		throw new Error('valid jest parameter required');
	}
	return {
		// method to fake bound actions to test them in isolation. need to refactor this so that `this` context
		// is not bound to the actions as it will not be bound when the dispatcher is bound to the actions in
		// actual fluxxor code
		fakeBoundActions: function(actions) {
			var result = {};
			_bindActions(result, actions, result);
			result.dispatch = jest.genMockFn();
			return result;
		},
		// method to allow testing for stores in isolation
		attachFakeFluxToStore: function(store, stores, actions) {
			_transformFluxStoresToFakes(jest, stores);
			store.flux = {
				actions: actions
			};
			store.waitFor = function(names, callback) {
				var waits = names.map(function(name) {
						return stores[name];
					});
				callback.apply(store, waits);
			};
		},
		// fakes a flux instance to pass into a React parent or child component
		fakeFluxInstance: function(stores, actions) {
			_transformFluxStoresToFakes(jest, stores);
			return {
				store: jest.genMockFn().mockImpl(function(name) {
					return stores[name];
				}),
				actions: actions
			}
		},
		// mount a child React component and set it's context.flux for testing a child component in isolation
		mountFluxChildComponent: function(React, flux, child, props) {
			var FluxMixin = require('fluxxor/lib/flux_mixin')(React),
				Parent = React.createClass({
					mixins: [FluxMixin],
					render: function() {
						return child(props);
					}
				});
			var parent = React.addons.TestUtils.renderIntoDocument(Parent({ flux: flux }));
			var child = parent._renderedComponent;
			// we're overriding the setProps method because React will throw an invariant violation error when trying to
			// setProps of a child component
			child.setProps = function(props) {
				this.props = _.assign({}, props);
				this.setState();
			}
			return child;
		},
		// mock the Fluxxor.Flux method for instantiating a mock flux to test the instantiation of a Flux
		// application in isolation
		fakeFluxxor: function(flux) {
			jest.dontMock('util');
			var Fluxxor = require('fluxxor');
			Fluxxor.Flux = jest.genMockFn().mockImpl(function() {
				return flux;
			});
			return Fluxxor;
		},
		// a method to mock a child React component in order to test the parent React in isolation.
		fakeComponent: function(componentPath, result) {
			var fakeComponent;
			fakeComponent = jest.genMockFn();
			if (_.isArray(mockComponent)) {
				fakeComponent.mockImpl(function() {
					return mockComponent[fakeComponent.mock.calls.length - 1];
				});
			} else {
				fakeComponent.mockReturnValue(mockComponent);
			}
			jest.setMock(componentPath, fakeComponent);
			return fakeComponent;
		},
		// a method to create a fake event. useful for asseting that .stopPropagation() is called
		fakeEvent: function() {
			return {
				stopPropagation: jest.genMockFn()
			};
		},
		// fake a kew promise
		fakePromise: function() {
			return require('kew').defer();
		}
	}
};
