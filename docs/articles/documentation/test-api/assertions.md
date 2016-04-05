---
layout: docs
title: Assertions
permalink: /documentation/test-api/assertions.html
---
# Assertions

To check the result of [test actions](actions.md), use *assertions*. In this documentation,
we use [Chai assertions, BDD-style](http://chaijs.com/api/bdd/) for demonstration.
You can choose whatever library you like.

> Important! Before composing an asertion, you may need to observe the state of a particular page element
> affected by the test. This means that you need to access the webpage on the client side.
>
> TestCafe allows you to provide code to be executed on the client side.
> To learn how to do this, see [Executing Client Code](executing-code-in-the-browser/index.md).

The following sample fixture demonstrates how to use assertions.

```js
var expect = require('chai').expect;

fixture `My fixture`
    .page('http://example.com');

test('Test 1', async t => {
    await t.click('#myelem');

    const getMyElement = () => document.querySelector('#myelem');
    const myElement    = await t.select(getMyElement);

    expect(myElement.visible).to.be.true;
});

test('Test 2', async t => {
    await t
        .typeText('#input', 'Hello world!')
        .click('#apply');

    const getHeader = () => document.querySelector('#header');
    const header    = await t.select(getHeader);

    expect(header.textContent).to.equal('Hello world!');
});
```