import global from "./global";
type StratOption = { value: string; label: string };

export class GUI {
    private container: HTMLDivElement;
    
    // Левый и правый блоки
    private leftPanel: HTMLDivElement;
    private rightPanel: HTMLDivElement;
    
    // Элементы управления
    public coords: HTMLInputElement;
    public stratSelect: HTMLSelectElement;
    public imageBase64: string | null = null;
    public startButton: HTMLButtonElement;
    public pickCoords: HTMLButtonElement;
    
    // Для вывода информации
    private infoContainer: HTMLDivElement;
    
    // Состояние toggling start
    public started = false;
    
    private static stylesInjected = false;
    
    constructor(
        parent: HTMLElement = document.body,
        stratOptions: StratOption[] = [
            { value: 'default', label: 'Default Strategy' },
            { value: 'WIP', label: 'WIP' }
        ]
    ) {
        this.container = document.createElement('div');
        this.container.className = 'gui-container-overlay';
        parent.appendChild(this.container);
        
        // Две колонки
        this.leftPanel = document.createElement('div');
        this.leftPanel.className = 'gui-left-panel';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'gui-buttons-container';
        this.leftPanel.appendChild(buttonsContainer);
        
        this.rightPanel = document.createElement('div');
        this.rightPanel.className = 'gui-right-panel';
        
        this.container.appendChild(this.leftPanel);
        this.container.appendChild(this.rightPanel);
        
        // Создаём элементы настроек слева
        
        this.coords = this.createStringInput('coords');
        
        this.stratSelect = document.createElement('select');
        this.stratSelect.className = 'gui-select';
        stratOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            this.stratSelect.appendChild(option);
        });
        
        // Добавим label и select
        this.leftPanel.appendChild(this.createLabeledElement('Strat:', this.stratSelect));
        
        // Кнопка image — выбор файла и чтение base64
        const imageBtn = document.createElement('button');
        imageBtn.type = 'button';
        imageBtn.className = 'gui-button';
        imageBtn.textContent = 'Image';
        buttonsContainer.appendChild(imageBtn);
        
        // Скрытый input для файлов
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.style.display = 'none';
        this.leftPanel.appendChild(imageInput);
        
        imageBtn.addEventListener('click', () => {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', e => {
            const files = imageInput.files;
            if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onerror = console.error;
                reader.onload = () => {
                    this.imageBase64 = reader.result as string;
                    global.storage.set('src', this.imageBase64);
                    this.appendInfo(`Loaded image: ${file.name}`);
                };
            }
        });
        
        // Кнопка start для тоггла
        this.startButton = document.createElement('button');
        this.startButton.type = 'button';
        this.startButton.className = 'gui-button gui-button-toggle';
        this.startButton.textContent = 'Start';
        buttonsContainer.appendChild(this.startButton);
        
        this.pickCoords = document.createElement('button');
        this.pickCoords.type = 'button';
        this.pickCoords.className = 'gui-button gui-button-toggle';
        this.pickCoords.textContent = 'Pick';
        buttonsContainer.appendChild(this.pickCoords);
        
        this.startButton.addEventListener('click', () => {
            this.started = !this.started;
            this.updateStartButton();
        });
        
        this.updateStartButton();
        
        // Правый блок — инфо
        this.infoContainer = document.createElement('div');
        this.infoContainer.className = 'gui-info-container';
        this.rightPanel.appendChild(this.infoContainer);
        
        if (!GUI.stylesInjected) {
            this.injectStyles();
            GUI.stylesInjected = true;
        }
    }
    
    private createLabeledElement(labelText: string, element: HTMLElement): HTMLDivElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'gui-labeled-element';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        label.className = 'gui-label';
        
        wrapper.appendChild(label);
        wrapper.appendChild(element);
        
        return wrapper;
    }
    
    // private createNumberInput(name: string): HTMLInputElement {
    //   const input = document.createElement('input');
    //   input.type = 'number';
    //   input.className = 'gui-input';
    //   input.step = 'any';
    
    //   this.leftPanel.appendChild(this.createLabeledElement(name + ':', input));
    //   return input;
    // }
    
    private createStringInput(name: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'gui-input';
        input.step = 'any';
        
        this.leftPanel.appendChild(this.createLabeledElement(name + ':', input));
        return input;
    }
    
    /** Добавить строку информации в правый блок */
    appendInfo(text: any) {
        const line = document.createElement('div');
        line.className = 'gui-info-line';
        line.textContent = text.toString();
        this.infoContainer.appendChild(line);
        // авто-скролл вниз
        this.infoContainer.scrollTop = this.infoContainer.scrollHeight;
    }
    
    /** Очистить информацию */
    clearInfo() {
        this.infoContainer.innerHTML = '';
    }
    
    /** Обновить визуал startButton по состоянию toggled */
    private updateStartButton() {
        if (this.started) {
            this.startButton.classList.add('active');
            this.startButton.textContent = 'Stop';
        } else {
            this.startButton.classList.remove('active');
            this.startButton.textContent = 'Start';
        }
    }
    
    private injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
      .gui-container-overlay {
        position: fixed;
        top: 24px;
        left: 24px;
        width: 540px;
        max-height: 250px; /* можно убрать или изменить */
        overflow: hidden;
        background: #fff;
        padding: 8px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        border-radius: 12px;
        font-family: Roboto, Arial, sans-serif;
        display: flex;
        z-index: 999999;
      }
    
      /* Левая и правая панель */
      .gui-left-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-right: 12px;
        border-right: 1px solid #eee;
        min-width: 220px;
      }
    
      .gui-right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-left: 12px;
        overflow-y: auto;
        max-height: 100%;
      }
    
      /* Лейблы и поля */
      .gui-labeled-element {
        display: flex;
        flex-direction: column;
      }
    
      .gui-label {
        font-size: 14px;
        color: #555;
        margin-bottom: -4px;
        user-select: none;
      }
    
      .gui-input {
        padding: 4px 6px;
        font-size: 12px;
        border: 1px solid #ccc;
        border-radius: 6px;
        outline-offset: 2px;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        font-family: inherit;
      }
      .gui-input:focus {
        border-color: #6200ee;
        box-shadow: 0 0 0 3px rgba(98, 0, 238, 0.2);
      }
    
      /* select */
      .gui-select {
        padding: 4px 6px;
        font-size: 12px;
        border-radius: 6px;
        border: 1px solid #ccc;
        outline-offset: 2px;
        font-family: inherit;
      }
      .gui-select:focus {
        border-color: #6200ee;
        box-shadow: 0 0 0 3px rgba(98, 0, 238, 0.2);
      }
    
      /* кнопки */
      .gui-buttons-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        width: 100%;
      }
    
      .gui-button {
        background-color: #6200ee;
        border: none;
        color: white;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        box-shadow: 0 2px 6px rgba(98, 0, 238, 0.3);
        user-select: none;
        align-self: flex-start;
      }
      .gui-button:hover {
        background-color: #3700b3;
      }
      .gui-button:active {
        box-shadow: 0 1px 3px rgba(55, 0, 179, 0.6);
      }
    
      /* Toggle active состояние у кнопки start */
      .gui-button-toggle.active {
        background-color: #018786;
        box-shadow: 0 2px 6px rgba(1, 135, 134, 0.7);
      }
      .gui-button-toggle.active:hover {
        background-color: #00504a;
      }
    
      /* Правый контейнер для информации */
      .gui-info-container {
        font-size: 14px;
        color: #222;
        background: #f9f9f9;
        border-radius: 6px;
        padding: 12px;
        overflow-y: auto;
        flex: 1;
        min-height: 100px;
      }
    
      .gui-info-line {
        margin-bottom: 0px;
      }
    
      /* Скрытый input */
      input[type="file"] {
        display: none;
      }
    
      /* прокрутка, если overflow-y */
      .gui-right-panel {
        scrollbar-width: thin;
        scrollbar-color: #ccc #f9f9f9;
      }
      .gui-right-panel::-webkit-scrollbar {
        width: 8px;
      }
      .gui-right-panel::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
      }
      .gui-right-panel::-webkit-scrollbar-track {
        background: #f9f9f9;
      }
    `;
        document.head.appendChild(style);
    }
}