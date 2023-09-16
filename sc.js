const Parser = require('./parser')
const Node = require('./node')

function build(node){

    if(node.isAnObviouslyContradictorySetOfFormulas()){
        node.isClosed = true
        return
    }else{
        
        let dnWitness = node.findDoubleNegationWitness()
        if(dnWitness){
            let successor = node.createSuccessor(dnWitness, false)
            build(successor)
            return
        }
        
        let cWitness = node.findConjunction()
        if(cWitness){
            let toBeAdded = []
            if(!node.contains(cWitness.f1)){
                toBeAdded.push(cWitness.f1)
            }

            if(!node.contains(cWitness.f2)){
                toBeAdded.push(cWitness.f2)
            }

            let successor = node.createSuccesorWithTwoMore(toBeAdded)
            build(successor)

            return
        }

        let ncWitness = node.findConjunctionNegation()
        if(ncWitness[0]){
            
            if(ncWitness[1] && ncWitness[2]){
                let successor1 = node.createSuccessor(ncWitness[1], true)   
                build(successor1)

                let successor2 = node.createSuccessor(ncWitness[2], true)
                build(successor2)
            }else build(node)

            return
        }
        node.isTablo = true

        let modalFormula = node.findModalFormula()
        modalFormula.print()
        if(modalFormula){
            let subFormulas = modalFormula.getSubFormulas()
            console.log(subFormulas)
            let [formula, formulaNegation] = node.checkForSubFormulaWitness(subFormulas)

            if(formula && formulaNegation){
                let successor1 = node.createSuccessor(formula, true)
                build(successor1)
                let successor2 = node.createSuccessor(formulaNegation, true)
                build(successor2)
                return;
            }

        }

        node.isExtendedTablo = true


    }
}

function KmSAT(formula){
    let root = new Node.Node(formula.toTextual(), [formula], false)
    build(root);
    root.print()
    return false
}

function main(){
    let input = '(p&!(p&q))&(K1!p&!K1K2q)'
    let rootFormula = Parser.parse(input)
    rootFormula.print()
    let result = KmSAT(rootFormula)
    console.log('Formula je zadovoljiva: ', result)
}

main()