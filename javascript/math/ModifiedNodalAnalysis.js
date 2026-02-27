import { MatrixMethods } from './MatrixMethods.js';
import { VoltageSource } from '../model/Components.js';

export class ModifiedNodalAnalysis{
 static  prepareMatrixG(circuit) {
    let activeNodesCount=circuit.nodes.length-1;
    let matrixG = MatrixMethods.createMatrix(activeNodesCount, activeNodesCount);
    matrixG.forEach(element => {
        console.log(element);
    });

    for (let node of circuit.nodes) {
        if(node.number === -1) continue;
       for (let component of node.components) {
            if ((component.getResistance() === undefined) || (!component.minusNode   || !component.plusNode  || (component instanceof VoltageSource)) )  continue;
            matrixG[node.number][node.number] += 1 / Math.max(component.getResistance(), 1e-10);
        }
    }
    for (let component of circuit.components) {
        if (component.minusNode  && component.plusNode ) {
            if (component.minusNode .number === -1 || component.plusNode .number === -1 || (component instanceof VoltageSource)) continue;
            matrixG[component.minusNode .number][component.plusNode .number] -= 1 / Math.max(component.getResistance(), 1e-10);
            matrixG[component.plusNode .number][component.minusNode .number] -= 1 / Math.max(component.getResistance(), 1e-10);
        }
    }

    return matrixG;
}
static prepareMatrixB(circuit) {
    let activeNodes = circuit.nodes.length - 1;
    let cols = circuit.voltageSources.length;
    let matrixB = MatrixMethods.createMatrix(activeNodes, cols);

    for (let source of circuit.voltageSources) {
        let index = circuit.voltageSources.indexOf(source);

        if (source.minusNode  && source.minusNode .number !== -1 && source.minusNode .number < activeNodes) {
            matrixB[source.minusNode .number][index] += -1;
        }
        if (source.plusNode  && source.plusNode .number !== -1 && source.plusNode .number < activeNodes) {
            matrixB[source.plusNode .number][index] += 1;
        }
    }
    return matrixB;
}

static prepareMatrixA(circuit) {
   //setupCircuit(circuit);
    let matrixG = this.prepareMatrixG(circuit);
    let matrixB = this.prepareMatrixB(circuit);
    let matrixC = MatrixMethods.transposeMatrix(matrixB);
    let matrixAsize = matrixG.length + matrixB[0].length;
    let matrixA = MatrixMethods.createMatrix(matrixAsize, matrixAsize);
    for (let i = 0; i < matrixG.length; i++) {
        for (let j = 0; j < matrixG[0].length; j++) {
            matrixA[i][j] = matrixG[i][j];
        }
    }
    for (let i = 0; i < matrixB.length; i++) {
        for (let j = 0; j < matrixB[0].length; j++) {
            matrixA[i][j + matrixG[0].length] = matrixB[i][j];
        }
    }

    for (let i = 0; i < matrixC.length; i++) {
        for (let j = 0; j < matrixC[0].length; j++) {
            matrixA[i + matrixG.length][j] = matrixC[i][j];
        }
    }

    for(let i =0; i<circuit.voltageSources.length; i++){
        let source = circuit.voltageSources[i];
        if(!source.minusNode || !source.plusNode ){
            matrixA[ matrixG.length + i][matrixG.length + i] = 1;
        }else{
            matrixA[ matrixG.length + i][matrixG.length + i] = -1e-6;
        }
    }
 return matrixA;
}
static prepareMatrixX(circuit) {
    return MatrixMethods.createMatrix(circuit.nodes.length + circuit.voltageSources.length, 1);

}
static prepareMatrixZ(circuit) {
    let activeNodes = circuit.nodes.length - 1;
    let matrixZ = MatrixMethods.createMatrix(activeNodes + circuit.voltageSources.length, 1);
    
    // Fill the Z matrix. The first 'activeNodes' rows remain 0.
    for (let i = 0; i < circuit.voltageSources.length; i++) {
        let source = circuit.voltageSources[i];
        if(!source.minusNode  || !source.plusNode ){
            matrixZ[activeNodes + i][0] = 0;
        } else {

        matrixZ[activeNodes + i][0] = source.getVoltage();
        }
    }
    
    return matrixZ;
}
static calculateCircuit(circuit) {
    let subCircuits = circuit.createSubCircuits();
    subCircuits.forEach(subCircuit => {
    let matrixA = this.prepareMatrixA(subCircuit);
    let matrixZ = this.prepareMatrixZ(subCircuit);
    const Ainv = MatrixMethods.matrix_invert(matrixA);
    let matrixI = MatrixMethods.multiplyMatrixByMatrix(Ainv, matrixZ);
    
    let activeNodes = subCircuit.nodes.length - 1;

    subCircuit.components.forEach(component => {
         if(component.minusNode  === null || component.plusNode  === null) {
                console.log("Component " + component.getName() + " is not fully connected. Skipping voltage and current calculation.");
                return;
            }
        if(component instanceof VoltageSource) {
            let sourceIndex = subCircuit.voltageSources.indexOf(component);
            let calculatedCurrent = matrixI[activeNodes + sourceIndex][0];

            
            component.setCurrent(Math.round(calculatedCurrent * 100) / 100);
        } else {
           
            let voltage = 0;
            if (component.minusNode  && component.minusNode .number !== -1) {
                voltage -= matrixI[component.minusNode .number][0];
            }
            if (component.plusNode  && component.plusNode .number !== -1) {
                voltage += matrixI[component.plusNode .number][0];
            }
            component.setVoltage(Math.round(voltage * 100) / 100);
            component.setCurrent(Math.round(voltage / component.getResistance() * 100) / 100);
        }
        console.log("Component: " + component.getName() + ", Voltage: " + component.getVoltage() + " Volts, Current: " + component.getCurrent() + " Amps");
    });
        });
}
}
