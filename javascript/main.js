        import { CircuitEditor } from './userinterface/CircuitEditor.js';
        // 1. Set up the raw Fabric Canvas
        const canvas = new fabric.Canvas('canvas');
        canvas.backgroundColor = 'white';
        canvas.preserveObjectStacking = true;
        canvas.selection = false;

        // 2. Instantiate your shiny new Application!
        const myApp = new CircuitEditor(canvas);
        window.myApp = myApp; // For easy debugging in the console
        // 3. Initialize everything
        myApp.init();
        myApp.bindEvents();
        myApp.uiManager.initButtons();

        // 4. Handle Window Resizing smoothly
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => myApp.resizeCanvas(), 100);
        });