import TYPE from './command-type';


export default class TestDoneCommand {
    constructor () {
        this.type = TYPE.testDone;
    }
}
