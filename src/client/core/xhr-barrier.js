import hammerhead from './deps/hammerhead';
import delay from './utils/delay';
import { remove as removeItem, indexOf } from './utils/array';
import { EventEmitter } from './utils/service';
import logToConsole from './utils/log-to-console';

var Promise = hammerhead.Promise;


const REQUESTS_COLLECTION_DELAY              = 300;
const ADDITIONAL_REQUESTS_COLLECTION_DELAY   = 100;
const PAGE_INITIAL_REQUESTS_COLLECTION_DELAY = 50;
const REQUESTS_FINISHED_EVENT                = 'requests-finished';

const GLOBAL_XHR_BARRIER_FIELD = 'testcafe|xhr-barrier';

export default class XhrBarrier extends EventEmitter {
    constructor () {
        super();

        this.BARRIER_TIMEOUT = 3000;

        this.passed         = false;
        this.collectingReqs = true;
        this.requests       = [];
        this.watchdog       = null;

        this._unbindHandlers = null;

        this._init();
    }

    _init () {
        var onXhrSend      = e => this._onXhrSend(e.xhr);
        var onXhrCompleted = e => this._onXhrCompleted(e.xhr);
        var onXhrError     = e => this._onXhrError(e.xhr, e.err);

        hammerhead.on(hammerhead.EVENTS.xhrSend, onXhrSend);
        hammerhead.on(hammerhead.EVENTS.xhrCompleted, onXhrCompleted);
        hammerhead.on(hammerhead.EVENTS.xhrError, onXhrError);

        this._unbindHandlers = () => {
            hammerhead.off(hammerhead.EVENTS.xhrSend, onXhrSend);
            hammerhead.off(hammerhead.EVENTS.xhrCompleted, onXhrCompleted);
            hammerhead.off(hammerhead.EVENTS.xhrError, onXhrError);
        };
    }

    _removeXhrFromQueue (xhr) {
        removeItem(this.requests, xhr);
    }

    _onXhrSend (xhr) {
        if (this.collectingReqs)
            this.requests.push(xhr);
    }

    _onXhrCompleted (xhr) {
        // NOTE: let the last real XHR handler finish its job and try to obtain
        // any additional requests if they were initiated by this handler
        delay(ADDITIONAL_REQUESTS_COLLECTION_DELAY)
            .then(() => this._onXhrFinished(xhr));
    }

    _onXhrError (xhr, err) {
        // NOTE: previously, this error was used in 'possible fail causes', which
        // are R.I.P. now So we just throw this error to the console for debugging purposes.
        logToConsole('TestCafe encountered XHR error on page: ' + err);

        this._onXhrFinished(xhr);
    }

    _onXhrFinished (xhr) {
        if (indexOf(this.requests, xhr) > -1) {
            removeItem(this.requests, xhr);

            if (!this.collectingReqs && !this.requests.length)
                this.emit(REQUESTS_FINISHED_EVENT);
        }
    }


    wait (isPageLoad) {
        return new Promise(resolve => {
            delay(isPageLoad ? PAGE_INITIAL_REQUESTS_COLLECTION_DELAY : REQUESTS_COLLECTION_DELAY)
                .then(() => {
                    this.collectingReqs = false;

                    var onRequestsFinished = () => {
                        if (this.watchdog)
                            window.clearTimeout(this.watchdog);

                        this._unbindHandlers();
                        resolve();
                    };

                    if (this.requests.length) {
                        this.watchdog = window.setTimeout(() => {
                            // NOTE: previously, this error was used in 'possible fail causes', which
                            // are R.I.P. now So we just throw this error to the console for debugging purposes.
                            logToConsole('TestCafe encountered hanged XHR on page.');

                            onRequestsFinished();
                        }, this.BARRIER_TIMEOUT);

                        this.on(REQUESTS_FINISHED_EVENT, () => onRequestsFinished());
                    }
                    else
                        onRequestsFinished();
                });
        });
    }
}

XhrBarrier.GLOBAL_XHR_BARRIER_FIELD = GLOBAL_XHR_BARRIER_FIELD;

window[XhrBarrier.GLOBAL_XHR_BARRIER_FIELD] = XhrBarrier;
