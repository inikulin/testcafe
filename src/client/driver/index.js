import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';

import MESSAGE from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/command/command-type';
import ERROR_TYPE from '../../legacy/test-run-error/type';

import * as browser from '../browser';
import createCommandExecutor from './create-command-executor';
import ContextStorage from './storage';

var transport         = hammerhead.transport;
var XhrBarrier        = testCafeCore.XhrBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var eventUtils        = testCafeCore.eventUtils;
var modalBackground   = testCafeUI.modalBackground;


const executingCommandFlag = 'testcafe|driver|executing-command-flag';


export default class ClientDriver {
    constructor (testRunId, heartbeatUrl, browserStatusUrl) {
        this.testRunId        = testRunId;
        this.heartbeatUrl     = heartbeatUrl;
        this.browserStatusUrl = browserStatusUrl;
        this.contextStorage   = new ContextStorage(window, testRunId);

        this.pageInitialXhrBarrier = new XhrBarrier();

        pageUnloadBarrier.init();
    }

    start () {
        browser.startHeartbeat(this.heartbeatUrl, hammerhead.nativeMethods.XMLHttpRequest);

        modalBackground.initAndShowLoadingText();
        hammerhead.on(hammerhead.EVENTS.uncaughtJsError, err => this._onJsError(err));

        eventUtils
            .documentReady()
            .then(() => this.pageInitialXhrBarrier.wait(true))
            .then(() => {
                var inExecuting   = this.contextStorage.getItem(executingCommandFlag);
                var commandResult = inExecuting ? { failed: false } : null; //TODO: store errors between page reloads

                modalBackground.hide();
                this._onReady(commandResult);
            });
    }

    _onJsError (err) {
        return transport
            .asyncServiceMsg({
                cmd: MESSAGE.jsError,
                //TODO: replace this legacy error with the new one
                err: {
                    type:        ERROR_TYPE.uncaughtJSError,
                    scriptErr:   err.msg || err.message,
                    pageError:   true,
                    pageDestUrl: err.pageUrl
                }
            });
    }

    _onReady (commandResult) {
        transport
            .asyncServiceMsg({ cmd: MESSAGE.ready, commandResult })
            .then(command => {
                if (command)
                    this._onCommand(command);
                else {
                    //TODO:
                }
            });
    }

    _onCommand (command) {
        if (command.type === COMMAND_TYPE.testDone) {
            this._onTestDone();
            return;
        }

        var commandExecutor = createCommandExecutor(command);

        commandExecutor.on(commandExecutor.STARTED_EVENT, () => this.contextStorage.setItem(executingCommandFlag, true));

        commandExecutor
            .execute(command)
            .catch(err => this._onJsError(err))
            .then(commandResult => {
                this.contextStorage.setItem(executingCommandFlag, false);

                return this._onReady(commandResult);
            });
    }

    _onTestDone () {
        transport
            .asyncServiceMsg({ cmd: MESSAGE.done })
            .then(() => browser.checkStatus(this.browserStatusUrl, hammerhead.nativeMethods.XMLHttpRequest));
    }

}

Object.defineProperty(window, '%testCafeClientDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        ClientDriver
});
