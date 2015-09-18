Version 1.7.3
=============

* Fix `bind` warning when using `StoreWatchMixin` with `createClass` (#140)

Version 1.7.2
=============

* Update `StoreWatchMixin` to support ES6 classes (#135)

Version 1.7.1
=============

* Relax restrictions on Lodash version (#128)

Version 1.7.0
=============

* Add `Flux#getAllStores()` to retrieve all currently registered stores (#127)

Version 1.6.0
=============

* Add `Flux#setDispatchInterceptor` to wrap or replace dispatch functionality (#100, #92)

Version 1.5.4
=============

* Fix incompatibility with Lodash 3.9.0

Version 1.5.3
=============

* Use built-in inherits instead of npm package (#116)

Version 1.5.2
=============

* Upgrade to Lo-Dash 3.x
* Fix minor typo in mixin warnings

Version 1.5.1
=============

* Watch stores in `componentDidMount` instead of `componentWillMount` to make it harder to leak memory on the server

Version 1.5.0
=============

**Additions/Non-Breaking Changes**

* You can add stores and actions to existing Flux instances via `addStore`, `addStores`, `addAction`, and `addActions` (#68, #71, #77)
* `Flux` instances are now EventEmitters, and emit a `"dispatch"` event (with `type` and `payload` arguments) when an action calls `this.dispatch(type, payload)`, useful for cross-cutting concerns like logging
* `Store#bindActions` now takes a hash (similar to the static `actions` hash) in addition to an argument list (#51, #78)
* Fluxxor will throw more descriptive errors in many situations that are obviously incorrect (for example, when an action handler is not defined, or an action type in `bindActions` is falsy)

**Deprecations**

* `Fluxxor.FluxChildMixin` is now deprecated; instead, use `FluxMixin` anywhere you want access to `getFlux()` (#59)

Version 1.4.2
=============

* Throw an error when binding to a falsy action type (#50)
* Reduce npm package size with `.npmignore` (#65)
* Warn if a dispatch is not handled by any store (#66)
* Reduce file size slightly by using [EventEmitter3](https://github.com/3rd-Eden/EventEmitter3) instead of Node.js `events` module

Version 1.4.1
=============

* Reduce file size by generating a smaller version file (#63) and using inherits package (#64)

Version 1.4.0
=============

* Action generating methods (methods in the `actions` parameter to the `Fluxxor.Flux` constructor) can access the `Flux` instance via `this.flux`.

Version 1.3.2
=============

* Ensure component is mounted before setting state in in StoreWatchMixin

Version 1.3.1
=============

* Fix Bower versioning

Version 1.3.0
=============

* Add support for namespaced actions

Version 1.2.2
=============

* Maintain references to stores on Flux object

Version 1.2.1
=============

* Throw when dispatching a value without a `type` property

Version 1.2.0
=============

* Allow synchronous back-to-back dispatches
* Gracefully handle exceptions in action handlers
* Add hasOwnProperty(key) checks throughout codebase

Version 1.1.3
=============

* Add [Bower](http://bower.io/) support

Version 1.1.2
=============

* Fix compilation when using webpack (#9)

Version 1.1.1
=============

* Reduce bundle size by 40%

Version 1.1.0
=============

* Add `FluxChildMixin` to access flux on child components
* Use `getFlux()` to access flux with either `FluxMixin` or `FluxChildMixin`

Version 1.0.2
=============

* Documentation updates

Version 1.0.1
=============

* Throw when mixing `StoreWatchMixin` in without calling it as a function

Version 1.0.0
=============

First stable release
