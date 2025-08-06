import { GUI } from './GUI'
import global from './global'
import Storage from './Storage'
import './fetchListener'
import Template from './Template'
import { to2d } from './utils'
import Bot from './Bot'


if(unsafeWindow.document.readyState === "loading") {
    unsafeWindow.document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
let template: Template | undefined;
let bot: Bot;
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
    // if (global.storage.has('strat')) {
    //     gui.stratSelect.value = global.storage.get('strat') || 'default';
    // }

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
        return new Template({
            name: src.startsWith('data:image') ? 'cached' : src.split('/')[0] || 'unknown',
            x, y
        })
        .load(src)
        .then(templated => {
            gui.appendInfo('template is ready');
            return templated
        });
    }
    template = await setupTemplate();

    function setupBot() {
        bot = new Bot();
    }
    setupBot();

    function handleQuantization() {
		if(template && template.readyState !== Template.QUANTIZED) {
			const start = performance.now();
			template.quantize();
			gui.appendInfo(`template quantized in ${((performance.now() - start) / 1e3).toFixed(3)} s.`);
		}
		
		return template;
	}

    global.gui = gui;
    global.bot = bot;
    global.template = template!;
    
    gui.appendInfo('wplace-bot by nof');
    gui.startButton.onclick = () => {
        if (!bot) {
            gui.appendInfo('template not loaded');
            return;
        }
        if (gui.started) {
            if (!template) {
                gui.appendInfo('template not loaded');
                return;
            }
            handleQuantization();
            gui.appendInfo('Enabling');
            bot.start();
        } else {
            gui.appendInfo('Disabling');
            bot.stop();
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

    gui.farmerButton.onclick = () => {
        if (gui.startedFarm) {
            if (!global.storage.has('coords')) {
                gui.appendInfo(`Set coords first`);
                return;
            }
            gui.appendInfo(`Starting farmer`);
            if (!bot) {
                gui.appendInfo(`bot is not ready`);
            }
            bot.startFarmer();
        } else {
            gui.appendInfo(`Stopping farmer`);
            bot.stop();
        }
    };

    // gui.stratSelect.addEventListener('change', () => {
    //     const selected = gui.stratSelect.options[gui.stratSelect.selectedIndex];
    //     global.storage.set('strat', selected.value);
    //     gui.appendInfo(`Selected ${selected.label}`);
    // });

}

