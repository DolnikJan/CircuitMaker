    export class WireManager {
            constructor(circuitManager) {
                this.canvas = circuitManager.canvas;
                this.circuitManager = circuitManager;
            }
            connectingLine = null;
            connectingFrom = null;
            connectingTo = null;
            allLines = [];

            startConnecting(component) {
                console.log("starting to connect from component:", component);
                this.circuitManager.mode = 'connect';
                this.circuitManager.componentManager.selectedComponent = component;
                let strokeColor = component.lineColor;
                let positions = this.circuitManager.componentManager.getConnectionPositions(component);
                let index = 0;
                if (this.connectingFrom === "minus") {
                    index = 1;
                }
                this.connectingLine = new fabric.Line([positions[index].x, positions[index].y, positions[index].x, positions[index].y], {
                    stroke: `rgb(${strokeColor[0]}, ${strokeColor[1]}, ${strokeColor[2]})`,
                    strokeWidth: 4,
                    selectable: false,
                    evented: false,
                    hasControls: false,
                    hasBorders: false,
                });
                this.canvas.add(this.connectingLine);
                this.canvas.bringObjectToFront(this.connectingLine);
                this.canvas.requestRenderAll();
                console.log("added connecting line:", this.connectingLine);
                /*
                this.canvas.on('mouse:move', (options) => {
                    if (this.circuitManager.mode) {
                        let pointer = this.canvas.getPointer(options.e);
                        this.connectingLine.set({ x2: pointer.x, y2: pointer.y });
                        this.canvas.requestRenderAll();
                    }
                });
*/
            }
            stopConnecting(component) {
                this.circuitManager.mode = 'select';
                console.log("stopping connecting to component:", component);
                if (component != null) {
                    this.connectComponents(this.circuitManager.componentManager.selectedComponent, component);
                    //this.canvas.off('mouse:move');
                }
                this.circuitManager.mode = 'select';
                if (this.connectingLine) {
                    this.canvas.remove(this.connectingLine);
                    this.connectingLine = null;
                    this.canvas.requestRenderAll();
                }
            }
            connectComponents(component1, component2) {
                console.log("connecting components:", component1, component2);

                let positions1 = this.circuitManager.componentManager.getConnectionPositions(component1);
                let positions2 = this.circuitManager.componentManager.getConnectionPositions(component2);
                let index1 = 0;
                let index2 = 0;
                if (this.connectingFrom === "minus") {
                    index1 = 1;
                }
                if (this.connectingTo === "minus") {
                    index2 = 1;
                }
                console.log("connection positions:", positions1, positions2);
                let strokeColor = component1.lineColor;
                const line = new fabric.Line([positions1[index1].x, positions1[index1].y, positions2[index2].x, positions2[index2].y], {
                    stroke: `rgb(${strokeColor[0]}, ${strokeColor[1]}, ${strokeColor[2]})`,
                    strokeWidth: 4,
                    selectable: false,
                    positionLeft1: positions1[index1].x,
                    positionTop1: positions1[index1].y,
                    positionLeft2: positions2[index2].x,
                    positionTop2: positions2[index2].y,
                    connectedFrom: this.connectingFrom,
                    connectedFromComponent: component1,
                    connectedTo: this.connectingTo,
                    connectedToComponent: component2,
                    evented: false,
                    hasControls: false,
                    hasBorders: false,
                    lockRotation: true,
                    perPixelTargetFind: true,
                    targetFindTolerance: 5,
                    visible: true,
                    width: 4,
                });
                line.entityType = 'line';



                this.connectingFrom = null;
                this.connectingTo = null;
                component1.lines1.push(line);
                component2.lines2.push(line);
                this.allLines.push(line);
                this.canvas.add(line);
                console.log("added line:", line);

                this.canvas.bringObjectToFront(line);
                this.canvas.requestRenderAll();
                console.log("connected components with line:", line);
                this.circuitManager.calculateCircuit();

                return line;
            }
            disconnectComponents(line) {
                if (!line.connectedFromComponent || !line.connectedToComponent) {
                    console.error("Line is not properly connected:", line);
                    return;
                }
                if (!line) {
                    console.error("Line is null or undefined:", line);
                    return;
                }
                line.connectedFromComponent.lines1.splice(line.connectedFromComponent.lines1.indexOf(line), 1);
                line.connectedToComponent.lines2.splice(line.connectedToComponent.lines2.indexOf(line), 1);
                this.allLines.splice(this.allLines.indexOf(line), 1);
                this.canvas.remove(line);
                this.canvas.requestRenderAll();
            }
            setConnectingTo(component, pointer) {
                let positions = this.circuitManager.componentManager.getConnectionPositions(component);
                let distanceToPlus = Math.hypot(pointer.x - positions[0].x, pointer.y - positions[0].y);
                let distanceToMinus = Math.hypot(pointer.x - positions[1].x, pointer.y - positions[1].y);
                if (distanceToPlus < distanceToMinus) {
                    this.connectingTo = "plus";
                } else {
                    this.connectingTo = "minus";
                }
            }

            toggleLineDeletionMode() {
                if (this.circuitManager.mode === 'lineDeletion') {
                    this.circuitManager.mode = 'select';
                } else {
                    this.circuitManager.mode = 'lineDeletion';
                }
                if (this.circuitManager.mode === 'lineDeletion') {
                    this.circuitManager.uiManager.hideButtons();
                    this.circuitManager.componentManager.selectedComponent.lines1.forEach((line, index) => {
                        line.set({
                            selectable: true,
                            evented: true,
                            hoverCursor: 'crosshair',
                        });
                        this.canvas.bringObjectToFront(line);
                    });
                    this.circuitManager.componentManager.selectedComponent.lines2.forEach((line, index) => {
                        line.set({
                            selectable: true,
                            evented: true,
                            hoverCursor: 'crosshair',
                        });
                        this.canvas.bringObjectToFront(line);
                    });
                    this.canvas.defaultCursor = 'crosshair';
                    /*
                    this.canvas.on('mouse:down', (options) => {
                        if (options.target && options.target.type === 'line') {
                            this.disconnectComponents(options.target);
                        }
                    });*/
                } else {
                    this.canvas.defaultCursor = 'default';

                    /*this.canvas.off('mouse:down');*/
                    this.circuitManager.componentManager.selectedComponent.lines1.forEach((line) => {
                        line.set({
                            selectable: false,
                            evented: false,
                            hoverCursor: 'default',
                        });
                        this.canvas.moveObjectTo(line, this.circuitManager.gridManager.bottom);
                    });
                    this.circuitManager.componentManager.selectedComponent.lines2.forEach((line) => {
                        line.set({
                            selectable: false,
                            evented: false,
                            hoverCursor: 'default',
                        });
                        this.canvas.moveObjectTo(line, this.circuitManager.gridManager.bottom);
                    });
                }
                this.canvas.requestRenderAll();
            }

        }
