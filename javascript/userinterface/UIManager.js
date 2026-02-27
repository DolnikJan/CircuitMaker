       import { VoltageSource } from '../model/Components.js';
       export class UIManager {
            constructor(circuitManager) {
                this.canvas = circuitManager.canvas;
                this.circuitManager = circuitManager;
                this.resistanceInput = document.getElementById('resistance');
                this.voltageInput = document.getElementById('voltage');
                this.currentInput = document.getElementById('current');
                this.resistanceInput.onchange = () => {
                    this.circuitManager.componentManager.updateComponentValue(this.circuitManager.componentManager.selectedComponent, this.resistanceInput.value);
                    this.circuitManager.calculateCircuit();
                    this.updateInputs(this.circuitManager.componentManager.selectedComponent);
                };
                this.voltageInput.onchange = () => {
                    this.circuitManager.componentManager.updateComponentValue(this.circuitManager.componentManager.selectedComponent, this.voltageInput.value);

                    this.circuitManager.calculateCircuit();
                    this.updateInputs(this.circuitManager.componentManager.selectedComponent);
                };

            }
            text;
            text_holder;
            plus_button;
            minus_button;
            delete_button;
            rotate_button;
            lineDeletionButton;

            addButton(buttonName, url) {
                let button = new fabric.Image.fromURL(url).then((img) => {
                    this[buttonName] = img;
                    this.buttonSetUp(img);
                    return img;
                });
            }
            buttonSetUp(button) {
                button.set({
                    hasControls: false,
                    hasBorders: false,
                    lockRotation: true,
                    selectable: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    visible: false,
                    dirty: true,
                    fill: 'black',
                    hoverCursor: 'pointer',
                    visible: false,
                    originX: 'center',
                    originY: 'center',
                    scaleX: 0.15,
                    scaleY: 0.15,
                    fontSize: 250



                });
                button.entityType = 'button';
                button.buttonType = null;
                this.canvas.add(button);
                switch (button) {
                    case this.text:
                        button.offsetX = 0;
                        button.offsetY = -70;
                        button.buttonType = "text";
                        break;
                    case this.text_holder:
                        button.offsetX = 0;
                        button.offsetY = -70;
                        button.set({ scaleX: 0.2, scaleY: 0.2 });
                        button.buttonType = "text_holder";
                        break;
                    case this.plus_button:
                        button.offsetX = 90;
                        button.offsetY = 0;
                        button.buttonType = "plus";
                        break;
                    case this.minus_button:
                        button.offsetX = -90;
                        button.offsetY = 0;
                        button.buttonType = "minus";
                        break;
                    case this.delete_button:
                        button.offsetX = 70;
                        button.offsetY = 80;
                        button.buttonType = "delete";
                        break;
                    case this.rotate_button:
                        button.offsetX = -70;
                        button.offsetY = 80;
                        button.buttonType = "rotate";
                        break;
                    case this.lineDeletionButton:
                        button.offsetX = 0;
                        button.offsetY = 80;
                        button.buttonType = "lineDeletion";
                        break;
                }
            }
            showButton(button, component) {
                if (button.buttonType === "text") {
                    button.set({
                        text: component.name
                    });

                }
                button.set({
                    left: component.left + button.offsetX,
                    top: component.top + button.offsetY,
                    visible: true,
                });
                button.parentComponent = component;
                button.setCoords();
                this.canvas.bringObjectToFront(button);
            }
            hideButton(button) {
                button.set({
                    visible: false,
                });
            }
            showButtons(component) {
               // console.log("showing buttons for component:", component);

                this.showButton(this.text_holder, component);
                this.showButton(this.text, component);
                this.showButton(this.plus_button, component);
                this.showButton(this.minus_button, component);
                this.showButton(this.delete_button, component);
                this.showButton(this.rotate_button, component);
                this.showButton(this.lineDeletionButton, component);
                this.canvas.requestRenderAll();
            }
            hideButtons() {
                this.hideButton(this.text);
                this.hideButton(this.text_holder);
                this.hideButton(this.plus_button);
                this.hideButton(this.minus_button);
                this.hideButton(this.delete_button);
                this.hideButton(this.rotate_button);
                this.hideButton(this.lineDeletionButton);
                this.canvas.requestRenderAll();
            }
            initButtons() {
                // Setup Text Label
                this.text = new fabric.Text('', {
                    left: 150, top: 100, fontSize: 150, fill: 'black', originX: 'center', originY: 'center', width: 1000, scaleX: 0.2, scaleY: 0.2,
                });
                this.buttonSetUp(this.text);

                // Setup Images and bind their click events
                fabric.Image.fromURL('./images/text_holder.png').then((img) => {
                    this.text_holder = img; this.buttonSetUp(img);
                });

                fabric.Image.fromURL('./images/plus_button.png').then((img) => {
                    this.plus_button = img; this.buttonSetUp(img);

                });

                fabric.Image.fromURL('./images/minus_button.png').then((img) => {
                    this.minus_button = img; this.buttonSetUp(img);


                });

                fabric.Image.fromURL('./images/delete_button.png').then((img) => {
                    this.delete_button = img; this.buttonSetUp(img);

                });

                fabric.Image.fromURL('./images/rotate_button.png').then((img) => {
                    this.rotate_button = img; this.buttonSetUp(img);

                });

                fabric.Image.fromURL('./images/delete_line_button.png').then((img) => {
                    this.lineDeletionButton = img; this.buttonSetUp(img);

                });
            }
            updateInputs(component) {
                if (component.calculatorComponent) {
                    if (component.calculatorComponent instanceof VoltageSource) {
                        this.voltageInput.disabled = false;
                        this.resistanceInput.disabled = true;
                        this.currentInput.disabled = true;
                    } else if (component.name === "Switch") {
                        //console.log("updating inputs for switch");
                        this.voltageInput.disabled = true;
                        this.resistanceInput.disabled = true;
                        this.currentInput.disabled = true;
                    } else {
                     //   console.log("updating inputs for component:", component.name);
                        this.voltageInput.disabled = true;
                        this.resistanceInput.disabled = false;
                        this.currentInput.disabled = true;
                    }

                    if (component.calculatorComponent.getResistance() === null) {
                        this.resistanceInput.value = "";
                    } else {
                        this.resistanceInput.value = component.calculatorComponent.getResistance();
                    }
                    if (component.calculatorComponent.getVoltage() === null) {
                        this.voltageInput.value = "";
                    } else {
                        this.voltageInput.value = component.calculatorComponent.getVoltage();
                    }
                    if (component.calculatorComponent.getCurrent() === null) {
                        this.currentInput.value = "";
                    } else {
                        this.currentInput.value = component.calculatorComponent.getCurrent();
                    }
                } else {
                    this.resistanceInput.value = "";
                    this.voltageInput.value = "";
                    this.currentInput.value = "";
                }

            }
            saveInputs(component) {
                if (component.calculatorComponent) {
                    if (component.calculatorComponent instanceof VoltageSource) {
                        component.calculatorComponent.setVoltage(parseFloat(this.voltageInput.value));
                    } else if (component.name === "Switch") {
                       // console.log("switches don't have inputs to save");
                    } else {
                        component.calculatorComponent.setResistance(parseFloat(this.resistanceInput.value));
                    }
                } else {
                   // console.log("component does not have a calculator component to save inputs to");
                }
            }
        }
