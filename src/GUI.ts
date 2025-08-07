import global from "./global"
import { compressedCss } from "./style";
const style = document.createElement('style');
style.textContent = compressedCss;
document.head.appendChild(style);

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
    public farmerButton: HTMLButtonElement;
    public pickCoords: HTMLButtonElement;
    
    // Для вывода информации
    private infoContainer: HTMLDivElement;
    
    // Состояние toggling start
    public started = false;
    public startedFarm = false;
    
    
    constructor(
        parent: HTMLElement = document.body,
        stratOptions: StratOption[] = [
            { value: 'default', label: 'Default Strategy' },
            { value: 'reverse', label: 'Reverse' }
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
        this.startButton.textContent = 'Print';
        buttonsContainer.appendChild(this.startButton);
        
        this.pickCoords = document.createElement('button');
        this.pickCoords.type = 'button';
        this.pickCoords.className = 'gui-button gui-button-toggle';
        this.pickCoords.textContent = 'Pick';
        buttonsContainer.appendChild(this.pickCoords);

        this.farmerButton = document.createElement('button');
        this.farmerButton.type = 'button';
        this.farmerButton.className = 'gui-button gui-button-toggle';
        this.farmerButton.textContent = 'Farmer';
        buttonsContainer.appendChild(this.farmerButton);
        
        this.startButton.addEventListener('click', () => {
            this.started = !this.started;
            this.updateStartButton();
        });
        
        this.farmerButton.addEventListener('click', () => {
            this.startedFarm = !this.startedFarm;
            this.updateStartFarmButton();
        });

        this.updateStartButton();
        this.updateStartFarmButton();
        
        // Правый блок — инфо
        this.infoContainer = document.createElement('div');
        this.infoContainer.className = 'gui-info-container';
        this.rightPanel.appendChild(this.infoContainer);
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
            this.farmerButton.disabled = true;
            this.startButton.textContent = 'Stop';
        } else {
            this.startButton.classList.remove('active');
            this.farmerButton.disabled = false;
            this.startButton.textContent = 'Print';
        }
    }

    private updateStartFarmButton() {
      if (this.startedFarm) {
          this.farmerButton.classList.add('active');
          this.startButton.disabled = true;
          this.farmerButton.textContent = 'Stop';
      } else {
          this.farmerButton.classList.remove('active');
          this.startButton.disabled = false;
          this.farmerButton.textContent = 'Farmer';
      }
  }
}