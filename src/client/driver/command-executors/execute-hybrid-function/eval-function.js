import hammerhead from '../../deps/hammerhead';

// NOTE: expose Promise to the function code
/* eslint-disable no-unused-vars */
var Promise = hammerhead.Promise;
/* eslint-enable no-unused-vars */

// NOTE: evalFunction is isolated into separate module to
// restrict evaluated code access to the TestCafe intrinsics.
export default function evalFunction (fnCode) {
    // NOTE: `eval` in strict mode will not override context variables
    'use strict';
    /* eslint-disable no-eval */
    return eval(fnCode);
    /* eslint-enable no-eval */
}
