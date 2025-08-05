import { GUI } from './GUI'
import global from './global'
import Storage from './Storage'
import './fetchListener'
import Template from './Template';
import { to2d } from './utils';
if(unsafeWindow.document.readyState === "loading") {
    unsafeWindow.document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
let template: Template;
async function main() {
    global.storage = new Storage({ storageKey: 'settings' });
    if(!global.storage.has('firstStart')) {
        global.storage.set('firstStart', false);
        global.storage.set('coords', '0/0/0/0');
        global.storage.set('strat', 'default');
        global.storage.set('season', 0);
    }
    // fetch("https://backend.wplace.live/s0/pixel/0/0", {
    //     "credentials": 'include',
    //     "body": '{"colors":[2],"coords":[0, 0]}',
    //     "method": 'POST'
    // });
    const gui = new GUI();

    if (global.storage.has('coords')) {
        gui.coords.value = global.storage.get('coords') || '';
    }
    if (global.storage.has('strat')) {
        gui.stratSelect.value = global.storage.get('strat') || 'default';
    }

    function setupTemplate() {
        if (!global.storage.has('src')) {
            gui.appendInfo('No template');
            return;
        }
        if (!global.storage.has('coords')) {
            gui.appendInfo('No coords');
            return;
        }
        const src = global.storage.get('src')!;
        const [x, y] = to2d(global.storage.get('coords')!);
        new Template({
            name: src.startsWith('data:image') ? 'cached' : src.split('/')[0] || 'unknown',
            x, y
        })
        .load(src)
        .then(templated => {
            gui.appendInfo('template is ready');
            template = templated;
        });
    }
    setupTemplate();
    
    gui.appendInfo('wplace-bot 1.0 by nof');
    gui.startButton.onclick = () => {
        if (gui.started) {
            gui.appendInfo('Enabling');
        } else {
            gui.appendInfo('Disabling');
        }
    };

    gui.pickCoords.onclick = () => {
        if (global.tempCoords) {
            global.storage.set('coords', global.tempCoords);
            if(template) {
                const [x, y] = to2d(global.tempCoords);
				template.moveX(x);
				template.moveY(y);
			}
            gui.appendInfo(`Template coords: ${global.tempCoords}`);
        } else {
            gui.appendInfo(`Pick pixel first`);
        }
    };

    gui.stratSelect.addEventListener('change', () => {
        const selected = gui.stratSelect.options[gui.stratSelect.selectedIndex];
        global.storage.set('strat', selected.value);
        gui.appendInfo(`Selected ${selected.label}`);
    });

}

