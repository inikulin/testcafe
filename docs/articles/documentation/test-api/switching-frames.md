---
layout: docs
title: Switching Frames
permalink: /documentation/test-api/switching-frames.html
---
# Switching Frames

At any moment, a TestCafe test has its scope limited to a single frame. If a webpage contains
several frames and you need to use more than one in a test, you will need to switch the current frame.

To do this, use the `switchTo` and `switchToMain` functions.

```text
switchTo( selector )
```

Switches the current frame to the specified one.

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------
`selector` | String, Selector function or DOM element snapshot | Identifies a frame on the tested page. See [Webpage Element Selectors](webpage-element-selectors.md).

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector(id));

test('switching to a frame', async t => {
    await t
        .switchTo('#TOC-frame')
        .click('#document-1')
        .switchTo('#document-contents-frame');

    const sendFeedbackButton = await getElementById('#send-feedback-button');

    expect(sendFeedbackButton.visible).to.be.true;
});
```

```text
switchToMain()
```

Switches the current frame back to the main frame.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector(id));

test('switching back to main frame', async t => {
    await t
        .switchTo('#payment-details-iframe')
        .click('#cancel-payment')
        .switchToMain();

    const paymentDetails = await getElementById('#payment-details-iframe');

    expect(paymentDetails.visible).to.be.false;
});
```