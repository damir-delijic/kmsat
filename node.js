
const Formulas = require('./formula')

class Node {

    constructor(formulaString, formulas, parent){
        this.parent = parent
        this.label = formulaString
        this.isSAT = false
        this.formulas = formulas
        this.successors = []
        this.isTablo = false
        this.isExtendedTablo = false
        this.isClosed = false
    }

    print(){
        console.log(this.toTextual())
    }

    toTextual(){
        let result = ''

        for(let i = 0; i < this.successors.length; i++){
            result = result + (i > 0 ? ' / ' : '') + this.successors[i].toTextual()
        }
        if(result.length > 0){
            result = result
        }else{
            result = 'None'
        }
        return this.label + ' -> ' + result
    }

    deepCopyFormulas(){
        let copy = []
        let i, formula;
        for (i = 0; i < this.formulas.length; i++){
            formula = this.formulas[i]
            copy.push(formula)
        }

        return copy
    }

    createSuccessor(formula, deepCopy){
        let newFormulas;
        if(deepCopy){
            newFormulas = this.deepCopyFormulas()
        }else{
            newFormulas = this.formulas
        }
        newFormulas.push(formula)
        let successor = new Node(formula.toTextual(), newFormulas, this)
        this.successors.push(successor)
        return successor
    }

    createSuccesorWithTwoMore(formulas){
        let newFormulas = this.formulas
        let newLabel = ''
        for(let i = 0; i < formulas.length; i++){
            newFormulas.push(formulas[i])
            newLabel = newLabel + formulas[i].toTextual() + ', '
        }
        
        let successor = new Node(newLabel, newFormulas, this)
        this.successors.push(successor)
        return successor
    }

    findDoubleNegationWitness(){
        let i, formula;
        for(i = 0; i < this.formulas.length; i++){
            formula = this.formulas[i]
            if(formula.isDoubleNegation()){
                if(!this.contains(formula.formula.formula)){
                    return formula
                }
            }
        }

        return false
    }

    findConjunction(){
        let i, formula;
        for(i = 0 ; i < this.formulas.length; i++){
            formula = this.formulas[i]
            if(formula.type == 'Binary'){
                if(!(this.contains(formula.f1) && this.contains(formula.f2))){
                    return formula
                }
            }
        }
        return false
    }

    findConjunctionNegation(){
        let i, formula;
        for(i = 0 ; i < this.formulas.length; i++){
            formula = this.formulas[i]
            if(formula.type == 'Unary' && formula.operator == '!'){
                let innerFormula = formula.formula
                if(innerFormula.type == 'Binary'){
                    let f1Negation = new Formulas.UnaryOperatorFormula('!', innerFormula.f1)
                    let f2Negation = new Formulas.UnaryOperatorFormula('!', innerFormula.f2)
                    
                    let result = [false, false, false]

                    if(!this.contains(f1Negation) && !this.contains(f2Negation)){
                        result[0] = true
                        result[1] = f1Negation
                        result[2] = f2Negation
                    }

                    return result
                }
            }
        }

        return [false, false, false]
    }

    

    checkForSubFormulaWitness(subFormulas){
        let i, formula;
        for(i = 0; i < subFormulas.length; i++){
            formula = subFormulas[i]
            let formulaNegation = new Formulas.UnaryOperatorFormula('!', formula)
            if(!this.contains(formula) && !this.contains(formulaNegation)){
                return [formula, formulaNegation]
            }
        }

        return [false, false]
    }

    findModalFormula(){
        let i, formula;
        for(i = 0; i < this.formulas.length; i++){
            formula = this.formulas[i]
            if(formula.type == 'Unary'){
                if(formula.operator == '!'){
                    if(formula.formula.type == 'Unary'){
                        if(formula.formula.isModal()){
                            return formula
                        }
                    }
                }else if(formula.isModal()){
                    return formula
                }
            }
        }

        return false
    }

    contains(formula){
        let i, currentFormula;
        for(i = 0; i < this.formulas.length; i++){
            currentFormula = this.formulas[i]
            if(currentFormula.isEqualTo(formula)){
                return true
            }
        }
        return false
    }

    isAnObviouslyContradictorySetOfFormulas(){
       let i, j, f1, f2;
       for(i = 0; i < this.formulas.length; i++){
            f1 = this.formulas[i]
            for(j = 0; j < this.formulas.length && i != j; j++){
                f2 = this.formulas[j]
                if(f1.isNegationOf(f2)){
                    return true
                }
            }
       }
       return false
    }

}

module.exports = {Node}