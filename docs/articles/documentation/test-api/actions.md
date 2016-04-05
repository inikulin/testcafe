---
layout: docs
title: Actions
permalink: /documentation/test-api/actions.html
---
# Actions

Test API provides a set of *actions* that enable you to interact with the webpage.

Test actions are implemented as methods in the [test controller](test-code-structure.md#test-controller) object. You can call them in a chained fashion.

The following sample types text into an input and clicks a button by using the `typeText` and `click` actions.

```js
test('MyTest', async t => {
    await t
        .typeText('#input', 'Hello world!')
        .click('#apply');
});
```

This topic lists the available test actions:

* [Click](#click-action)
* [Right Click](#right-click-action)
* [Double Click](#double-click-action)
* [Drag](#drag-action)
  * [Drag an Element onto Another One](#drag-an-element-onto-another-one)
* [Hover](#hover-action)
* [Screenshot](#screenshot-action)
* [Navigate](#navigate-action)
* [Key Press](#key-press-action)
* [Select](#select-action)
  * [Select \<textarea\> Content](#select-textarea-content)
  * [Perform Selection within Editable Content](#perform-selection-within-editable-content)
* [Type Text](#type-text-action)
* [Upload](#upload-action)
  * [Clearing the File Upload Input Element](#clearing-the-file-upload-input-element)
* [Resize Window](#resize-window-action)
  * [Fitting the Window into a Particular Device](#fitting-the-window-into-a-particular-device)
* [Options](#options)
  * [Mouse Action Options](#mouse-action-options)
  * [Typing Action Options](#typing-action-options)

## Click Action

Clicks a webpage element.

```text
click( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------------------
`selector`             | String, Selector function or DOM element snapshot | Identifies the webpage element being clicked. See [Webpage Element Selectors](webpage-element-selectors.md).
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Mouse Action Options](#mouse-action-options).

The following example shows how to use the `click` action to tick a checkbox element.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector(id));

test('Click a check box and check its state', async t => {
    await t.click('#testing-on-remote-devices');

    const checkBox = await getElementById('#testing-on-remote-devices');

    expect(checkBox.checked).to.be.true;
});
```

The next example uses the `options` parameter to set the caret position in the edit box after it has been clicked.

```js
import { expect } from 'chai';

test('Click Input', async t => {
    await t
        .typeText('#developer-name', 'Peter Parker')
        .click('#developer-name', { caretPos: 5 })
        .keyPress('backspace');

    const getDeveloperNameInput = () => document.querySelector('#developer-name');
    const input                 = await t.select(getDeveloperNameInput);

    expect(input.value).to.equal('Pete Parker');
});
```

## Right Click Action

Right-clicks a webpage element.

```text
rightClick( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------
`selector`             | String, Selector function or DOM element snapshot | Identifies the webpage element being right-clicked. See [Webpage Element Selectors](webpage-element-selectors.md).
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Mouse Action Options](#mouse-action-options).

The following example shows how to use the `rightClick` action to invoke grid's popup menu.

```js
import { expect } from 'chai';

test('Popup Menu', async t => {
    await t.rightClick('#cell-1-1');

    const getPopupMenu = () => document.querySelector('#cell-popup-menu');

    expect(await t.select(getPopupMenu).now).to.be.null;
});
```

Note that the `rightClick` action will not invoke integrated browser context menus, native editor menus, etc.
Use it to perform right clicks that are processed by webpage elements, not the browser.

## Double Click Action

Double-clicks a webpage element.

```text
doubleClick( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------
`selector`             | String, Selector function or DOM element snapshot | Identifies the webpage element being double-clicked. See [Webpage Element Selectors](webpage-element-selectors.md).
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Mouse Action Options](#mouse-action-options).

The following example shows how to use the `doubleClick` action to invoke a dialog.

```js
import { expect } from 'chai';

test('Invoke Image Options Dialog', async t => {
    await t.doubleClick('#thumbnail');

    const getDialog = () => document.querySelector('#dialog');

    expect(await t.select(getDialog)).to.not.be.null;
});
```

Note that the `doubleClick` action will not invoke integrated browser actions such as text selection.
Use it to perform double clicks that are processed by webpage elements, not the browser.

## Drag Action

Drags a webpage element to a new position.

```text
drag( selector, dragOffsetX, dragOffsetY [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`selector`             | String, Selector function or DOM element snapshot | Identifies the webpage element being dragged. See [Webpage Element Selectors](webpage-element-selectors.md).
`dragOffsetX`          | Numeric                                           | An X-offset of the drop coordinates from the mouse pointer's initial position.  
`dragOffsetY`          | Numeric                                           | An Y-offset of the drop coordinates from the mouse pointer's initial position.
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Mouse Action Options](#mouse-action-options).

The following example demonstrates how to use the `drag` action with a slider.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector('#' + id));

test('Drag slider', async t => {
    await t.click('#i-tried-testcafe');

    const slider = await getElementById('#developer-rating');

    expect(slider.value).to.equal(1);

    await t.drag('.ui-slider-handle', 360, 0, { offsetX: 10, offsetY: 10 });

    slider.refresh();
    expect(slider.value).to.equal(7);
});
```

Note that the `drag` action will not invoke integrated browser actions such as copying and pasting text.
Use it to perform drag-and-drop actions that are processed by webpage elements, not the browser.

### Drag an Element onto Another One

```text
dragToElement( selector, destinationSelector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------
`selector`             | String, Selector function or DOM element snapshot | Identifies the webpage element being dragged. See [Webpage Element Selectors](webpage-element-selectors.md).
`destinationSelector`  | String, Selector function or DOM element snapshot | Identifies the webpage element that serves as the drop location. See [Webpage Element Selectors](webpage-element-selectors.md).  
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Mouse Action Options](#mouse-action-options).

This sample shows drop an element into an area using the `dragToElement` action.

```js
import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

const isDesignSurfaceEmpty = ClientFunction(() => !getDesignSurfaceElements().length);

test('Drag an item from the toolbox', async t => {
    await t.dragToElement('.toolbox-item.text-input', '.design-surface');

    expect(await isDesignSurfaceEmpty()).to.be.false;
});
```

## Hover Action

Hovers the mouse pointer over a webpage element.

```text
hover( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------------------
`selector`             | String, Selector function or DOM element snapshot | Identifies the webpage element being hovered over. See [Webpage Element Selectors](webpage-element-selectors.md).
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Mouse Action Options](#mouse-action-options).

Use this action to invoke popup elements such as hint windows, popup menus or dropdown lists that appear when hovering other elements.

The following example shows how to move the mouse pointer over a combo box to display the dropdown list,
then select an item and check that the combo box value has changed.

```js
import { expect } from 'chai';

test('Select combo box value', async t => {
    await t
        .hover('.combo-box')
        .click('#i-prefer-both');

    const getComboBox = () => document.querySelector('.combo-box');
    const comboBox    = await t.select(getComboBox);

    expect(comboBox.value).to.equal('Both');
});
```

## Screenshot Action

Takes a screenshot of the tested page.

```text
takeScreenshot( [path] )
```

Parameter           | Type   | Description                                                                                           | Default
------------------- | ------ | ----------------------------------------------------------------------------------------------------- | ----------
`path` *(optional)* | String | Relative path to the folder where screenshots should be saved resolved from the *screenshot directory* specified via an [API](../using-testcafe/programming-interface/runner.md#screenshots) or [CLI](../using-testcafe/command-line-interface.md#-s-path---screenshots-path) option. | Screenshot directory specified via an [API](../using-testcafe/programming-interface/runner.md#screenshots) or [command-line interface](../using-testcafe/command-line-interface.md#-s-path---screenshots-path) option.

> Important! If the screenshot directory is not specified in [API](../using-testcafe/programming-interface/runner.md#screenshots) or [command-line interface](../using-testcafe/command-line-interface.md#-s-path---screenshots-path),
> the `takeScreenshot` action is ignored.

The following example shows how to use the `takeScreenshot` action.

```js
test('Take a screenshot of my new avatar', async t => {
    await t
        .click('#change-avatar')
        .setFilesToUpload('#upload-input', 'img/portrait.jpg')
        .click('#submit')
        .takeScreenshot();
});
```

> Important! This action is not available on Linux.

## Navigate Action

Navigates to the specified URL.

```text
navigateTo( url )
```

Parameter | Type   | Description
--------- | ------ | -----------------------
`url`     | String | The URL to navigate to.

The following example shows how to use `navigateTo` action.

```js
test('Navigate to the main page', async t => {
    await t
        .click('#submit-button')
        .navigateTo('http://devexpress.github.io/testcafe');
});
```

## Key Press Action

Presses the specified keys.

```text
pressKeys( keys )
```

Parameter | Type   | Description
--------- | ------ | --------------------------------------------------------
`keys`    | String | The sequence of keys and key combinations to be pressed.

* Alphanumeric keys  
  'a', 'A', '1', ...
* Modifier keys  
  'shift', 'alt', 'ctrl', 'meta'
* Navigation and action keys  
  'backspace', 'tab', 'enter', 'capslock', 'esc', 'space', 'pageup', 'pagedown', 'end', 'home', 'left', 'right', 'down', 'ins', 'delete'
* Key combinations  
  'shift+a', 'ctrl+d', ...
* Sequential key presses (any of the above in a space-separated string)  
  'a ctrl+b'

In addition to key presses handled by webpage elements, TestCafe also allows you to execute certain key presses processed by the browser.

* 'ctrl+a', 'backspace', 'delete', 'left', 'right', 'up', 'down', 'home', 'end',
  'enter', 'tab', 'shift+tab', 'shift+left', 'shift+right', 'shift+up', 'shift+down',
  'shift+home', 'shift+end'

With the exception of the keys and combinations listed above, the `pressKeys` action will not invoke integrated browser keystrokes.

For web elements that have the `contentEditable` attribute, TestCafe supports the following key-presses:

* 'ctrl+a',
* 'backspace', 'delete', 'left' and 'right' (only if there is selection within the element).

The following example shows how to use the `pressKeys` user action.

```js
import { expect } from 'chai';

test('Key Presses', async t => {
    await t
        .typeText('#developer-name', 'Peter Parker')
        .pressKeys('home right . delete delete delete delete');

    const getDeveloperNameInput = () => document.querySelector('#developer-name');
    const input                 = await t.select(getDeveloperNameInput);

    expect(input.value).to.equal('P. Parker');
});
```

## Select Action

Selects text on a webpage.

```text
selectText( selector, startPos, endPos )
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------
`selector` | String, Selector function or DOM element snapshot | Identifies the webpage element whose text will be selected. See [Webpage Element Selectors](webpage-element-selectors.md).
`startPos` | Numeric                                           | The start position of the selection.
`endPos`   | Numeric                                           | The end position of the selection.

The following example demonstrates text selection within the input element.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector(id));

test('Select text within input', async t => {
    await t
        .typeText('#developer-name', 'Test Cafe', { caretPos: 0 })
        .selectText('#developer-name', 7, 1);

    const input = await getElementById('#developer-name');

    expect(input.attributes['selectionStart']).to.equal(1);
    expect(input.attributes['selectionEnd']).to.equal(7);
});
```

> `startPos` and `endPos` can't have negative values. If the `startPos` value is greater than the `endPos` value, it will be executed as a backward selection.

### Select \<textarea\> Content

```text
selectTextAreaContent( selector, startLine, startPos, endLine, endPos)
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------
`selector` | String, Selector function or DOM element snapshot | Identifies the textarea whose text will be selected. See [Webpage Element Selectors](webpage-element-selectors.md).
`startLine`| Numeric                                           | The line number at which selection will start.
`startPos` | Numeric                                           | The start position of selection within the line defined by the `startLine`.
`endLine`  | Numeric                                           | The line number at which selection will end.
`endPos`   | Numeric                                           | The end position of selection within the line defined by `endLine`.

The following example shows how to select text within a \<textarea\> element.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector(id));

test('Select text within textarea', async t => {
    await t.selectTextAreaContent('#comment', 1, 5, 3, 10);

    const comment = await getElementById('#comment');

    expect(comment.attributes['selectionStart']).to.equal(5);
    expect(comment.attributes['selectionEnd']).to.equal(48);
});
```

> `startPos`, `endPos`, `startLine` and `endLine` can't have negative values.
>
> If the position defined by `startLine` and `startPos` is greater than the one defined
> by `endLine` and `endPos`, it will execute a backward selection.

### Perform Selection within Editable Content

```text
selectEditableContent( startSelector, endSelector )
```

Parameter       | Type                                              | Description
--------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`startSelector` | String, Selector function or DOM element snapshot | Identifies a webpage element from which the selection starts. The start position of selection is the first character of the element's text. See [Webpage Element Selectors](webpage-element-selectors.md).  
`endSelector`   | String, Selector function or DOM element snapshot | Identifies a webpage element at which the selection ends. The end position of selection is the last character of the element's text. See [Webpage Element Selectors](webpage-element-selectors.md).

This function works for selection inside HTML elements that have the `contentEditable` attribute enabled.

> Important! According to Web standards, start and end elements must have a common ancestor with the `contentEditable` attribute set to `true` -
> a [root container](https://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#td-root-container).

The example below shows how to select several sections within a `contentEditable` area.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector((id) => document.querySelector(id));

test('Delete text within a contentEditable element', async t => {
    await t
        .selectEditableContent('#foreword', '#chapter-3')
        .pressKeys('delete');

    expect(await getElementById('#chapter-2').now).to.be.null;
    expect(await getElementById('#chapter-4')).to.not.be.null;
});
```

> If the web element defined by `endSelector` is located on a higher level of the page hierarchy
> than the one defined by `startSelector`, the action will execute a backward selection.

## Type Text Action

Types the specified text into a webpage element.

```text
typeText( selector, text [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------
`selector`             | String, Selector function or DOM element snapshot | Identifies the webpage element that will receive input focus. See [Webpage Element Selectors](webpage-element-selectors.md).  
`text`                 | String                                            | The text to be typed into the specified webpage element.
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Typing Action Options](#typing-action-options). If this parameter is omitted, TestCafe sets the cursor to the end of the text before typing, thus preserving the text that is already in the edit box.

> Use the [key press action](#key-press-action) to implement text management operations such as selection or deletion.

The following example shows how to use `typeText` with and without options.

```js
import { expect } from 'chai';

test('Type and Replace', async t => {
    await t
        .typeText('#developer-name', 'Peter')
        .typeText('#developer-name', 'Paker', { replace: true })
        .typeText('#developer-name', 'r', { caretPos: 2 });

    const getDeveloperNameInput = () => document.querySelector('#developer-name');
    const input                 = await t.select(getDeveloperNameInput);

    expect(input.value).to.equal('Parker');
});
```

## Upload Action

Populates the specified file upload input with file paths.

```text
setFilesToUpload( selector, filePath )
setFilesToUpload( selector, [filePath, ...] )
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------
`selector` | String, Selector function or DOM element snapshot | Identifies the input field to which file paths are written. See [Webpage Element Selectors](webpage-element-selectors.md).  
`filePath` | String                                            | Path to the uploaded file. Relative paths resolve from the folder with the test file.

The following example illustrates how to use the `setFilesToUpload` user action.

```js
test('Uploading', async t => {
    await t
        .setFilesToUpload('#upload-input', [
            './uploads/1.jpg',
            './uploads/2.jpg',
            './uploads/3.jpg'
        ])
        .click('#upload-button');
});
```

The `setFilesToUpload` action removes all file paths from the input before populating it with new ones.

> If an error occurs during the uploading of the saved file(s), the test will fail.

### Clearing the File Upload Input Element

Removes all file paths from the specified file upload input.

```text
clearUpload( selector )
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------
`selector` | String, Selector function or DOM element snapshot | Identifies the input field that needs to be cleared. See [Webpage Element Selectors](webpage-element-selectors.md).  

The example below shows how to use the `clearUpload` action.

```js
test('Trying to upload with no files specified', async t => {
    await t
        .clearUpload('#upload-input')
        .click('#upload-button')
        .handleAlert();
});
```

## Resize Window Action

Changes the size of the active browser window.

```text
resizeWindow(width, height)
```

Parameter  | Type    | Description
---------- | ------- | --------------------------
`width`    | Numeric | The new width, in pixels.
`height`   | Numeric | The new height, in pixels.

The following example demonstrates how to use the `resizeWindow` action.

```js
import { expect } from 'chai';

test('Side menu disappears on small screens', async t => {
    await t.resizeWindow(200, 100);

    const getMenu = () => document.querySelector('#side-menu');
    const menu    = await t.select(getMenu);

    expect(menu.style.display).to.equal('none');
});
```

### Fitting the Window into a Particular Device

```text
resizeWindowToFitDevice(deviceName [, portrait] )
```

Resizes the window so that it fits into the screen of a certain mobile device.

Parameter               | Type    | Description                                                     | Default
----------------------- | ------- | --------------------------------------------------------------- | -----------
`deviceName`            | String  | Name of the device as listed [here](http://viewportsizes.com/). |
`portrait` *(optional)* | Boolean | `true` for portrait screen orientation; `false` for landscape.  | `false`

The example below shows how to use the `resizeWindowToFitDevice` action.

```js
import { expect } from 'chai';

test('Header is displayed on Xperia Z in portrait', async t => {
    await t.resizeWindowToFitDevice('Sony Xperia Z', true);

    const getHeader = () => document.querySelector('#header');
    const header    = await t.select(getHeader);

    expect(header.style.display).to.not.equal('none');
});
```

## Options

### Mouse Action Options

Provide additional parameters for a mouse action.

```js
{
    ctrl: false | true,
    alt: false | true,
    shift: false | true,
    meta: false | true,
    offsetX: Integer,
    offsetY: Integer,
    caretPos: Integer
}
```

Parameter                      | Type    | Description                                                                                                                               | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed during the mouse action.                                                                   | `false`
`offsetX`, `offsetY`           | Numeric | Mouse pointer coordinates relative to the top-left corner of the target element. Define a point where the action is performed or started. | The center of the target element.
`caretPos`                     | Numeric | The initial caret position if the action is performed on a text input field.                                                              | The end of the content of the input field.

### Typing Action Options

Provide additional parameters for a typing operation.

```js
{
    replace: false | true,
    ctrl: false | true,
    alt: false | true,
    shift: false | true,
    meta: false | true,
    offsetX: Integer,
    offsetY: Integer,
    caretPos: Integer
}
```

Parameter                      | Type    | Description                                                                                                                         | Default
------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------
`replace`                      | Boolean | `true` to remove the current text in the target element, and `false` to leave the text as is.                                       | `false`
`ctrl`, `alt`, `shift`, `meta` | Boolean | Indicate which modifier keys are to be pressed while typing.                                                                        | `false`
`offsetX`, `offsetY`           | Numeric | Mouse pointer coordinates relative to the top-left corner of the target element. Define a point that is clicked to set input focus. | The center of the target element.
`caretPos`                     | Numeric | The initial caret position.                                                                                                         | The end of the content of the input field.