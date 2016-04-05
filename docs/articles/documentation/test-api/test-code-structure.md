---
layout: docs
title: Test Code Structure
permalink: /documentation/test-api/test-code-structure.html
---
# Test Code Structure

This topic contains the following sections:

* [Fixtures](#fixtures)
  * [Specifying the Start Webpage](#specifying-the-start-webpage)
* [Tests](#tests)
  * [Test Controller](#test-controller)
* [Initialization and Clean-Up](#initialization-and-clean-up)

## Fixtures

TestCafe tests must be organized into categories called *fixtures*.
A JavaScript file with TestCafe tests can contain one or more fixtures.

To declare a test fixture, use the `fixture` function.

```text
fixture( fixtureName )
```

```text
fixture `fixtureName`
```

Parameter     | Type   | Description
------------- | ------ | ------------------------
`fixtureName` | String | The name of the fixture.

[Tests](#tests) that constitute a fixture go after this declaration.

### Specifying the Start Webpage

You can optionally use the fixture declaration to specify a webpage at which all tests in a fixture start.
To do this, use the `page` function.

```text
page( url )
```

Parameter | Type   | Description
--------- | ------ | ------------------------------------------------
`url`     | String | The URL of the webpage at which the tests start.

```js
fixture `My fixture`
    .page('http://example.com');
```

If the start page is not specified, it defaults to `about:blank`.

> You can also call the [Navigate action](actions.md#navigate-action) at the beginning of a test
> to navigate to the start page.

## Tests

To introduce a test, call the `test` function and pass test code inside.

```text
test( testName, func(t) )
```

Parameter  | Type     | Description
---------- | -------- | --------------------------------------------------------------------
`testName` | String   | The test name. Must be unique within a fixture.
`func`     | Function | An asynchronous function that contains test code.
`t`        | Object   | The [test controller](#test-controller) used to access test run API.

```js
fixture `MyFixture`;

test('Test1', async t => {
    /* Test 1 Code */
});

test('Test2', async t => {
    /* Test 2 Code */
});
```

You are free to structure code within a test in any manner, as well as you can
reference any modules or libraries you need.

TestCafe provides a set of [actions](actions.md) used to manipulate the tested webpage.
To check that the page state matches the expected one, use [assertions](#assertions.md).

### Test Controller

A *test controller* is an object that actually holds the methods of test API. That is why it is
passed to each function that is expected to contain server-side test code (like [test](#tests),
[beforeEach](#initialization-and-clean-up) or [afterEach](#initialization-and-clean-up)).

Use the test controller to call [test actions](actions.md), handle [browser dialogs](handling-native-dialogs.md),
use [wait functions](wait-functions.md) or [invoke client-side code](executing-code-in-the-browser/index.md#self-invoking-client-code).

```js
import { expect } from 'chai';

test('My Test', async t => {
    await t
        .click('#send-button')
        .handleAlert()
        .typeText('#input', 'Peter Parker')
        .wait(1000);

    expect(await t.eval(() => getSomethingOnTheClient())).to.be.true;
});
```

Another job of the test controller is providing access to the internal context required for the test API to operate.
This is why the test controller is required by a [hybrid function](executing-code-in-the-browser/index.md#hybrid-functions) when it is
called from outside of the test - particularly, from a [Node.js callback](executing-code-in-the-browser/index.md#calling-hybrid-functions-from-nodejs-callbacks).

## Initialization and Clean-Up

To specify [actions](actions.md) that should be preformed before each test is started,
use the `beforeEach` function. To define actions that should follow each of your tests, use `afterEach`.

```text
beforeEach( func(t) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`func`    | Function | An asynchronous function that will be executed before each test is started.
`t`       | Object   | The test controller used to access test run API.

```text
afterEach( func(t) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`func`    | Function | An asynchronous function that will be executed after each test is finished.
`t`       | Object   | The test controller used to access test run API.

```js
fixture `My fixture`
    .page('http://example.com')
    .beforeEach( async t => {
        /* initialization code */
    })
    .afterEach( async t => {
        /* finalization code */
    })
```