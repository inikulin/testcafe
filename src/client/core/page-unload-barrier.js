import hammerhead from './deps/hammerhead';
import * as eventUtils from './utils/event';
import { EventEmitter } from './utils/service';
import delay from './utils/delay';

var Promise      = hammerhead.Promise;
var browserUtils = hammerhead.utils.browser;


const DEFAULT_BARRIER_TIMEOUT       = 500;
const WAIT_FOR_UNLOAD_TIMEOUT       = 3000;
const SHORT_WAIT_FOR_UNLOAD_TIMEOUT = 30;

const WAITING_FINISHED_EVENT = 'waiting-finished';


class PageUnloadMonitor extends EventEmitter {
    constructor () {
        super();

        this.waitingForUnload          = false;
        this.waitingForUnloadTimeoutId = null;
        this.unloading                 = false;

        this._handleSubmit();
        this._handleBeforeUnload();
    }

    _overrideFormSubmit (form) {
        var submit = form.submit;

        form.submit = () => {
            this._prolongUnloadWaiting(WAIT_FOR_UNLOAD_TIMEOUT);
            submit.apply(form, arguments);
        };
    }

    _handleSubmit () {
        eventUtils.bind(document, 'submit', e => {
            if (e.target.tagName.toLowerCase() === 'form')
                this._prolongUnloadWaiting(WAIT_FOR_UNLOAD_TIMEOUT);
        });

        var forms = document.getElementsByTagName('form');

        for (var i = 0; i < forms.length; i++)
            this._overrideFormSubmit(forms[i]);
    }

    _onBeforeUnload (e) {
        if (e.isFakeIEBeforeUnloadEvent)
            return;

        if (!browserUtils.isIE) {
            this.unloading = true;
            return;
        }

        this._prolongUnloadWaiting(SHORT_WAIT_FOR_UNLOAD_TIMEOUT);

        delay(0)
            .then(() => {
                //NOTE: except file downloading
                if (document.readyState === 'loading' &&
                    !(document.activeElement && document.activeElement.tagName.toLowerCase() === 'a' &&
                    document.activeElement.hasAttribute('download')))
                    this.unloading = true;
            });
    }

    _handleBeforeUnload () {
        hammerhead.on(hammerhead.EVENTS.beforeUnload, e => this._onBeforeUnload(e));
        eventUtils.bind(window, 'unload', () => this.unloading = true);
    }

    _prolongUnloadWaiting (timeout) {
        if (this.waitingForUnloadTimeoutId)
            window.clearTimeout(this.waitingForUnloadTimeoutId);

        this.waitingForUnloadTimeoutId = window.setTimeout(() => {
            this.waitingForUnloadTimeoutId = null;
            this.waitingForUnload          = false;

            this.emit(WAITING_FINISHED_EVENT);
        }, timeout);
    }


    wait () {
        return new Promise(resolve => {
            var onWaitingFinished = () => {
                this.off(WAITING_FINISHED_EVENT, onWaitingFinished);
                resolve();
            };

            delay(DEFAULT_BARRIER_TIMEOUT)
                .then(() => {
                    if (this.unloading)
                        return;

                    if (!this.waitingForUnload)
                        resolve();
                    else
                        this.on(WAITING_FINISHED_EVENT, onWaitingFinished);
                });
        });
    }
}


export var pageUnloadMonitor = null;

export function init () {
    pageUnloadMonitor = new PageUnloadMonitor();
}

export function wait () {
    return pageUnloadMonitor.wait();
}
