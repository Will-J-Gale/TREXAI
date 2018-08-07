'''
Uses Google Object Detection API to detect TREX and Enimies
'''

import numpy as np
import os, cv2
import tensorflow as tf
from grabscreen import grab_screen
from getkeys import key_check
from virtualkeyboard import press, release
from collections import defaultdict
from object_detection.utils import label_map_util
from object_detection.utils import visualization_utils as vis_util
from object_detection.utils import ops as utils_ops
from NeuralNetwork import nn
import time
import win32api

'''
Google Object Detection Code
'''
##############################################################################################################
if tf.__version__ < '1.4.0':
  raise ImportError('Please upgrade your tensorflow installation to v1.4.* or later!')

MODEL_NAME = 'TREXAI_Graph2'
PATH_TO_CKPT = MODEL_NAME + '/frozen_inference_graph.pb'
PATH_TO_LABELS = os.path.join('labels', 'object-detection.pbtxt')

NUM_CLASSES = 2

detection_graph = tf.Graph()
with detection_graph.as_default():
  od_graph_def = tf.GraphDef()
  with tf.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
    serialized_graph = fid.read()
    od_graph_def.ParseFromString(serialized_graph)
    tf.import_graph_def(od_graph_def, name='')

label_map = label_map_util.load_labelmap(PATH_TO_LABELS)
categories = label_map_util.convert_label_map_to_categories(label_map, max_num_classes=NUM_CLASSES, use_display_name=True)
category_index = label_map_util.create_category_index(categories)

def load_image_into_numpy_array(image):
  (im_width, im_height) = image.size                          
  return np.array(image.getdata()).reshape(
      (im_height, im_width, 3)).astype(np.uint8)

def run_inference_for_single_image(image, sess):
  # Get handles to input and output tensors
  ops = tf.get_default_graph().get_operations()
  all_tensor_names = {output.name for op in ops for output in op.outputs}
  tensor_dict = {}
  for key in [
      'num_detections', 'detection_boxes', 'detection_scores',
      'detection_classes', 'detection_masks'
  ]:
    tensor_name = key + ':0'
    if tensor_name in all_tensor_names:
      tensor_dict[key] = tf.get_default_graph().get_tensor_by_name(
          tensor_name)
  if 'detection_masks' in tensor_dict:
    # The following processing is only for single image
    detection_boxes = tf.squeeze(tensor_dict['detection_boxes'], [0])
    detection_masks = tf.squeeze(tensor_dict['detection_masks'], [0])
    # Reframe is required to translate mask from box coordinates to image coordinates and fit the image size.
    real_num_detection = tf.cast(tensor_dict['num_detections'][0], tf.int32)
    detection_boxes = tf.slice(detection_boxes, [0, 0], [real_num_detection, -1])
    detection_masks = tf.slice(detection_masks, [0, 0, 0], [real_num_detection, -1, -1])
    detection_masks_reframed = utils_ops.reframe_box_masks_to_image_masks(
        detection_masks, detection_boxes, image.shape[0], image.shape[1])
    detection_masks_reframed = tf.cast(
        tf.greater(detection_masks_reframed, 0.5), tf.uint8)
    # Follow the convention by adding back the batch dimension
    tensor_dict['detection_masks'] = tf.expand_dims(
        detection_masks_reframed, 0)
  image_tensor = tf.get_default_graph().get_tensor_by_name('image_tensor:0')
                     
  # Run inference
  output_dict = sess.run(tensor_dict,
                         feed_dict={image_tensor: np.expand_dims(image, 0)})

  # all outputs are float32 numpy arrays, so convert types as appropriate
  output_dict['num_detections'] = int(output_dict['num_detections'][0])
  output_dict['detection_classes'] = output_dict[
      'detection_classes'][0].astype(np.uint8)
  output_dict['detection_boxes'] = output_dict['detection_boxes'][0]
  output_dict['detection_scores'] = output_dict['detection_scores'][0]
  if 'detection_masks' in output_dict:
    output_dict['detection_masks'] = output_dict['detection_masks'][0]
  return output_dict

'''
Custom Code
'''
##############################################################################################################
def getEnemyPosition(boxes):
  #format: [ymin, xmin, ymax, xmax]
  positions = []
  
  for box in boxes:
    width = box[3] - box[1]
    height = box[2] - box[0]

    centerX = (box[1] + width / 2)
    centerY = (box[0] + height / 2)
    
    positions.append((centerX, centerY))

  return positions

