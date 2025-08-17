import { GUI } from './GUI'
import global from './global'
import Storage from './Storage'
import './fetchListener'
import Template from './Template'
import { getExtraColorsBitmap, getStrategyList, to2d } from './utils'
import Bot from './Bot'
import { basicTargeters, createBasicTargeter } from './targetersCreate'
import { ITargeter } from './types'

window.addEventListener('message', e => {
    if (e.data.token) {
        global.currentToken = e.data.token;
    }
})
if(unsafeWindow.document.readyState === "loading") {
    unsafeWindow.document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
let template: Template | undefined;
let targeter: ITargeter | undefined;
async function main() {
    global.storage = new Storage({ storageKey: 'settings' });
    if(!global.storage.has('firstStart')) {
        global.storage.set('firstStart', false);
        global.storage.set('coords', '0/0/0/0');
        global.storage.set('strat', 'down');
        global.storage.set('season', 0);
        global.storage.set('onlyOnVirgin', false);
    }
    const gui = new GUI(getStrategyList(basicTargeters));

    if (global.storage.has('coords')) {
        gui.coords.value = global.storage.get('coords') || '';
    }
    if (global.storage.has('strat')) {
        gui.stratSelect.value = global.storage.get('strat') || 'down';
    }
    await getExtraColorsBitmap();

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

    function handleQuantization() {
		if(template && template.readyState !== Template.QUANTIZED) {
			const start = performance.now();
			template.quantize();
			gui.appendInfo(`template quantized in ${((performance.now() - start) / 1e3).toFixed(3)} s.`);
		}
		
		return template;
	}
    function createTargeter() {
        const strategy = (global.storage.has('strat') && <string>global.storage.get('strat') in basicTargeters ? <string>global.storage.get('strat') : 'down');
        if (!strategy) {
            gui.appendInfo('strategy not found');
        }
        targeter = createBasicTargeter(template!, strategy);
        global.targeter = targeter!;
    }

    createTargeter();

    const bot = new Bot(targeter!);

    global.gui = gui;
    global.bot = bot;
    global.template = template!;
    
    gui.appendInfo('wplace-bot by nof');

    gui.coords.onchange = () => {
        if (gui.coords.value && gui.coords.value.split('/').length == 4) global.storage.set('coords', gui.coords.value)
    }
    gui.onlyOnVirgin.onchange = () => {
        global.storage.set('onlyOnVirgin', gui.onlyOnVirgin.checked)
    }
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
            gui.coords.value = global.tempCoords;
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

    gui.stratSelect.addEventListener('change', () => {
        const selected = gui.stratSelect.options[gui.stratSelect.selectedIndex];
        global.storage.set('strat', selected.value);
        gui.appendInfo(`Selected ${selected.label}`);
        createTargeter();
        bot.stop();
    });

}

