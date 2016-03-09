import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeRunner from '../deps/testcafe-runner';
import testCafeUI from '../deps/testcafe-ui';
import ERROR_TYPE from '../../../legacy/test-run-error/type';

var Promise           = hammerhead.Promise;
var EventEmitter      = testCafeCore.serviceUtils.EventEmitter;
var XhrBarrier        = testCafeCore.XhrBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var positionUtils     = testCafeCore.positionUtils;
var domUtils          = testCafeCore.domUtils;
var waitFor           = testCafeCore.waitFor;
var ClickAutomation   = testCafeRunner.get('./automation/playback/click');
var ProgressPanel     = testCafeUI.ProgressPanel;


const PROGRESS_PANEL_TEXT   = 'Waiting for the target element of the next action to appear';
const CHECK_ELEMENT_DELAY   = 200;
const CHECK_ELEMENT_TIMEOUT = 10000;


function ensureElementExists (selector) {
    return waitFor(selector, CHECK_ELEMENT_DELAY, CHECK_ELEMENT_TIMEOUT)
        .catch(() => {
            //TODO: change legacy error with the new one
            throw {
                type:   ERROR_TYPE.emptyFirstArgument,
                action: 'click'
            };
        });
}

function ensureElementVisible (element, timeout) {
    return waitFor(() => positionUtils.isElementVisible(element) ? element : null, CHECK_ELEMENT_DELAY, timeout)
        .catch(() => {
            //TODO: change the legacy error with the new one
            throw {
                type:    ERROR_TYPE.invisibleActionElement,
                element: domUtils.getElementDescription(element),
                action:  'click'
            };
        });
}

function ensureElement (selector) {
    var startTime     = new Date();
    var progressPanel = new ProgressPanel();

    progressPanel.show(PROGRESS_PANEL_TEXT, CHECK_ELEMENT_TIMEOUT);

    return ensureElementExists(selector, CHECK_ELEMENT_TIMEOUT)
        .then(element => {
            var checkVisibilityTimeout = CHECK_ELEMENT_TIMEOUT - (new Date() - startTime);

            return ensureElementVisible(element, checkVisibilityTimeout);
        })
        .then(element => {
            progressPanel.close(true);
            return element;
        })
        .catch(err => {
            progressPanel.close(false);
            throw err;
        });
}

function runAutomation (element, command) {
    var automation = null;

    if (command.type === 'click')
        automation = new ClickAutomation(element, command.arguments.options);

    return automation
        .run()
        .then(() => {
            return { failed: false };
        });
}


export default class AutomationCommandExecutor extends EventEmitter {
    constructor () {
        super();

        this.STARTED_EVENT = 'started';
    }

    execute (command) {
        return new Promise(resolve => {
            var xhrBarrier    = null;
            var commandResult = null;
            var selector      = () => window.eval(command.arguments.selector);

            ensureElement(selector)
                .then(element => {
                    this.emit(this.STARTED_EVENT);

                    xhrBarrier = new XhrBarrier();

                    return runAutomation(element, command);
                })
                .then(result => {
                    commandResult = result;

                    return Promise.all([
                        xhrBarrier.wait(),
                        pageUnloadBarrier.wait()
                    ]);
                })
                .then(() => resolve(commandResult))
                .catch(err => {
                    commandResult = {
                        failed: true,
                        err:    err
                    };

                    resolve(commandResult);
                });
        });
    }
}
