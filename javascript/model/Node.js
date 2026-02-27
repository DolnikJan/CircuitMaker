
export class Node {
    number = 0;
    circuit = null;
    components = [];
    addComponent(component) {
        if(!this.components.includes(component)) {
        this.components.push(component);
        }
    }
    removeComponent(component) {
        this.components.splice(this.components.indexOf(component), 1);
    }
    setCircuit(circuit) {
        this.circuit = circuit;
    }
    getComponents() {
        return this.components;
    }
    getCircuit() {
        return this.circuit;
    }


}
