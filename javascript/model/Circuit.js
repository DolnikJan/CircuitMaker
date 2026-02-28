import { Resistor, VoltageSource, } from './Components.js';
import { Node } from './Node.js';

export class Circuit {
    components = [];
    nodes = [];
    voltageSources = [];

    createComponent(name, value) {
        let component;
        switch(name) {
            case "Voltage Source":
                component= new VoltageSource(value, this);
                this.voltageSources.push(component);
                break;
            default:
                component= new Resistor(value, this);

        }
        this.components.push(component);

        
        component.minusNode = this.createNode();
        component.minusNode.addComponent(component);
        component.plusNode = this.createNode();
        component.plusNode.addComponent(component);
        return component;
    
    }
    createNode(){
        let node = new Node();
        this.nodes.push(node);
        node.setCircuit(this);
        return node;
    }
    //Merges two nodes together, removing the old node and replacing it with the new node in all components attached to the old node. used for connecting components
    mergeNodes(oldNode, newNode){
        if(oldNode === newNode) return;
        for (let component of oldNode.components) {
            component.replaceNode(oldNode, newNode);
            newNode.addComponent(component);
        }
        this.nodes.splice(this.nodes.indexOf(oldNode), 1);
    }
    //Creates a new circuit for each connected group of components and nodes(graph compoennt), and returns an array of the new circuits. Also removes any nodes with 0 or 1 components, and removes the components attached to those nodes as well.
    createSubCircuits() {
        let newCircuits= [];
        while(this.nodes.length > 0) {
            let circuit = new Circuit();
            let nodeQueue = [];
            let startingNode = this.nodes.shift();
            nodeQueue.push(startingNode);
            circuit.nodes.push(startingNode);

            //this.nodes.splice(this.nodes.indexOf(startingNode), 1);
            while(nodeQueue.length > 0) {
                let node = nodeQueue.pop();
                node.components.forEach(component => {
                if(circuit.components.includes(component)) return;
                circuit.components.push(component);
                this.components.splice(this.components.indexOf(component), 1);
                if(component instanceof VoltageSource) {
                    circuit.voltageSources.push(component);
                    this.voltageSources.splice(this.voltageSources.indexOf(component), 1);
                }
                if(component.minusNode  && !circuit.nodes.includes(component.minusNode )) {
                    circuit.nodes.push(component.minusNode );
                    nodeQueue.push(component.minusNode );
                    this.nodes.splice(this.nodes.indexOf(component.minusNode ), 1);
                }
                if(component.plusNode  && !circuit.nodes.includes(component.plusNode )) {
                    circuit.nodes.push(component.plusNode );
                    nodeQueue.push(component.plusNode );
                    this.nodes.splice(this.nodes.indexOf(component.plusNode ), 1);
                }
                });
                }
            newCircuits.push(circuit);
            }   
            let validCircuits=[]
            newCircuits.forEach((circuit) => {
                this.setupCircuit(circuit);
                if(circuit.nodes.length > 1) {
                    validCircuits.push(circuit);
                }
            });
            return validCircuits;
        }
    setupCircuit(circuit) {
   let spliced = true;
//removes any nodes with 0 or 1 components, and removes the components attached to those nodes as well.
    while (spliced) {
    spliced = false;
    for (let i = circuit.nodes.length - 1; i >= 0; i--) {
        let node = circuit.nodes[i];

        if (node.components.length === 0) {
            spliced = true;
            circuit.nodes.splice(i, 1);
            
        } else if (node.components.length === 1) {
            spliced = true;
            let component = node.components[0];

            component.setCurrent(0);
            if (!(component instanceof VoltageSource)) {
                component.setVoltage(0);
            }
            let compIndex = circuit.components.indexOf(component);
            if (compIndex > -1) circuit.components.splice(compIndex, 1);

            if (component instanceof VoltageSource) {
                let vsIndex = circuit.voltageSources.indexOf(component);
                if (vsIndex > -1) circuit.voltageSources.splice(vsIndex, 1);
            }
            if (component.minusNode !== null) {
                let minusIndex = component.minusNode.components.indexOf(component);
                if (minusIndex > -1) component.minusNode.components.splice(minusIndex, 1);
            }

            if (component.plusNode !== null) {
                let plusIndex = component.plusNode.components.indexOf(component);
                if (plusIndex > -1) component.plusNode.components.splice(plusIndex, 1);
            }

            circuit.nodes.splice(i, 1);
        }
    }
}
    //assigns numbers to the voltage sources and nodes for use in matrices.
    circuit.voltageSources.forEach(element => { element.number = circuit.voltageSources.indexOf(element); });
    circuit.nodes.forEach(element => { element.number = circuit.nodes.indexOf(element) - 1; });
 
}

    
    

}