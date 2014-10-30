---
title: What is Flux?
template: page.ejs
---

What is Flux?
=============

Flux is an architecture for creating data layers in JavaScript applications. It was designed at Facebook along with the [React](http://facebook.github.io/react/) view library.

Flux is an alternative to the "M" and "C" in the MVC architecture. In a client-side MVC application, a user interaction triggers code in a controller, which then coordinates changes to one or more models by calling methods on the model. When the models change, they notify one or more views, which in turn read the new data from the models and update themselves accordingly so that the user can see that new data.

![Simple MVC](/images/mvc-simple.png?1)

As your application grows and you add nested views, controllers to go with them, and additional models, the dependencies become more complex.

![Complex MVC](/images/mvc-complex.png?1)

With the addition of just three views, one controller, and one model, the dependency graph is already harder to trace. When the user interacts with the UI, there are several potential code paths, and debugging errors in application state becomes an exercise in figuring out which of these potential code paths contains a bug. Furthermore, it's common to watch for changes on only select model fields, performing finer-grained view updates when these changes occur. Finally, in the worst cases, a user interaction will trigger updates which trigger additional updates, resulting in an error-prone and difficult-to-debug cascading effect.

Flux eschews this design in favor of a one-way data flow:</p>

![Simple Flux](/images/flux-simple.png?1)

All user interactions within a view call an *action creator*, which causes an *action* event to be emitted from a singleton *dispatcher*. The dispatcher is a single-point-of-emission for all actions. The dispatcher also prevents cascading updates by ensuring that only one action can be dispatched at a time. The action is sent from the dispatcher to the *stores*, which update themselves in response to the action.

In a React application, a top-level view (known as a "controller-view") will read the stores' new data and pass it down to child components as necessary. Child components that need to update the application state will either call a function passed to it by a parent component or use an action creator to dispatch another action.

![Complex Flux](/images/flux-complex.png?1)

The dispatcher sends every action to *all* the stores in the application. Note that it does not contain knowledge about how to actually update the stores—the stores themselves contain this business logic. Each store is responsible for a domain of the application, and synchronously update themselves only in response to actions; they have no public properties or setter functions. When a store updates, it emits a change event, which signals to any controller-views that new data is available. In a React application, this generally triggers a re-render of the entire application (which React's diffing algorithm handles efficiently).

Since stores have no setter methods or public properties for managing their data and change *only* in response to actions, testing them becomes a matter of putting them in a starting state, sending them an action, and testing that they end up in the expected final state. And since action dispatches and the action handlers in the stores are fully synchronous, debugging errors in application state simply involves figuring out which action caused the bad state change and then finding the bad logic that responded to that action.

For a more in-depth look at the Flux architecture, check out [Flux Application Architecture](http://facebook.github.io/flux/docs/overview.html) on the React site, and be sure to check out [Rethinking Web App Development at Facebook](https://www.youtube.com/watch?v=nYkdrAPrdcw) from F8 on YouTube to hear Jing Chen talk more about Flux.
