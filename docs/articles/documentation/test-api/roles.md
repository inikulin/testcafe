---
layout: docs
title: Roles
permalink: /documentation/test-api/roles.html
---
# Roles

Many test scenarios involve the activity of more than one user. TestCafe addresses these scenarios by providing a convenient way
to isolate authentication test actions and apply them easily whenever you need to switch the user account.

A piece of logic that logs in a particular user is called a *role*. Define a role for each user participating in your test.

Use the `Role` constructor to create a role.

```text
Role( func( t ) )
```

Parameter | Type     | Description
--------- | -------- | --------------------------------------------------------------------------------
`func`    | Function | An asynchronous function that contains logic that authenticates the user.
`t`       | Object   | The [test controller](test-code-structure.md#test-controller) used to access test run API.

`func` - an asynchronous function that contains logic that authenticates an appropriate user.  
`t` - the test controller used to access test run API (object used in [test body](fixtures-and-tests.md#tests)).

```js
const regularAccUser = Role(async t => {
    await t
        .type('#login', 'TestUser')
        .type('#password', 'testpass')
        .click('#sign-in');
});

const facebookAccUser = Role(async t => {
    await t
        .click('#sign-in-with-facebook')
        .type('#email', 'testuser@mycompany.com')
        .type('#pass', 'testpass')
        .click('#submit');
});

const admin = Role(async t => {
    await t
        .type('#login', 'Admin')
        .type('#password', 'adminpass')
        .click('#sign-in');
});
```

Now you can switch between users at any moment in your tests. Use the `as` function for this.

```text
as( role )
```

Parameter | Type   | Description
--------- | ------ | ---------------------------------------------
`role`    | Object | The role you need to use further in the test.

```js
test('test that involves two users', async t => {
    await t
        .as(regularAccUser)
        .expect.element('#entry').exists
        .expect.element('#remove-entry').disabled
        .as(admin)
        .expect.element('#remove-entry').not.disabled
        .click('#remove-entry')
        .expect.element('#entry').not.exists;
});
```

If a website uses HTTP Basic or Windows (NTLM) authentication, use the approach described in [HTTP Authentication](http-authentication.md).