import hammerhead from '../../../deps/hammerhead';
import testCafeCore from '../../../deps/testcafe-core';
import KeyPressSimulator from './key-press-simulator';
import supportedShortcutHandlers from './shortcuts';
import each from '../../../utils/promise-each';
import { getKeyArray, excludeShiftModifiedKeys } from './utils';
import { ACTION_STEP_DELAY } from '../../settings';

var Promise      = hammerhead.Promise;
var browserUtils = hammerhead.utils.browser;

var arrayUtils = testCafeCore.arrayUtils;
var domUtils   = testCafeCore.domUtils;
var delay      = testCafeCore.delay;


const KEY_PRESS_DELAY = 80;


export default class PressAutomation {
    constructor (keyCombinations) {
        this.keyCombinations  = keyCombinations;
        this.isSelectElement  = false;
        this.pressedKeyString = '';
        this.modifiersState   = null;
        this.shortcutHandlers = null;
    }

    static _getKeyPressSimulators (keyCombination) {
        var keys = getKeyArray(keyCombination);

        keys = excludeShiftModifiedKeys(keys);

        return arrayUtils.map(keys, key => new KeyPressSimulator(key));
    }

    static _getShortcuts (keyCombination) {
        var keys               = getKeyArray(keyCombination.toLowerCase());
        var shortcuts          = [];
        var curFullCombination = [];
        var curCombination     = [];

        for (var i = 0; i < keys.length; i++) {
            curFullCombination.push(keys[i]);

            curCombination = curFullCombination.slice();

            while (curCombination.length) {
                var keyString = curCombination.join('+');

                if (supportedShortcutHandlers[keyString]) {
                    shortcuts.push(keyString);
                    curFullCombination = curCombination = [];
                }
                else
                    curCombination.shift();
            }
        }

        return shortcuts;
    }

    static _getShortcutHandlers (keyCombination) {
        var shortcuts          = PressAutomation._getShortcuts(keyCombination.toLowerCase());
        var shortcutHandlers   = {};
        var stringWithShortcut = '';
        var shortcut           = null;
        var shortcutPosition   = null;
        var shortcutLength     = null;

        for (var i = 0; i < shortcuts.length; i++) {
            shortcut         = shortcuts[i];
            shortcutPosition = keyCombination.indexOf(shortcut);
            shortcutLength   = shortcut.length;

            stringWithShortcut += keyCombination.substring(0, shortcutPosition + shortcutLength);

            shortcutHandlers[stringWithShortcut] = supportedShortcutHandlers[shortcut];

            keyCombination = keyCombination.substring(shortcutPosition + shortcutLength);
        }


        return shortcutHandlers;
    }

    _down (keyPressSimulator) {
        this.pressedKeyString += (this.pressedKeyString ? '+' : '') + keyPressSimulator.key;

        var keyDownPrevented = !keyPressSimulator.down(this.modifiersState);

        return Promise.resolve(keyDownPrevented);
    }

    _press (keyPressSimulator, keyEventPrevented) {
        // NOTE: preventing the 'keydown' and 'keypress' events for the select element does not
        // affect the assignment of the new selectedIndex. So, we should execute a shortcut
        // for the select element without taking into account that 'key' events are suppressed
        if (keyEventPrevented && !this.isSelectElement)
            return delay(KEY_PRESS_DELAY);

        var currentShortcutHandler = this.shortcutHandlers[this.pressedKeyString];
        var keyPressPrevented      = false;

        // NOTE: B254435
        if (!currentShortcutHandler || browserUtils.isFirefox || keyPressSimulator.key === 'enter')
            keyPressPrevented = !keyPressSimulator.press(this.modifiersState);

        if ((!keyPressPrevented || this.isSelectElement) && currentShortcutHandler) {
            return currentShortcutHandler(domUtils.getActiveElement())
                .then(() => delay(KEY_PRESS_DELAY));
        }

        return delay(KEY_PRESS_DELAY);
    }

    _up (keyPressSimulator) {
        keyPressSimulator.up(this.modifiersState);

        return delay(KEY_PRESS_DELAY);
    }

    _runCombination (keyCombination) {
        this.modifiersState   = { ctrl: false, alt: false, shift: false, meta: false };
        this.isSelectElement  = domUtils.isSelectElement(domUtils.getActiveElement());
        this.pressedKeyString = '';
        this.shortcutHandlers = PressAutomation._getShortcutHandlers(keyCombination);

        var keyPressSimulators = PressAutomation._getKeyPressSimulators(keyCombination);

        return each(keyPressSimulators, keySimulator => {
            return this
                ._down(keySimulator)
                .then(keyEventPrevented => this._press(keySimulator, keyEventPrevented));
        })
            .then(() => {
                arrayUtils.reverse(keyPressSimulators);

                return each(keyPressSimulators, keySimulator => this._up(keySimulator));
            });
    }

    run () {
        return each(this.keyCombinations, combination => {
            return this
                ._runCombination(combination)
                .then(() => delay(ACTION_STEP_DELAY));
        });
    }
}


