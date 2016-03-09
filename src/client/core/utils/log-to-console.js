//NOTE: In IE9, console.log is defined only if dev tools are open.
export default function (msg) {
    if (window.console && window.console.log)
        window.console.log(msg);
}
