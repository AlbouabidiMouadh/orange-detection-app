// tfModel.js

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

let model = null;

// ✅ Load model (converted with tensorflowjs_converter)
export async function loadModel() {
  if (!model) {
    await tf.ready();

    const modelJson = require('../assets/models/model/leaf/model.json');
    const modelWeights = require('../assets/models/model/leaf/group1-shard1of1.bin');

    model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    console.log('✅ Model loaded');
  }
  return model;
}

// ✅ Convert raw JPEG → Tensor
export function imageToTensor(rawImageData) {
  const { width, height, data } = jpeg.decode(rawImageData, true);
  const buffer = new Uint8Array(width * height * 3);
  let offset = 0;

  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset];       // R
    buffer[i + 1] = data[offset+1]; // G
    buffer[i + 2] = data[offset+2]; // B
    offset += 4; // Skip alpha channel
  }

  return tf.tensor3d(buffer, [height, width, 3]);
}

// ✅ Class labels (make sure order matches training folder)
const classNames = [
  "1",
  "2",
  "3",
  "4"
];

// ✅ Run inference on base64 image
export async function runModelInference(imageBase64) {
  const model = await loadModel();

  // Decode base64 → raw bytes
  const rawImageData = Buffer.from(imageBase64, 'base64');
  let imageTensor = imageToTensor(rawImageData);

  // Resize to 224x224 and normalize (like Python)
  imageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
  imageTensor = imageTensor.expandDims(0).toFloat().div(tf.scalar(255));

  // Run prediction
  const prediction = model.predict(imageTensor);
  const probs = await prediction.data();

  // Cleanup
  prediction.dispose();
  imageTensor.dispose();

  // Find best class
  const maxIndex = probs.indexOf(Math.max(...probs));
  const predictedClass = classNames[maxIndex];
  const confidence = (probs[maxIndex] * 100).toFixed(2);

  return {
    predictedClass,
    confidence,
    probs: Array.from(probs) // return all scores too
  };
}