def getClosestEnemy(trexPos, enemyPositions):
  closestDistance = 100000000
  closestEnemy = None

  for pos in enemyPositions:

    distance = pos[0] - trexPos[0]
    
    if(distance < closestDistance):
      closestDistance = distance
      closestEnemy = pos

  return closestEnemy, closestDistance

def getPositionFromBox(box):
  #Calculates center position from box mins and maxes
  width = abs(box[1] - box[3])
  height = abs(box[0] - box[2])
  
  pos = (box[1] + (width / 2), box[0] + (height / 2))

  return pos

def jump():
  #Make the TREX jump
  press('spacebar')
  time.sleep(0.02)
  release('spacebar')
  
#User Variables
SCREEN_REGION = (0, 300, 1920, 800) # Coords of where to take screenshiot
IMAGE_SIZE = (SCREEN_REGION[2] - SCREEN_REGION[0], SCREEN_REGION[3] - SCREEN_REGION[1])
IMAGE_SCALE = 2
IMAGE_NEW_SIZE = (int(IMAGE_SIZE[0] / IMAGE_SCALE), int(IMAGE_SIZE[1] / IMAGE_SCALE))
WIDTH = 1920
HEIGHT = 1080

CENTER = (WIDTH/2, HEIGHT/2)

SCALED_SIZE = (800, 450)
SCREEN_NAME = "TREX_AI"
previousTime = time.time()
BOT_ENABLED = True
L_DOWN = False
THRESHOLD = 0.7
MOVE_SCALE = 20000
distanceBeforeJump = 0.2
enemyPositions = []
#brain = NeuralNetwork();
#keys = k.Keys({})
  
#gpuOptions = tf.GPUOptions(per_process_gpu_memory_fraction = 0.7)

with detection_graph.as_default():
  with tf.Session() as sess:
    while(True):
        pressedKeys = key_check()
            
        screen = grab_screen(SCREEN_REGION)
        screen = cv2.resize(screen, IMAGE_NEW_SIZE)
        screen = cv2.cvtColor(screen, cv2.COLOR_BGR2RGB)

        '''
        Google Object Detection Code
        '''
        #########################################################################################################
        # Expand dimensions since the model expects images to have shape: [1, None, None, 3]
        image_np_expanded = np.expand_dims(screen, axis=0)
        # Actual detection.
        output_dict = run_inference_for_single_image(screen, sess)
        # Visualization of the results of a detection.
        vis_util.visualize_boxes_and_labels_on_image_array(
            screen,
            output_dict['detection_boxes'],
            output_dict['detection_classes'],
            output_dict['detection_scores'],
            category_index,
            instance_masks=output_dict.get('detection_masks'),
            use_normalized_coordinates=True,
            line_thickness=8)
        
        '''
        Custom Code
        '''
        #########################################################################################################
        
        bestIndexes = np.where(output_dict['detection_scores'] >= THRESHOLD)
        detectedObjects =  [output_dict['detection_boxes'][i] for i in bestIndexes][0]
        detectedClasses = [output_dict['detection_classes'][i] for i in bestIndexes][0]
        
        trexIndex = np.where(detectedClasses == 1)[0]
        
        enemyIndexes = np.where(detectedClasses == 2)[0]
        enemyBoxes = [output_dict['detection_boxes'][i] for i in enemyIndexes]
        
        if(len(trexIndex) > 0):
          trexBox = output_dict['detection_boxes'][trexIndex][0]
          trexPos = getPositionFromBox(trexBox)
          
          if(len(enemyIndexes) > 0):
            enemyPositions = [getPositionFromBox(x) for x in enemyBoxes]
            closestEnemy, distance = getClosestEnemy(trexPos, enemyPositions)
            brainInput = np.array([[closestEnemy[0], closestEnemy[1], distance]])
            prediction = nn.predict(brainInput)

            if(prediction > 0.5):
              jump()
              
        #cv2.imshow(SCREEN_NAME, screen) #Uncomment to show bounding boxes (Reduces framerate by about 2)
        previousTime = time.time()
        
        if cv2.waitKey(25) & 0xFF == ord('q'):
          cv2.destroyAllWindows()
          break

