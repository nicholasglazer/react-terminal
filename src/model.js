import Rx, {Observable, Concat} from 'rx';
import commandsArr from './commandsHandler.js';
import cycle from 'cycle-react';
import {Map} from 'immutable';

function modifications$(intent) {

    const changeInputMod$ = intent.changeInput$.map((x) => (cmd) => {
        return cmd.set('input', x);
    });


    const clearInputMod$ = intent.clearInput$.map(() => (cmd) => {
        return cmd.set('input', '');
    });

    const submitInputMod$ = intent.submitInput$.map((x) => (cmd) => {
        function update() {
            console.log('model-submitInputMod$-cmd', cmd);

            // TODO: create command handler
            // array of functions
            // commandsArr.map(x => console.log(x));

            const hist = cmd.get('output').map(item => item.getIn(['cmdList', '1']));
            switch (x) {
                case 'history': return cmd.update('output', output => output
                    .map(item => item.set('output', hist)).toList());
                case 'clear': return cmd.withMutations(m => {
                    m.update('output', output => output.clear().toList());
                    m.set('input', '');
                });
                case 'hello': return cmd.withMutations(m => {
                    m.update('output', output => output.push(Map({
                        cmdList: x,
                        cmdOutput: 'world'
                    })));
                    m.set('input', '');
                });
                case 'author': return window.open('https://github.com/nicholasglazer', '_blank');
                default: return cmd.withMutations(m => {
                    m.update('output', output => output.push(Map({
                        cmdList: x,
                        cmdOutput: `bsh: command not found: ${x}`
                    })));
                    m.set('input', '');
                });
            }
        }
        return update();
    });

    return Observable.merge(
        changeInputMod$,
        clearInputMod$,
        submitInputMod$
    );
}

export default function model(intent, state) {
    const mod$ = modifications$(intent);
    return state.concat(mod$)
           .scan((cmd, mod) => mod(cmd))
            .map(st => st.toObject());
}
