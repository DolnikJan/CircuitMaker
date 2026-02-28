
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
            zoom;

                //Resizes the canvas to fit the window, making sure its as big as it can be
            resizeCanvas() {
                //https://fabricjs.com/docs/old-docs/fabric-intro-part-5/
                let main = document.querySelector('main');
                let containerWidth = main.clientWidth;
                let containerHeight = main.clientHeight;
                this.canvas.setDimensions({
                    width: containerWidth,
                    height: containerHeight
                });
                this.zoom = Math.min(containerWidth / this.designWidth, containerHeight / this.designHeight);
                this.canvas.setZoom(this.zoom);

                //Centering the canvas on the grid, helped with Copilot----
                const panX = (containerWidth - (this.designWidth * this.zoom)) / 2;
                const panY = (containerHeight - (this.designHeight * this.zoom)) / 2;
                let viewportTransform = this.canvas.viewportTransform;
                viewportTransform[4] = panX;
                viewportTransform[5] = panY;
                //-------
                this.canvas.requestRenderAll();
                this.canvas.calcOffset();



            }
            //Creates the gray, blue and red rectangles
            drawBackground() {
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
            //Draws the grid lines on the canvas, based on the grid size and offsets.
            drawGridLines() {
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

                    this.canvas.add(lineX);
                    this.canvas.add(lineY);
                    this.canvas.sendObjectToBack(lineX);
                    this.canvas.sendObjectToBack(lineY);
                    this.bottom += 2;
                }
                this.canvas.requestRenderAll();
            }
            //Sets up the Array that keeps track of which grid positions are occupied by components, initializing it to be empty.
            setUpCanvasGrid() {
                for (let i = 0; i < this.gridHeight; i += 1) {
                    this.canvasGrid.push(new Array(this.gridWidth).fill(null));
                }
             
            }
            //Returns the adequate grid position for a given left and top position on the canvas
            getGridArrayFromPosition(left, top) {

                let gridX = Math.round(left / this.gridSize) - this.gridArrayOffsetX;
                let gridY = Math.round(top / this.gridSize) - this.gridArrayOffsetY;
                if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
                    return { gridX, gridY };
                }
                return null;
            }
            //Checks if a given grid position is empty (not occupied by a component)
            isGridPositionEmpty(gridX, gridY) {
                if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
                    return this.canvasGrid[gridY][gridX] == null;
                }
                return false;
            }
            //Removes a component from the grid, setting its grid position to null in the canvasGrid array.
            removeComponentFromGrid(component) {
                if (component.gridPositionY != null && component.gridPositionX != null) {
                    this.canvasGrid[component.gridPositionY][component.gridPositionX] = null;
                }
            }
            //Clears the old position of a component on the grid, setting it to null in the canvasGrid array.
            clearOldPositionOfComponent(component) {
                if (component.startX != null && component.startY != null) {
                    this.canvasGrid[component.startY][component.startX] = null;
                }
            }
            //Adds a component to the grid at a specified grid position, and updates the component's gridPositionX and gridPositionY properties.
            addComponentToGrid(component, gridX, gridY) {
                if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
                    this.canvasGrid[gridY][gridX] = component;
                    component.gridPositionX = gridX;
                    component.gridPositionY = gridY;
                }
            }
        }
