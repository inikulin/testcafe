---
layout: docs
title: Wait Functions
permalink: /documentation/test-api/wait-functions.html
---
# Wait Functions

## Pausing the Test

Pauses the test for a specified period of time.

```text
wait( timeout )
```

Parameter | Type    | Description
--------- | ------- | --------------------------------
`timeout` | Numeric | Pause duration, in milliseconds.

The following example uses the `wait` action to pause the test while animation is playing. ([TestCafe Example Page](http://testcafe.devexpress.com/Example))

```js
import { expect } from 'chai';

test('Wait Example', async t => {
    await t
        .click('#play-1-sec-animation')
        .wait(1000);

    const getHeader = () => document.querySelector('.article-header');
    const header    = await t.select(getHeader);

    expect(header.style.opacity).to.equal(0);
});
```