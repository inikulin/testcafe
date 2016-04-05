---
layout: docs
title: Webpage Element Selectors
permalink: /documentation/test-api/webpage-element-selectors.html
---
# Webpage Element Selectors

With most test actions, you have to specify a page element to which this action applies.
To define such an element, use one of the following *selectors*.

* CSS selector (String)
* A [selector function](executing-code-in-the-browser/index.md)
* A DOM element snapshot (as returned by a [selector function](executing-code-in-the-browser/index.md))
* Function. Will be transformed to a [selector function](executing-code-in-the-browser/index.md).
  Thus, it has to return a DOM element and cannot use variables from the outer scope.