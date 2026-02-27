import { GridManager } from './GridManager.js';
import { ComponentManager } from './ComponentManager.js';
import { WireManager } from './WireManager.js';
import { UIManager } from './UIManager.js';
import { Circuit } from '../model/Circuit.js';
import { VoltageSource, Resistor, LightBulb } from '../model/Components.js';
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
    zoom;
    mapping;



    setMode(newMode) {
        this.mode = newMode;
    }

    resizeCanvas() {
        //https://fabricjs.com/docs/old-docs/fabric-intro-part-5/
        let main = document.querySelector('main');
        let containerWidth = main.clientWidth;
        let containerHeight = main.clientHeight;
        this.canvas.setDimensions({
            width: containerWidth,
            height: containerHeight
        });


        console.log('Resizing canvas to fit container:', containerWidth, containerHeight);
        this.zoom = Math.min(containerWidth / this.gridManager.designWidth, containerHeight / this.gridManager.designHeight);
        console.log('Calculated zoom:', this.zoom);
        this.canvas.setZoom(this.zoom);

        //Centering the canvas on the grid, helped with Copilot----
        const panX = (containerWidth - (this.gridManager.designWidth * this.zoom)) / 2;
        const panY = (containerHeight - (this.gridManager.designHeight * this.zoom)) / 2;

        let viewportTransform = this.canvas.viewportTransform;
        viewportTransform[4] = panX;
        viewportTransform[5] = panY;
        //-------


        this.canvas.requestRenderAll();
        this.canvas.calcOffset();



    }

    bindEvents() {
        this.canvas.on('mouse:down', (options) => {
            let target = options.target;
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
                            console.log("double clicked switch");
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
                            // console.log("rotating component");
                            this.componentManager.rotateComponent(parentComponent);
                            break;
                        case "delete":
                            // console.log("deleting component");
                            this.componentManager.deleteComponent(parentComponent);
                            
            this.uiManager.hideButtons();
                            break;
                        case "plus":
                            // console.log("starting to connect from plus");
                            this.wireManager.connectingFrom = "plus";
                            this.wireManager.startConnecting(parentComponent);
                            
            this.uiManager.hideButtons();

                            break;
                        case "minus":
                            // console.log("starting to connect from minus");
                            this.wireManager.connectingFrom = "minus";
                            this.wireManager.startConnecting(parentComponent);
                            
            this.uiManager.hideButtons();
                            break;
                        case "lineDeletion":
                            // console.log("toggling line deletion mode");
                            this.wireManager.toggleLineDeletionMode();
                            
            this.uiManager.hideButtons();
                            break;
                        default:
                            break;
                    }
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
                        //this.wireManager.stopConnecting(null);
                    }
                }
            }
            if (target && target.entityType === "component") {
                this.gridManager.clearOldPositionOfComponent(target);
                if (target.left > this.gridManager.designWidth - this.gridManager.gridOffsetX) {
                    // console.log("deleting component");
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
                    //console.log("showing buttons for component:", target);
                    this.uiManager.showButtons(target);
                }
                this.componentManager.updateConnectionPositions(target);
            }
            console.log("Calculating circuit...");
            this.calculateCircuit();
            this.canvas.requestRenderAll();
        });




        this.canvas.on('mouse:down', (options) => {
            if (options.target == null) {
                this.uiManager.hideButtons();
                if (this.mode === 'lineDeletion') {
                    this.wireManager.toggleLineDeletionMode();
                }
                //console.log('Canvas mouse down:');
                if (this.mode === 'connect') {
                    this.wireManager.stopConnecting(null);
                }
            }
        });


    }
    init() {
        this.gridManager.drawGridLines(this.canvas);
        this.gridManager.drawBackground(this.canvas);


        this.resizeCanvas();
        this.setMode("select");
    }

    resizeTimeout;
    /*window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => this.resizeCanvas(), 100);
});*/
    prepareCircuit() {
        let circuit = new Circuit();
        this.mapping = new Map();
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
    updateCircuit() {
        this.mapping.forEach((value, key) => {
            if (key.name !== "Switch") {
                key.calculatorComponent.setVoltage(value.getVoltage());
                key.calculatorComponent.setCurrent(value.getCurrent());
                key.calculatorComponent.setResistance(value.getResistance());

                if (key.name === "Light Bulb") {
                    console.log("Updating brightness of bulb " + key.name);
                    this.componentManager.updateBrightnessOfBulb(key);
                } else {
                    console.log("Not a light bulb component: " + key.name);
                }
            }
        });
    }
    calculateCircuit() {
        this.prepareCircuit();
        ModifiedNodalAnalysis.calculateCircuit(this.myCircuit);
        console.log("Circuit calculation complete. Updating component values...");
        this.updateCircuit();
    }
}
