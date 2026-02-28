     import { VoltageSource } from '../model/Components.js';
     export class ComponentManager {
            constructor(circuitManager) {
                this.canvas = circuitManager.canvas;
                this.circuitManager = circuitManager;
            }
            allComponents = [];
            selectedComponent = null;
            timer = false;

            //Creates a new component, adds it to the canvas, and sets up its properties.
            addComponent(url, name) {
                fabric.Image.fromURL(url).then((img) => {
                    img.name = name;
                    this.setUpComponent(img);
                    this.allComponents.push(img);
                    this.canvas.requestRenderAll();
                    return img;
                });
            }
            //Deletes a component from the canvas and the circuit, removing any wires connected to it and updating the circuit accordingly.
            deleteComponent(component) {

                if (!component) return;
                this.circuitManager.gridManager.removeComponentFromGrid(component);

                for (let i = component.lines1.length - 1; i >= 0; i--) {
                    this.circuitManager.wireManager.disconnectComponents(component.lines1[i]);
                }
                for (let i = component.lines2.length - 1; i >= 0; i--) {
                    this.circuitManager.wireManager.disconnectComponents(component.lines2[i]);
                }

                setTimeout(() => {
                     this.canvas.discardActiveObject();
                    this.canvas.remove(component);
                    this.canvas.requestRenderAll();
                }, 100);
                this.circuitManager.uiManager.hideButtons();
                this.circuitManager.calculateCircuit();
            }
            //Returns the positions of the plus and minus connections of a component, based on its rotation.
            getConnectionPositions(component) {
                let positions = [];
                switch (component.positionOfRotation) {
                    case 0:
                        positions.push({ x: component.left + 45, y: component.top });
                        positions.push({ x: component.left - 45, y: component.top });
                        break;
                    case 1:
                        positions.push({ x: component.left, y: component.top + 45 });
                        positions.push({ x: component.left, y: component.top - 45 });
                        break;
                    case 2:
                        positions.push({ x: component.left - 45, y: component.top });
                        positions.push({ x: component.left + 45, y: component.top });
                        break;
                    case 3:
                        positions.push({ x: component.left, y: component.top - 45 });
                        positions.push({ x: component.left, y: component.top + 45 });
                        break;
                }
                return positions;
            }
            //Sets up the properties of a new component, including its position, scale, connection positions wetc
            setUpComponent(img) {
                let color = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
                img.set({
                    left: 50,
                    dirty: true,
                    scaleX: 0.25,
                    scaleY: 0.25,
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    hasBorders: false,
                    lockRotation: true,
                    connectionPositions: [0, 45, 0],
                    positionOfRotation: 0,
                    lines1: [],
                    lines2: [],
                    lineColor: color,
                    gridPositionX: null,
                    gridPositionY: null,
                    startX: null,
                    startY: null,
                    calculatorComponent: null,


                });
                img.entityType = 'component';
                let value = 20;
                if (img.name === "Switch") {
                    value = 100000000;
                }
                img.calculatorComponent = this.circuitManager.myCircuit.createComponent(img.name, value);

                switch (img.name) {
                    case 'Light Bulb':
                        img.top = 150;
                        break;
                    case 'Resistor':
                        img.top = 250;
                        break;
                    case 'Voltage Source':
                        img.top = 350;
                        break;
                    case 'Switch':
                        img.top = 450;
                        img.isOn= false;
                        break;
                }
                this.canvas.add(img);
                this.canvas.requestRenderAll();
            }
            //Rotates a component 90 degrees clockwise, and updates its connection positions accordingly.
            rotateComponent(component) {
                component.rotate((component.angle + 90) % 360);
                component.set({
                    positionOfRotation: component.positionOfRotation + 1,
                });
                if (component.positionOfRotation === 4) {
                    component.positionOfRotation = 0;
                }
                switch (component.connectionPositions[0]) {
                    case 0:
                        component.connectionPositions = [1, 0, 45];
                        break;
                    case 1:
                        component.connectionPositions = [2, -45, 0];
                        break;
                    case 2:
                        component.connectionPositions = [3, 0, -45];
                        break;
                    case 3:
                        component.connectionPositions = [0, 45, 0];
                        break;
                }
                this.updateConnectionPositions(component);


                this.canvas.requestRenderAll();
            }
            //Updates the positions of the lines connected to a component, based on its current position and rotation.
            updateConnectionPositions(component) {
                let positions = this.getConnectionPositions(component);
                component.lines1.forEach((line) => {
                    if (line.connectedFrom === "plus") {
                        line.set({
                            x1: positions[0].x,
                            y1: positions[0].y,
                        });
                    } else {
                        line.set({
                            x1: positions[1].x,
                            y1: positions[1].y,
                        });
                    }
                    line.setCoords();
                });
                component.lines2.forEach((line) => {
                    if (line.connectedTo === "plus") {
                        line.set({
                            x2: positions[0].x,
                            y2: positions[0].y,
                        });
                    } else {
                        line.set({
                            x2: positions[1].x,
                            y2: positions[1].y,
                        });
                    }
                    line.setCoords();
                });

                this.canvas.requestRenderAll();
            }
            //Updates the value of a component (resistance or voltage), based on user input in the UI.
            updateComponentValue(component, value) {
                value = parseFloat(value);
                if (component.calculatorComponent) {
                    if (component.calculatorComponent instanceof VoltageSource) {
                        component.calculatorComponent.voltage = value;
                    } else {
                        if(value == 0) {
                            value = 1e-10;
                        }
                        component.calculatorComponent.resistance = value;
                    }
                }
            }
            //Toggles the state of a switch component, and updates its image and resistance accordingly.
            turnSwitch(component) {
                if (component.name === "Switch") {
                    if (component.isOn) {
                        component.setSrc('./images/switch_off.png').then(() => {
                            component.calculatorComponent.resistance = 100000000;
                            component.isOn = false;
                            this.canvas.requestRenderAll();
                            
                            this.circuitManager.calculateCircuit();
                        });
                    } else {
                       
                        component.setSrc('./images/switch_on.png').then(() => {
                            component.calculatorComponent.resistance = 1e-10;
                             component.isOn = true;
                            
                this.circuitManager.calculateCircuit();
                            this.canvas.requestRenderAll();
                        });
                    }
                } else {
                    return;
                }
            }
            //Updates the image of a light bulb component based on whether it is on or off (may add different brightness levels later based on current).
            updateBrightnessOfBulb(component) {
                if (component.name === "Light Bulb") {
                    if(component.calculatorComponent.current !== 0) {
                        component.setSrc('./images/light_bulb_on.png').then(() => {
                            this.canvas.requestRenderAll();
                        });
                } else {
                    component.setSrc('./images/light_bulb_off.png').then(() => {
                        this.canvas.requestRenderAll();
                    });
                }
                }
            }


        }
