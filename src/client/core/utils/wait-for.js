import hammerhead from '../deps/hammerhead';

var Promise = hammerhead.Promise;


export default function (fn, delay, timeout) {
    return new Promise((resolve, reject) => {
        var result = fn();

        if (result) {
            resolve(result);
            return;
        }

        var intervalId = window.setInterval(() => {
            result = fn();

            if (result) {
                window.clearInterval(intervalId);
                window.clearTimeout(timeoutId);
                resolve(result);
            }
        }, delay);

        var timeoutId = window.setTimeout(() => {
            window.clearInterval(intervalId);
            reject();
        }, timeout);
    });
}
