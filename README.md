# TREXAI
## A VERY basic neural network genetic algorithm to play Google's dino game

![alt text](https://github.com/Will-J-Gale/TREXAI/blob/master/Images/TREXAI.gif)

## How it was made
First the the google object detection api was trained to recognise the trex and enemies.  
Then a JavaScript copy of the real dino game was created and a simple neuroevolution/genetic algorithm was trained.
When trained the weights were copied into the python version which used the exact same neural network shape.
The detected trex and enemy positions were used as the input to the python neural network.

## Python Prerequisites
* OpenCV.
* Tensorflow GPU.
* Numpy.
* Google Object Detection API.  
   * Run setup.py in "models/research" folder of Google Object Detection API
* Pywin32

## Contents

1. **TREXAI Python** 

   Contains python code to play Google's dino game  
   Weights trained in the JavaScript program were copied into this program  
   Works best with 1920x1080 screen  
   Other screen sizes will need SCREEN_REGION variable updating in TREXAI.py
  
2. **TREXAI JavaScript** 
   
   Contains a JavaScript copy of the dino game  
   This copy trained the "neuroevolution" algorithm  
  
## Running TREX_AI Python

   1. Install Dependencies
   2. Download TREXAI Python folder
   3. Open dino game at "chrome://dino"
   4. Open and run TREXAI script
   5. Make sure dino window is clear
   
## Running TREX_AI JavaScript trainer

   2. Download TREXAI JavaScript folder
   3. Place all files in local server folder (such as MAMP)
   4. Run index.html from local server
   5. Wait for TREX to train (The slider at the top speeds up the process)

