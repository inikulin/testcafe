import AutomationCommandExecutor from './command-executors/automation';

export default function (command) {
    if (command.type === 'click')
        return new AutomationCommandExecutor();

    return null;
}
