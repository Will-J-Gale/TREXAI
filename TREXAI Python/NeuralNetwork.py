'''
Based on the toy neural network by Daniel Shiffman AKA Coding Train
https://github.com/CodingTrain/Toy-Neural-Network-JS
'''

import numpy as np
import math

class NeuralNetwork2():
  
  def __init__(self, inputNodes = 1, hiddenNodes = 2, outputNodes = 1):
    
    self.inputNodes = inputNodes
    self.hiddenNodes = hiddenNodes
    self.outputNodes = outputNodes
    
    self.weights_IH = (np.random.rand(hiddenNodes, inputNodes) * 2) - 1
    self.weights_HO = (np.random.rand(outputNodes, hiddenNodes) * 2) - 1
    
    self.bias_H = (np.random.rand(hiddenNodes, 1) * 2) - 1
    self.bias_O = (np.random.rand(outputNodes, 1) * 2) - 1

  def setWeights(self, a, b, c, d):
    self.weights_IH = a
    self.weights_HO = b
    self.bias_H = c
    self.bias_O = d
  
  def predict(self, inputs):
    hidden = np.dot(self.weights_IH,np.transpose(inputs))
    hidden = np.add(hidden, self.bias_H)
    hidden = hidden * (hidden > 0)

    output = np.dot(self.weights_HO, hidden)
    output = np.add(output, self.bias_O)
    output = self.sigmoid(output)

    return output

  def sigmoid(self, x):
    return 1 / (1 + math.exp(-x))

weights_IH = np.array([[-0.815009691347166,-0.4271399517650254,-0.5415225893090234],
                       [0.7172099643184094,0.42493454088310495,0.6090735133979859],
                       [-0.3420569539129632,0.18051606040519197,-0.46581616906622536],
                       [0.9749201842837112,0.5946811807138845,0.671695599898436],
                       [0.05295951612713745,0.4687802468425275,0.7292654886359982],
                       [-0.8977304810982238,-0.9083884064746868,-0.4367407156323714],
                       [0.9641456460081992,-0.393979848065727,0.7491080140593112]])

weights_HO = np.array([[-0.02862851713096015,-0.9001478301959249,0.3737047050015926,
                        -0.36993371707488276,0.5133335107683819,-0.005668208481782733,-0.7288335520296639]])

bias_H = np.array([[-0.21563776189668848],
                   [-0.25304527149117223],
                   [0.4470247178019092],
                   [-0.6859746160419917],
                   [-0.096110056781956],
                   [-0.8923118346321512],
                   [0.26726416011294785]])

bias_O = np.array([[0.6185515893532649]])

nn = NeuralNetwork2(3, 7, 1)
nn.setWeights(weights_IH, weights_HO, bias_H, bias_O)








