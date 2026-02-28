        import { CircuitEditor } from './userinterface/CircuitEditor.js';

        const canvas = new fabric.Canvas('canvas');
        canvas.backgroundColor = 'white';
        canvas.preserveObjectStacking = true;
        canvas.selection = false;

        const myApp = new CircuitEditor(canvas);
        window.myApp = myApp; 
        myApp.init();

      