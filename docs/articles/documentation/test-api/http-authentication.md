---
layout: docs
title: HTTP Authentication
permalink: /documentation/test-api/http-authentication.html
---
# HTTP Authentication

TestCafe allows you to test web pages protected with HTTP Basic or Windows (NTLM) authentication.

To specify user credentials, use the `httpAuth` function in fixture declaration.

```text
httpAuth( login, password )
```

Parameter  | Type   | Description
---------- | ------ | ----------------------------------
`login`    | String | The login used for authentication.
`password` | String | The user's password.

```js
fixture `My fixture`
    .page('http://example.com')
    .httpAuth('peterp', 'qJDB6');
```

Note that in case of Windows authentication, TestCafe additionally requires domain and workstation (PC) names.
By default, these names are automatically received from the machine where TestCafe is installed.

If a website uses form-based authentication, specify the required actions via [roles](roles.md).