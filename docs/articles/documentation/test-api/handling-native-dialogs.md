---
layout: docs
title: Handling Native Dialogs
permalink: /documentation/test-api/handling-native-dialogs.html
---
# Handling Native Dialogs

If a browser displays a native message box during the test, TestCafe can automatically close the dialog as required, and avoid test failure.

## Alert Dialog

Use the `handleAlert` function to close alert dialogs.

```text
handleAlert()
```

This function closes the dialogs invoked via the standard JavaScript `window.alert()` method.

```js
test('handleAlert', async t => {
    await t
        .click('#submit-button')
        .handleAlert();
});
```

## onBeforeUnload Dialog

Use the `handleBeforeUnload` function to close a dialog that is shown when a window is about to be unloaded.

```text
handleBeforeUnload()
```

This function closes a dialog invoked via the standard JavaScript window.onbeforeunload() function.

```js
test('handleBeforeUnload', async t => {
    await t
        .click('#close-button')
        .handleBeforeUnload();
});
```

## Confirmation Dialog

Use the `handleConfirm` function to close a confirmation dialog.

```text
handleConfirm( result )
```

Parameter | Type              | Description
--------- | ----------------- | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`result`  | String or Boolean | `'OK'` or `true` to close the dialog and confirm the action, thus emulating the OK button; `'Cancel'` or `false` to close the dialog and prohibit the action, thus emulating the Cancel button.

This function handles dialogs invoked via the standard JavaScript `window.confirm()` method.

```js
test('Handle Confirm', async t => {
    await t
        .click('#populate-form-button')
        .handleConfirm('OK');
});
```

## Prompt Dialog

Use the `handlePrompt` function to closes dialogs that prompts user input.

```text
handlePrompt( input )
```

Parameter | Type   | Description
--------- | ------ | -----------------------------------------------------------------------------------------------------------
`input`   | String | Text to be entered before closing the dialog by clicking OK; `null` to close the dialog by clicking Cancel.

This function handles dialogs invoked via the standard JavaScript `window.prompt()` method.

```js
test('handlePrompt', async t => {
    await t
        .click('#submit-button')
        .handlePrompt('Peter');
});
```