import TYPE from './command-type';

export default class ClickCommand {
    constructor (selector, options) {
        this.type = TYPE.click;

        this.arguments = {
            selector: null,
            options:  options
        };
    }
}
