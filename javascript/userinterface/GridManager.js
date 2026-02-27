
        export class GridManager {
            constructor(circuitManager, gridSize, gridOffsetX, gridOffsetY, gridWidth, gridHeight, gridArrayOffsetX, gridArrayOffsetY, designWidth, designHeight) {
                this.canvas = circuitManager.canvas;
                this.circuitManager = circuitManager;
                this.gridSize = gridSize;
                this.gridOffsetX = gridOffsetX;
                this.gridOffsetY = gridOffsetY;
                this.gridWidth = gridWidth;
                this.gridHeight = gridHeight;
                this.gridArrayOffsetX = gridArrayOffsetX;
                this.gridArrayOffsetY = gridArrayOffsetY;
                this.designWidth = designWidth;
                this.designHeight = designHeight;
                this.canvasGrid = [];
                this.setUpCanvasGrid();
            }
            bottom = 1;

            drawBackground(canvas) {
                const deskRectangle = new fabric.Rect({
                    left: 0,
                    top: 0,
                    fill: 'rgba(230, 230, 230)',
                    width: this.gridOffsetX,
                    height: this.designHeight,
                    selectable: false,
                    evented: false,
                });
                const removeComponentRectangle = new fabric.Rect({
                    left: this.designWidth - this.gridOffsetX,
                    top: 0,
                    fill: 'rgb(255,50,50)',
                    width: this.gridOffsetX,
                    height: this.designHeight,
                    selectable: false,
                    evented: false,
                });
                const blueRectangle = new fabric.Rect({
                    left: this.gridOffsetX,
                    top: 0,
                    fill: 'rgb(40, 150, 245)',
                    width: this.designWidth - this.gridOffsetX * 2,
                    height: this.designHeight,
                    selectable: false,
                    evented: false,
                });

                this.canvas.add(blueRectangle);
                this.canvas.add(deskRectangle);
                this.canvas.add(removeComponentRectangle);
                this.canvas.sendObjectToBack(blueRectangle);
                this.canvas.sendObjectToBack(deskRectangle);
                this.canvas.sendObjectToBack(removeComponentRectangle);
                this.bottom += 3;
                this.canvas.renderAll();
            }
            drawGridLines(canvas) {
                let offset = this.gridSize / 2;

                for (let i = 1; i < 11; i++) {
                    const lineY = new fabric.Line([
                        this.gridOffsetX,
                        (i * this.gridSize) - offset,
                        this.designWidth - this.gridOffsetX,
                        (i * this.gridSize) - offset
                    ], {
                        stroke: 'white',
                        strokeWidth: 1,
                        selectable: false,
                        evented: false,
                        hoverCursor: 'default',
                        hasControls: false,
                        hasBorders: false,
                        lockRotation: true,
                    });
                    const lineX = new fabric.Line([
                        (i * this.gridSize) - offset + this.gridOffsetX,
                        this.gridOffsetY,
                        (i * this.gridSize) - offset + this.gridOffsetX,
                        this.designHeight
                    ], {
                        stroke: 'white',
                        strokeWidth: 1,
                        selectable: false,
                        evented: false,
                        hoverCursor: 'default',
                        hasControls: false,
                        hasBorders: false,
                        lockRotation: true,
                    });

                    canvas.add(lineX);
                    canvas.add(lineY);
                    canvas.sendObjectToBack(lineX);
                    canvas.sendObjectToBack(lineY);
                    this.bottom += 2;
                }
                canvas.requestRenderAll();
            }
            setUpCanvasGrid() {
                for (let i = 0; i < this.gridHeight; i += 1) {
                    this.canvasGrid.push(new Array(this.gridWidth).fill(null));
                }
                /*
                canvasGrid.forEach(row => {
                    console.log(row);
                });*/
            }
            getGridArrayFromPosition(left, top) {

                let gridX = Math.round(left / this.gridSize) - this.gridArrayOffsetX;
                let gridY = Math.round(top / this.gridSize) - this.gridArrayOffsetY;
                if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
                    return { gridX, gridY };
                }
                return null;
            }
            isGridPositionEmpty(gridX, gridY) {
                if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
                    return this.canvasGrid[gridY][gridX] == null;
                }
                return false;
            }
            removeComponentFromGrid(component) {
                if (component.gridPositionY != null && component.gridPositionX != null) {
                    this.canvasGrid[component.gridPositionY][component.gridPositionX] = null;
                }
            }
            clearOldPositionOfComponent(component) {
                if (component.startX != null && component.startY != null) {
                    this.canvasGrid[component.startY][component.startX] = null;
                }
            }
            addComponentToGrid(component, gridX, gridY) {
                if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
                    this.canvasGrid[gridY][gridX] = component;
                    component.gridPositionX = gridX;
                    component.gridPositionY = gridY;
                }
            }
        }
