import global from "./global"
import { compressedCss } from "./style";
const style = document.createElement('style');
style.textContent = compressedCss;
document.head.appendChild(style);


export class GUI {
    private container: HTMLDivElement;
    
    private leftPanel: HTMLDivElement;
    private rightPanel: HTMLDivElement;
    
    public coords: HTMLInputElement;
    public onlyOnVirgin: HTMLInputElement;
    public stratSelect: HTMLSelectElement;
    public imageBase64: string | null = null;
    public startButton: HTMLButtonElement;
    public farmerButton: HTMLButtonElement;
    public pickCoords: HTMLButtonElement;
    
    private infoContainer: HTMLDivElement;
    
    public started = false;
    public startedFarm = false;
    
    
    constructor(
        stratOptions: string[],
        parent: HTMLElement = document.body,
    ) {
        this.container = document.createElement('div');
        this.container.className = 'gui-container-overlay';
        parent.appendChild(this.container);
        
        this.leftPanel = document.createElement('div');
        this.leftPanel.className = 'gui-left-panel';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'gui-buttons-container';
        this.leftPanel.appendChild(buttonsContainer);
        
        this.rightPanel = document.createElement('div');
        this.rightPanel.className = 'gui-right-panel';
        
        this.container.appendChild(this.leftPanel);
        this.container.appendChild(this.rightPanel);
        
        
        this.coords = this.createStringInput('coords');
        
        this.stratSelect = document.createElement('select');
        this.stratSelect.className = 'gui-select';
        stratOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1); 
            this.stratSelect.appendChild(option);
        });
        
        this.leftPanel.appendChild(this.createLabeledElement('strat', this.stratSelect));
        this.onlyOnVirgin = this.createCheckboxInput('onlyOnVirgin');
        this.onlyOnVirgin.checked = global.storage.get('onlyOnVirgin') ?? false;
        
        const imageBtn = document.createElement('button');
        imageBtn.type = 'button';
        imageBtn.className = 'gui-button';
        imageBtn.textContent = 'Image';
        buttonsContainer.appendChild(imageBtn);
        
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
        
        this.infoContainer = document.createElement('div');
        this.infoContainer.className = 'gui-info-container';
        this.rightPanel.appendChild(this.infoContainer);
    }
    
    private createLabeledElement(labelText: string, element: HTMLElement): HTMLDivElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'gui-labeled-element';
        
        const label = document.createElement('label');
        label.textContent = labelText+": ";
        label.className = 'gui-label';
        
        wrapper.appendChild(label);
        wrapper.appendChild(element);
        
        return wrapper;
    }
    
    private createStringInput(name: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'gui-input';
        input.step = 'any';
        
        this.leftPanel.appendChild(this.createLabeledElement(name, input));
        return input;
    }

    private createCheckboxInput(name: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'gui-input';
    
        this.leftPanel.appendChild(this.createLabeledElement(name, input));
        return input;
    }
    
    appendInfo(text: any) {
        const line = document.createElement('div');
        line.className = 'gui-info-line';
        line.textContent = text.toString();
        this.infoContainer.appendChild(line);
        this.infoContainer.scrollTop = this.infoContainer.scrollHeight;
    }
    
    clearInfo() {
        this.infoContainer.innerHTML = '';
    }
    
    public updateStartButton() {
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

    public updateStartFarmButton() {
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