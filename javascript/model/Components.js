
export class Component {
    constructor(name) {
        this.name = name;
    }
    minusNode  = null;
    plusNode  = null;
    last_updated = null;
    voltage = 0;
    current = 0;
    resistance = 0;
     number = -1;

     replaceNode(oldNode, newNode) {
        if (this.minusNode  === oldNode) {
            this.minusNode  = newNode;
        } else if (this.plusNode  === oldNode) {
            this.plusNode  = newNode;
        }
    }
    setVoltage(voltage) {
        this.voltage = voltage;
        this.last_updated = Date.now();
    }
    setCurrent(current) {
        this.current = current;
        this.last_updated = Date.now();
    }
    setResistance(resistance) {
        this.resistance = resistance;
        this.last_updated = Date.now();
    }

    getVoltage() {
        return this.voltage;
    }
    getCurrent() {
        return this.current;
    }
    getResistance() {
        return this.resistance;
    }
    getName() {
        return this.name;
    }

    getLastUpdated() {
        return this.last_updated;
    }

    
    
}

export class VoltageSource extends Component {
    constructor(voltage) {
        super("Voltage Source");
        this.voltage = voltage;
    }

    getPower() {
        return this.voltage * this.current;
    }
}
export class Resistor extends Component {
    constructor(resistance) {
        super("Resistor");
        this.resistance = resistance;
    }

}

export class LightBulb extends Component {
    constructor(resistance) {
        super("Light Bulb");
        this.resistance = resistance;
    }

}


