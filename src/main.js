import PromiseEmitter from 'promise=emitter'

let nodeHandlers = {
    then(source, target, node) {
        return source.then(Function('data', node.data), null, target);
    },
    catch(source, target, node) {
        return source.catch(Function('data', node.data), target);
    },
    when(source, target, node) {
        return source.when(node.data, target);
    },
    except(source, target, node) {
        return source.except(node.data, target);
    }
};

export function sfunge(sfungeCode) {

    let parsedCode = JSON.parse(sfungeCode);

    let nodes = parsedCode.nodes.reduce((prev, curr) => {
        prev[curr.id] = {props : curr};
        if (curr.type !== 'trigger') prev[curr.id].emitter = new PromiseEmitter;
        return prev;
    }, {});

    let triggerListeners = {};

    parsedCode.edges.forEach((each) => {
        let source = nodes[each.source];
        let target = nodes[each.target];
        if (target.props.type === 'trigger') {
            return;
        } else if (source.props.type === 'trigger') {
            triggerListeners[each.source] && (triggerListeners[each.source] = []);
            triggerListeners[each.source].push(target);
        } else {
            nodeHandlers[target.props.type](source.emitter, target.emitter, target.props);
        }
    });

    return (triggers = {}) => {
        triggers.entrance = new PromiseEmitter;
        triggers.exit = new PromiseEmitter;

        Object.keys(triggers).forEach((each) => {
            if (!triggers[each] instanceof PromiseEmitter) return;
            if (!triggerListeners[each]) return;

            triggerListeners[each].forEach((eachTarget) => {
                nodeHandlers[eachTarget.type](triggers[each], eachTarget.emitter, eachTarget.props);
            });
        });

        return {
            entrance : triggers.entrance,
            exit : triggers.exit,
            emit : triggers.entrance.emit.bind(triggers.entrance),
            then : triggers.exit.then.bind(triggers.exit),
            catch : triggers.exit.catch.bind(triggers.exit),
            when : triggers.exit.when.bind(triggers.exit),
            except : triggers.exit.except.bind(triggers.exit)
        };
    }
}