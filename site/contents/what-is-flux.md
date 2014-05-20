---
title: What is Flux?
template: page.ejs
---

What is Flux?
=============

Flux is an architecture for creating data layers in JavaScript applications. It was designed at Facebook along with the [React](http://facebook.github.io/react/) view library.

Flux is an alternative to the "M" and "C" in the MVC architecture. In MVC, a user interaction triggers code in a controller, which then coordinates changes to one or more models. When the models change, they notify one or more views, which read the new data from the models and update themselves accordingly so that the user can see that new data.

![Simple MVC](/images/mvc-simple.png)

As your application grows and you add more models and views, the dependencies between the models and views in your application become more complex.

![Complex MVC](/images/mvc-complex.png)

It becomes difficult to trace the code paths any given user interaction event will trigger, making it hard to understand which models will update and, in turn, which views will update. Add in the desire to have granular view updates based on changes on certain properties of certain models (rather than just re-rendering the entire view), and you can quickly end up with a codebase that's hard to debug. Additionally, if changes in models can trigger handlers in the views which themselves trigger yet more changes in the models, you can end up with a cascading series of changes that is both error-prone and difficult to debug.

Flux eschews this design in favor of a one-way data flow:</p>

![Simple Flux](/images/flux-simple.png)

All user interactions with a view trigger an *action* which flows through a singleton *dispatcher*. The dispatcher is a single-point-of-entry for all actions. The dispatcher also prevents cascading updates by ensuring that only one action can be dispatched at a time.

In a React application, a top-level view (known as a "controller-view") will read all the stores' new data and pass it down to child components as appropriate. Child components that need to update the application data will either call a function passed to it by a parent component or dispatch an action to the dispatcher.

![Complex Flux](/images/flux-complex.png)

The dispatcher sends every action to all the *stores*. Stores manage data and business logic in a Flux application; each store is responsible for a domain of the application (which may consist of more than a single piece or collection of data). Stores update themselves in response to actions—nothing outside the store has any knowledge of how the store manages its data. When they update, they emit an event that signals that their data has changed, allowing the views to fetch the new data and update accordingly.

Since stores have no setter methods or public properties for managing their data, testing them becomes a matter of putting them in a starting state, sending them an action, and testing that they end up in the expected final state.

For a more in-depth look at the Flux architecture, check out [Flux Application Architecture](http://facebook.github.io/react/docs/flux-overview.html) on the React site, and be sure to check out [Rethinking Web App Development at Facebook](https://www.youtube.com/watch?v=nYkdrAPrdcw) from F8 on YouTube to hear Jing Chen talk more about Flux.
