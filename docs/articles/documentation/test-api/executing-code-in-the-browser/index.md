---
layout: docs
title: Executing Code in the Browser
permalink: /documentation/test-api/executing-code-in-the-browser/
---
# Executing Code in the Browser

Normally, TestCafe runs test code on the server. When you need to refer to a DOM element
to perform an action on it, you pass CSS selectors to the appropriate action function.

However, there are many cases when you may require direct access to DOM elements or client scripts.
For instance, you need to know the state of a certain page element to make an assertion,
or you may find CSS selectors not powerful enough to pick an element you need to perform
an action on.

To address these scenarios, TestCafe allows you to run custom code in the browser and return
data to test code on the server. For this purpose, you need to create special functions that are
sent to the browser for execution automatically when called on the server side.

These are two types of functions executed on the client side: *selector* and *client* functions.
[Selector](#selector-functions) functions return elements of the DOM. Use them to get a page element that you wish
to target with an action or whose state you need to check in an assertion. [Client](#client-functions) functions can return any other data.
Use them to obtain serializable values like the current URL or custom data calculated by a client script.

> Important! Use the capability to run client code only to observe the webpage
> state and select its elements. Do not modify the tested webpage in the client code.
> To interact with the page, use [test actions](../actions.md).
>
> You cannot use generators or `async/await` syntax within selector and client functions.

* [Hybrid Functions](#hybrid-functions)
  * [Hybrid Functions as Selectors](#hybrid-functions-as-selectors)
* [Self-Invoking Client Code](#self-invoking-client-code)
* [Returning Values from Client Code](#returning-values-from-client-code)
* [Calling Selector and Client Functions from Node.js Callbacks](#calling-selector-and-client-functions-from-nodejs-callbacks)
* [Outer Scope Limitation](#outer-scope-limitation)

## Selector Functions

A selector function is executed on the client and returns a DOM element that can be used to define an action target or provide
information for an assertion.

To create a selector function, use the `Selector` constructor.

```text
Selector( func [, dependencies] )
```

Parameter                   | Type     | Description
--------------------------- | -------- | -------------------------------------------------------------------------------
`func`                      | Function | A function that returns a DOM element or `null`.
`dependencies` *(optional)* | Object   | An object that contains selector or [client](#client-functions) functions required by this selector.

> Important! Selector functions cannot return anything but DOM elements or `null`.
> Use [client functions](#client-functions) to return arbitrary data.

The following example shows how to create a selector function.

```js
import { Selector } from 'testcafe';

const getElement = Selector(id => document.querySelector(id));
```

The next sample demonstrates a selector function that calls another selector internally.

```js
import { Selector } from 'testcafe';

const getGridRow  = Selector(n => document.querySelectorAll('#grid-row')[n]);
const getGridCell = Selector((m, n) => getGridRow(m).children[n], { getGridRow });
```

### Executing Selectors

To run a selector function, use the `await` keyword just like with regular async functions.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id));

test('My test', async t => {
    const button = await getElementById('my-button');
});
```

When a selector function is called in test code with the `await` keyword, TestCafe waits for the target element to appear
in the DOM within the element availability timeout, which is specified when launching tests via [API](../../using-testcafe/programming-interface/runner.md#run)
or [CLI](../../using-testcafe/command-line-interface.md#--element-timeout-ms).
The selector function is executed over and over again, until it returns a
DOM element or the element availability timeout exceeds.

You can change the timeout value and configure the wait condition by passing options through
the selector's [context](#using-context-to-specify-selector-options).

### Return Values. DOM Node Snapshots

When you return a DOM node from the selector function, what actually returns from the client
is a *DOM node snapshot* - an object that reflects the state of this DOM node.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id));

test('Login field height', async t => {
    const loginInput = await getElementById('login');

    expect(loginInput.width).to.equal(35);
});
```

For a list of members exposed by DOM node snapshots, see [DOM Node Snapshot Members](dom-node-snapshot-members.md).

### Using Selectors to Define Action Targets

You can pass selector functions to [test actions](../actions.md) to define the action target.

```js
import { Selector } from 'testcafe';

const getLastItem = Selector(() => document.querySelector('.toc-item:last-child'));

test('My Test', async t => {
    await t.click(getLastItem);
});
```

In this case, the selector function will be called with no arguments.

> If you pass a regular function to a test action, this function will be automatically converted to a selector.
> This is equal to passing a function to the `Selector` constructor and then passing the created selector
> to the action.

DOM element snapshots can also be passed to test actions.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id))

test('My Test', async t => {
    const topMenuSnapshot = await getElementById('top-menu');

    await t.click(topMenuSnapshot);
});
```

In this case, the selector function that was used to fetch this snapshot will be called once again.

When a selector function or DOM node snapshot is passed to an action, TestCafe waits for the target element to appear
in the DOM and become visible before this action is executed. If this does not happen
within the element availability timeout, which is specified when launching tests via [API](../../using-testcafe/programming-interface/runner.md#run)
or [CLI](../../using-testcafe/command-line-interface.md#--element-timeout-ms), the test fails.

### Skip Waiting for the DOM Element to Appear

To skip waiting for the DOM element to appear and execute the selector function immediately, add `now` to the selector function.

This is useful when you want to check that the page does **not** contain a particular element.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id));

test('No Add button on the page', async t => {
    const addButton = await getElementById('add-button').now;

    expect(addButton).to.be.null;
});
```

### One-Off Selectors

To obtain a DOM element without explicitly creating a selector function, use the `select` method of the [test controller](../test-code-structure.md#test-controller).

```text
select( func [, dependencies] )
```

Parameter                   | Type     | Description
--------------------------- | -------- | ------------------------------------------------------------------
`func`                      | Function | A function that returns a DOM element or `null`.
`dependencies` *(optional)* | Object   | An object that contains selector or [client](#client-functions) functions required by this selector.

The following example shows how to get a DOM element by ID with `t.select`.

```js
test('My Test', async t => {
    const header = await t.select(() => document.querySelector('#header'));
});
```

The next sample shows how to use `t.select` when the selection code depends on an existing selector function.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id));

test('My Test', async t => {
    const getThirdSection = () => getElementById('options-panel').childNodes[3];
    const optionElement   = await t.select(getThirdSection, { getElementById } );
});
```

## Client Functions

Use client functions to return arbitrary data from the client side.

To create a client function, use the `ClientFunction` constructor.

```text
ClientFunction( func [, dependencies] )
```

Parameter                   | Type     | Description
--------------------------- | -------- | -------------------------------------------------------------------------------
`func`                      | Function | A function to be executed on the client side.
`dependencies` *(optional)* | Object   | An object that contains [selector](#selector-functions) or client functions required by this function.

Client functions can return any serializable objects from the client.

> Important! Client functions cannot return DOM elements. Use [selector functions](#selector-functions) for this.

The following example shows how to create a client function.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);
```

This sample demonstrates a client function that depends on a [selector](#selector-functions) function.

```js
import { Selector, ClientFunction } from 'testcafe';

const getElemById  = Selector(id => document.querySelector('#' + id));
const getElemWidth = ClientFunction(id => getElemById(id).width, { getElemById });
```

> When a client function calls a [selector function](#selector-functions) passed as its dependency,
> the selector function does not wait for the element to appear in the DOM but is executed at once,
> just like a client function.

### Executing Client Functions

When launching a client function from test code, use the `await` keyword.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);

test('My Test', async t => {
    const location = await getWindowLocation();
});
```

### One-Off Client Code Execution

To execute code on the client without explicitly creating a client function, use the `eval` method of the [test controller](../test-code-structure.md#test-controller).

```text
eval( func [, dependencies] )
```

Parameter                   | Type     | Description
--------------------------- | -------- | ------------------------------------------------------------------
`func`                      | Function | A function to be executed on the client side.
`dependencies` *(optional)* | Object   | An object that contains [selector](#selector-functions) or client functions required by this selector.

The following example shows how to get the document's URI with `t.eval`.

```js
test('My Test', async t => {
    const docURI = await t.eval(() => document.documentURI);
});
```

The next sample shows how to use `t.eval` when the client code depends on an existing [selector](#selector-functions) function.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id));

test('My Test', async t => {
    const getTagName          = () => getElementById('options-panel').tagName;
    const optionsPanelTagName = await t.eval(getTagName, { getElementById });
});
```

## Providing Context to Selector and Client Functions

You can provide a context object with custom data to selector and client functions. To pass context, use the `with` function.

```text
with(obj)
```

Parameter | Type   | Description
--------- | ------ | ----------------------------------------------------------------------
`obj`     | Object | Context object with custom data.

### Passing Options in the Context

You can specify a number of options for [selector functions](#selector-functions) in their context.

Option            | Type    | Description                                                                                                                      | Default
----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------
`timeout`         | Number  | The amount of time, in milliseconds, allowed for an element returned by the selector to appear in the DOM before the test fails. | The timeout specified via [API](../../using-testcafe/programming-interface/runner.md#run)
or [CLI](../../using-testcafe/command-line-interface.md#--element-timeout-ms)
`visibilityCheck` | Boolean | `true` to additionally require the returned element to become visible within the `timeout`.                                      | `false`  

The following sample shows how to select an element that is required to be visible while waiting for this for a maximum of 50 seconds.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id));

test('My Test', async t => {
    const submitButton = await getElementById('submit-button').with({
        timeout: 50000,
        visibilityCheck: true
    });
});
```

## Calling Selector and Client Functions from Node.js Callbacks

Both selector and client functions need access to test run context to be executed. When called right from the test function,
these functions implicitly determine the required context.

However, if you need to call a selector or client function from a Node.js callback that fires during the test run,
you will have to manually bind this function to test run context.

Use function's `bindTestRun` method for this.

```text
bindTestRun( t )
```

Parameter | Type   | Description
--------- | ------ | ----------------------------------------------------------------------
`t`       | Object | The current [test controller](../test-code-structure.md#test-controller).

Once `bindTestRun` is executed, the selector or client function can get the required context from the test controller.

```js
import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

const getDataFromClient = ClientFunction(() => getSomeData());

test('Check client data', async t => {
    getDataFromClient.bindTestRun(t);
    fs.readFile('/home/user/tests/reference/clientData.json', (err, data) => {
        expect(await getDataFromClient()).to.eql(JSON.parse(data));
    });
});
```

This approach is only intended for Node.js callbacks that fire during the test run.
When a test finishes, selector and client functions bound via its controller can no longer be executed.
This is why you should not call selector and client functions outside of test code, even though this approach
technically allows to do this.

## Outer Scope Limitation

Selector and client functions cannot access variables defined in the outer scope in test code.
However, you can use arguments to pass data inside these functions, except for self-invoking functions
that cannot take any parameters from the outside.

Likewise, the return value is the only way to obtain data from selector and client functions.