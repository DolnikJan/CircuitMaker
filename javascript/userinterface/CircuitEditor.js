import { GridManager } from './GridManager.js';
import { ComponentManager } from './ComponentManager.js';
import { WireManager } from './WireManager.js';
import { UIManager } from './UIManager.js';
import { Circuit } from '../model/Circuit.js';
import { VoltageSource } from '../model/Components.js';
import { ModifiedNodalAnalysis } from '../math/ModifiedNodalAnalysis.js';
export class CircuitEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.gridManager = new GridManager(this, 100, 200, 0, 9, 9, 3, 1, 1400, 1000);
        this.componentManager = new ComponentManager(this);
        this.wireManager = new WireManager(this);
        this.uiManager = new UIManager(this);
        this.myCircuit = new Circuit();

    }

    mode;
    canvas;
    gridManager;
    componentManager;
    wireManager;
    uiManager;
    mapping;
    resizeTimeout;
    eventTimer=false;



    setMode(newMode) {
        this.mode = newMode;
    }

    //Binds all the event listeners for interacting with the canvas
    bindEvents() {
        this.canvas.on('mouse:down', (options) => {
            let target = options.target;
            console.log(target);
            if (!target) {
                this.uiManager.hideButtons();
                if (this.mode === 'lineDeletion') {
                    this.wireManager.toggleLineDeletionMode();
                } else if (this.mode === 'connect') {
                    this.wireManager.stopConnecting(null);
                }
                return;
            }
            if (this.mode === "lineDeletion" && target.entityType !== "line") {
                this.wireManager.toggleLineDeletionMode();
                this.uiManager.hideButtons();
                return;
            }

            switch (target.entityType) {
                case "component":
                    if (this.mode === 'connect') {
                        let pointer = this.canvas.getPointer(options.e);
                        this.wireManager.setConnectingTo(target, pointer);
                        this.wireManager.stopConnecting(target);
                        return;
                    }

                    if (this.componentManager.timer) {
                        if (target.name === "Switch") {
                            this.componentManager.turnSwitch(target);
                            this.canvas.requestRenderAll();
                        }
                    }
                    this.componentManager.timer = true;

                    this.componentManager.selectedComponent = target;
                    this.uiManager.updateInputs(target);
                    setTimeout(() => {
                        this.componentManager.timer = false;
                    }, 400);
                    target.startX = target.gridPositionX;
                    target.startY = target.gridPositionY;
                    break;

                case "line":
                    if (this.mode === 'lineDeletion') {
                        this.wireManager.disconnectComponents(target);
                        this.uiManager.hideButtons();
                    }
                    break;

                case "button":
                    let parentComponent = target.parentComponent;
                    switch (target.buttonType) {
                        case "rotate":
                            this.componentManager.rotateComponent(parentComponent);
                            break;
                        case "delete":
                            this.componentManager.deleteComponent(parentComponent);

                           
                            break;
                        case "plus":
                            this.wireManager.connectingFrom = "plus";
                            this.wireManager.startConnecting(parentComponent);

                            this.uiManager.hideButtons();

                            break;
                        case "minus":
                            this.wireManager.connectingFrom = "minus";
                            this.wireManager.startConnecting(parentComponent);

                            this.uiManager.hideButtons();
                            break;
                        case "lineDeletion":
                            this.wireManager.toggleLineDeletionMode();

                            this.uiManager.hideButtons();
                            break;
                        default:
                            break;
                    }
                    this.eventTimer =true;
                        setTimeout(() => {
                            this.eventTimer = false;
                        }, 100);
                    break;
                default:
                    break;
            }
            this.canvas.requestRenderAll();
        });
        this.canvas.on('object:moving', (options) => {
            let target = options.target;
            if (target.entityType === "component") {
                this.uiManager.hideButtons();
                let gridPossition = this.gridManager.getGridArrayFromPosition(target.left, target.top);
                if (gridPossition) {
                    if (this.gridManager.isGridPositionEmpty(gridPossition.gridX, gridPossition.gridY) || (target.startX === gridPossition.gridX && target.startY === gridPossition.gridY)) {
                        target.left = Math.round(target.left / this.gridManager.gridSize) * this.gridManager.gridSize;
                        target.top = Math.round(target.top / this.gridManager.gridSize) * this.gridManager.gridSize;
                        target.gridPositionX = gridPossition.gridX;
                        target.gridPositionY = gridPossition.gridY;
                        target.setCoords();
                    }
                }
                this.componentManager.updateConnectionPositions(target);
            }
            this.canvas.requestRenderAll();
        });
        this.canvas.on('mouse:move', (options) => {
            if (this.mode === 'connect' && this.wireManager.connectingLine) {
                console.log("moving mouse while connecting");
                let pointer = this.canvas.getPointer(options.e);
                this.wireManager.connectingLine.set({
                    x2: pointer.x,
                    y2: pointer.y,
                });
                this.wireManager.connectingLine.setCoords();
                this.canvas.requestRenderAll();
            }
        });
        this.canvas.on('mouse:up', (options) => {
            if(this.eventTimer){
                return;
            }
            let target = options.target;
            if (this.mode === 'connect') {
                let pointer = this.canvas.getPointer(options.e);
                let gridPosition = this.gridManager.getGridArrayFromPosition(pointer.x, pointer.y);
                if (gridPosition) {
                    let x = gridPosition.gridX;
                    let y = gridPosition.gridY;

                    if (this.gridManager.canvasGrid[y] && this.gridManager.canvasGrid[y][x] != null) {
                        let targetComponent = this.gridManager.canvasGrid[y][x];
                        this.wireManager.setConnectingTo(targetComponent, pointer);
                        this.wireManager.stopConnecting(targetComponent);
                    } else {
                    }
                }
            }
            if (target && target.entityType === "component") {
                this.gridManager.clearOldPositionOfComponent(target);
                if (target.left > this.gridManager.designWidth - this.gridManager.gridOffsetX) {
                    this.componentManager.deleteComponent(target);
                    this.canvas.remove(target);
                    return;
                } else if (target.left < this.gridManager.gridOffsetX) {
                    target.gridPositionX = null;
                    target.gridPositionY = null;
                    [...target.lines1].forEach((line) => {
                        this.wireManager.disconnectComponents(line);
                    });
                    [...target.lines2].forEach((line) => {
                        this.wireManager.disconnectComponents(line);
                    });
                    this.calculateCircuit();
                    return;
                } else {
                    this.gridManager.addComponentToGrid(target, target.gridPositionX, target.gridPositionY);
                    target.set({
                        left: (target.gridPositionX + this.gridManager.gridArrayOffsetX) * this.gridManager.gridSize,
                        top: (target.gridPositionY + this.gridManager.gridArrayOffsetY) * this.gridManager.gridSize,
                    });
                    target.setCoords();
                    this.canvas.requestRenderAll();
                    this.componentManager.selectedComponent = target;
                    this.uiManager.showButtons(target);
                }
                this.componentManager.updateConnectionPositions(target);
            }
            this.calculateCircuit();
            this.canvas.requestRenderAll();
        });
        window.addEventListener('resize', () => {

            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.gridManager.resizeCanvas(), 100);
        });

    }
    //Inicialization
    init() {
        this.gridManager.drawGridLines(this.canvas);
        this.gridManager.drawBackground(this.canvas);
        this.gridManager.resizeCanvas();
        this.setMode("select");
        this.bindEvents();
        this.uiManager.initButtons();
    }
    //Prepares the userbuilt circuit for calculation 
    prepareCircuit() {
        let circuit = new Circuit();
        this.mapping = new Map();
        //Creates a map of components on to canvas to their corresponding components in the circuit,
        //  and also adds the components to the circuit. (every calculation creates its own new circuit,
        //  the calculation itself doesnt modify the circuit that the user built,
        //  it just reads from it and creates a new one based on it,
        //  so that we can keep all the properties of the components in the user interface separate from the calculation)
        this.componentManager.allComponents.forEach((component) => {
            if (component.calculatorComponent) {
                let value;
                if (component.calculatorComponent instanceof VoltageSource) {
                    value = component.calculatorComponent.voltage;
                } else {
                    value = component.calculatorComponent.resistance;
                }
                let createdComponent = circuit.createComponent(component.name, value);
                this.mapping.set(component, createdComponent);

            }
        });
        //Connects the components in the circuit together based on the wires by merging nodes together
        for (let line of this.wireManager.allLines) {
            let mappedComponentFrom = this.mapping.get(line.connectedFromComponent);
            let fromNode = mappedComponentFrom.minusNode;
            if (line.connectedFrom === "plus") {
                fromNode = mappedComponentFrom.plusNode;
            }
            let mappedComponentTo = this.mapping.get(line.connectedToComponent);
            let toNode = mappedComponentTo.minusNode;
            if (line.connectedTo === "plus") {
                toNode = mappedComponentTo.plusNode;
            }
            circuit.mergeNodes(fromNode, toNode);

        }
        this.myCircuit = circuit;
    }
    //Updates values of each component in the circuit based on the results of the circuit calculation, and updates the lighbulb as well
    updateCircuit() {
        this.mapping.forEach((value, key) => {
            if (key.name !== "Switch") {
                key.calculatorComponent.setVoltage(value.getVoltage());
                key.calculatorComponent.setCurrent(value.getCurrent());
                key.calculatorComponent.setResistance(value.getResistance());
                if (key.name === "Light Bulb") {
                    this.componentManager.updateBrightnessOfBulb(key);
                } else {
                }
            }
        });
    }
    //calculates the circuit and updates the values of each component in the user interface based on the results
    calculateCircuit() {
        this.prepareCircuit();
        ModifiedNodalAnalysis.calculateCircuit(this.myCircuit);
        this.updateCircuit();
    }
}
