export const css = `.gui-container-overlay {
    position: fixed;
    top: 24px;
    left: 24px;
    width: 540px;
    max-height: 250px;
    overflow: hidden;
    background: #fff;
    padding: 8px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    border-radius: 12px;
    font-family: Roboto, Arial, sans-serif;
    display: flex;
    z-index: 999999;
}

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

.gui-button-toggle.active {
    background-color: #018786;
    box-shadow: 0 2px 6px rgba(1, 135, 134, 0.7);
}
.gui-button-toggle.active:hover {
    background-color: #00504a;
}

.gui-button:disabled,
.gui-button[disabled]{
    cursor: not-allowed;
    border: 1px solid #999999;
    background-color: #cccccc;
    color: #666666;
}

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

input[type="file"] {
    display: none;
}

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
}`

export const compressedCss = `.gui-container-overlay{position:fixed;top:24px;left:24px;width:540px;max-height:250px;overflow:hidden;background:#fff;padding:8px;box-shadow:0 4px 24px #0003;border-radius:12px;font-family:Roboto,Arial,sans-serif;display:flex;z-index:999999}.gui-left-panel{flex:1;display:flex;flex-direction:column;gap:8px;padding-right:12px;border-right:1px solid #eee;min-width:220px}.gui-right-panel{flex:1;display:flex;flex-direction:column;gap:8px;padding-left:12px;overflow-y:auto;max-height:100%}.gui-labeled-element{display:flex;flex-direction:column}.gui-label{font-size:14px;color:#555;margin-bottom:-4px;user-select:none}.gui-input{padding:4px 6px;font-size:12px;border:1px solid #ccc;border-radius:6px;outline-offset:2px;transition:border-color .3s ease,box-shadow .3s ease;font-family:inherit}.gui-input:focus{border-color:#6200ee;box-shadow:0 0 0 3px #6200ee33}.gui-select{padding:4px 6px;font-size:12px;border-radius:6px;border:1px solid #ccc;outline-offset:2px;font-family:inherit}.gui-select:focus{border-color:#6200ee;box-shadow:0 0 0 3px #6200ee33}.gui-buttons-container{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;width:100%}.gui-button{background-color:#6200ee;border:none;color:#fff;padding:8px 16px;font-size:14px;font-weight:500;border-radius:6px;cursor:pointer;transition:background-color .3s ease;box-shadow:0 2px 6px #6200ee4d;user-select:none;align-self:flex-start}.gui-button:hover{background-color:#3700b3}.gui-button:active{box-shadow:0 1px 3px #3700b399}.gui-button-toggle.active{background-color:#018786;box-shadow:0 2px 6px #018786b3}.gui-button-toggle.active:hover{background-color:#00504a}.gui-button:disabled,.gui-button[disabled]{cursor:not-allowed;border:1px solid #999999;background-color:#ccc;color:#666}.gui-info-container{font-size:14px;color:#222;background:#f9f9f9;border-radius:6px;padding:12px;overflow-y:auto;flex:1;min-height:100px}.gui-info-line{margin-bottom:0}input[type=file]{display:none}.gui-right-panel{scrollbar-width:thin;scrollbar-color:#ccc #f9f9f9}.gui-right-panel::-webkit-scrollbar{width:8px}.gui-right-panel::-webkit-scrollbar-thumb{background-color:#ccc;border-radius:4px}.gui-right-panel::-webkit-scrollbar-track{background:#f9f9f9}`;