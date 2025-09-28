from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# Load models
model_fruit = tf.keras.models.load_model("apple_fruit_model.h5")
model_leaf = tf.keras.models.load_model("apple_leaf_model.h5")

# Class labels (must match training order)
fruit_class_names = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy"
]

leaf_class_names = [
    "AppleLeaf___Apple_scab",
    "AppleLeaf___Black_rot",
    "AppleLeaf___Cedar_apple_rust",
    "AppleLeaf___healthy"
]

# Preprocessing helper
def preprocess_image(image_bytes, target_size=(224, 224)):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

# Prediction helper
def get_prediction(model, class_names, image_bytes):
    input_array = preprocess_image(image_bytes)
    prediction = model.predict(input_array)[0]  # first row
    probs = prediction.tolist()
    predicted_index = int(np.argmax(prediction))
    predicted_class = class_names[predicted_index]
    confidence = round(100 * float(np.max(prediction)), 2)
    return predicted_class, confidence, probs

@app.route("/predict/fruit", methods=["POST"])
def predict_fruit():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files["image"]
        predicted_class, confidence, probs = get_prediction(
            model_fruit, fruit_class_names, image_file.read()
        )

        return jsonify({
            "predictedClass": predicted_class,
            "confidence": confidence,
            "probs": probs
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict/leaf", methods=["POST"])
def predict_leaf():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files["image"]
        predicted_class, confidence, probs = get_prediction(
            model_leaf, leaf_class_names, image_file.read()
        )

        return jsonify({
            "predictedClass": predicted_class,
            "confidence": confidence,
            "probs": probs
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
