
/**
 * Used the Toy Neural Network by Daniel Shiffman AKA Coding Train
 * https://github.com/CodingTrain/Toy-Neural-Network-JS/tree/master/lib
 * 
 */

function sigmoid(x)
{
    return 1 / (1 + Math.exp(-x));
}
function dsigmoid(y)
{
    //return sigmoid(x) * (1 - signmoid(x))//Real Sigmoid
    return y * (1-y)// Fake sigmoid
}
class NeuralNetwork
{
    constructor(numInputs, numHidden, numOutputs)
    {
        if(numInputs instanceof NeuralNetwork)
        {
            this.inputNodes = numInputs.inputNodes;
            this.hiddenNodes = numInputs.hiddenNodes;
            this.inputNodes = numInputs.inputNodes;

            this.weights_IH = numInputs.weights_IH.copy();
            this.weights_HO = numInputs.weights_HO.copy();

            this.bias_H = numInputs.bias_H.copy();
            this.bias_O = numInputs.bias_O.copy();
        }
        else
        {
            this.inputNodes = numInputs;
            this.hiddenNodes = numHidden;
            this.outputNodes = numOutputs;

            this.weights_IH = new Matrix(this.hiddenNodes, this.inputNodes); //For input - > hidden weights
            this.weights_HO = new Matrix(this.outputNodes, this.hiddenNodes); // For hidden - > outputs

            this.weights_IH.randomize();
            this.weights_HO.randomize();

            this.bias_H = new Matrix(this.hiddenNodes, 1);
            this.bias_O = new Matrix(this.outputNodes, 1);

            this.bias_H.randomize();
            this.bias_O.randomize();
        }

        this.LR = 0.1;
    }

    predict(inputArray)
    {
        let inputs = Matrix.fromArray(inputArray)

        //Generating hidden outputs
        let hidden = Matrix.multiply(this.weights_IH, inputs); //Weighted Sum
        hidden.add(this.bias_H); //Add bias
        hidden.map(sigmoid)// Activation function

        //Generate the output
        let output = Matrix.multiply(this.weights_HO, hidden);
        output.add(this.bias_O)
        output.map(sigmoid);

        return output.toArray();
    }

    train(inputArray, targetArray)
    {
        //Feedforward
        /********************************************************************************************************* */
        let inputs = Matrix.fromArray(inputArray)

        //Generating hidden outputs
        let hidden = Matrix.multiply(this.weights_IH, inputs); //Weighted Sum
        hidden.add(this.bias_H); //Add bias
        hidden.map(sigmoid)// Activation function

        //Generate the output
        let outputs = Matrix.multiply(this.weights_HO, hidden);
        outputs.add(this.bias_O)
        outputs.map(sigmoid);

        let targets = Matrix.fromArray(targetArray);

        //Calculate errors
        /********************************************************************************************************* */

        let outputErrors = Matrix.subtract(targets, outputs);

        //Calculate  the hidden layer errors
        let weights_HO_T = Matrix.transpose(this.weights_HO);
        let hiddenErrors = Matrix.multiply(weights_HO_T, outputErrors)

        //Get gradients / Back propagation 
        /********************************************************************************************************* */
        //deltaW = LR * OutputErrors * sigmoidDerivative * LayerInputTransposed
        let gradients = Matrix.map(outputs, dsigmoid);//Sigmoid Derivative
        gradients.multiply(outputErrors)//Multiply output errors
        gradients.multiply(this.LR);
        
        //Calculate Deltas
        let hiddenT = Matrix.transpose(hidden);
        let weight_HO_Deltas = Matrix.multiply(gradients, hiddenT)

        //Adjust Weights by Deltas
        this.weights_HO.add(weight_HO_Deltas)
        //Adjust the bias by gradient
        this.bias_O.add(gradients);

        let hiddenGradients = Matrix.map(hidden, dsigmoid);
        hiddenGradients.multiply(hiddenErrors);
        hiddenGradients.multiply(this.LR)

        //Calculate hidden -> Input deltas
        let input_T = Matrix.transpose(inputs)
        let weight_IH_Deltas = Matrix.multiply(hiddenGradients, input_T);


        this.weights_IH.add(weight_IH_Deltas)
        this.bias_H.add(hiddenGradients);

    }
    copy()
    {
        return new NeuralNetwork(this);
    }

    mutate(rate)
    {
        function mutate(val)
        {
            if(Math.random() < rate)    
            {
                //return Math.random() * 2 - 1;
                let r = Math.random(0, 1);
                let result = val;

                if(r >= 0.5)
                    result = val + random(-0.1, 0.1);
                else 
                    result = random(-1, 1);

                if(result > 1)
                    result = 1;
                else if(result < -1)
                    result = -1;

                return result;
            }
            else
                return val;
        }

        this.weights_IH.map(mutate);
        this.weights_HO.map(mutate);

        this.bias_H.map(mutate);
        this.bias_O.map(mutate);
    }

}