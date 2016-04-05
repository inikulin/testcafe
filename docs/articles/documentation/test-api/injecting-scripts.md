---
layout: docs
title: Injecting Scripts
permalink: /documentation/test-api/injecting-scripts.html
---
# Injecting Scripts

TestCafe allows you to inject custom scripts into the tested pages. Use the `inject` and `injectEverywhere` functions for this.

```text
inject( func )
inject( path )
```

Injects the specified script into the current page or frame.

```text
injectEverywhere( func )
injectEverywhere( path )
```

Injects the specified script into all pages and frames used in the test.

Parameter | Type     | Description
--------- | -------- | ----------------------------------------------------------------
`func`    | Function | The function that should be injected.
`path`    | String   | The path to the JS file with the script that should be injected.