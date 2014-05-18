---
title: Stores
template: page.ejs
---

Stores
======

In a Flux application, the stores are responsible for managing business log and data. If you're familiar with models in the MVC or similar paradigm, it's important to understand that stores manage more than a single piece of data or a single collection—stores are responsible for a domain of the application.

The *only* way to update stores is to send them an action by way of the dispatcher; stores should not have setter methods or properties that allow users to manipulate the store directly.
