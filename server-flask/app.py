from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import h5py
import os
from tensorflow.keras.models import model_from_json, load_model
from tensorflow.keras import saving
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    InputLayer,
    Conv2D,
    MaxPooling2D,
    Flatten,
    Dropout,
    Dense,
)

# ---- Register Keras classes for backward compatibility ----
saving.register_keras_serializable(package="keras")(Sequential)
saving.register_keras_serializable(package="keras")(InputLayer)
saving.register_keras_serializable(package="keras")(Conv2D)
saving.register_keras_serializable(package="keras")(MaxPooling2D)
saving.register_keras_serializable(package="keras")(Flatten)
saving.register_keras_serializable(package="keras")(Dropout)
saving.register_keras_serializable(package="keras")(Dense)

app = Flask(__name__)


# ---------- Fix for legacy configs ----------
def fix_config(config):
    if isinstance(config, dict):
        if "batch_shape" in config:
            config["batch_input_shape"] = config.pop("batch_shape")

        if "dtype_policy" in config and isinstance(config["dtype_policy"], dict):
            config["dtype_policy"] = {
                "class_name": "Policy",
                "config": {"name": "float32"},
            }

        # Recurse safely through nested values
        for v in list(config.values()):
            fix_config(v)

    elif isinstance(config, list):
        for item in config:
            fix_config(item)


# ---------- Model loader with auto detection ----------
def load_any_model(path):
    """
    Tries to load a complete .h5 model first.
    If that fails, attempts to reconstruct from config + weights.
    """
    try:
        print(f"🔹 Trying to load full model: {path}")
        model = load_model(path, compile=False)
        print(f"✅ Successfully loaded full model: {path}")
        return model
    except Exception as e:
        print(f"⚠️ Full model load failed ({e}), trying config reconstruction...")

    # Fallback: try legacy config + weights
    with h5py.File(path, "r") as f:
        config_attr = f.attrs.get("model_config")
        if config_attr is None:
            raise ValueError(f"No model_config found in {path}")

        config_json = (
            config_attr.decode("utf-8")
            if isinstance(config_attr, bytes)
            else config_attr
        )
        config = json.loads(config_json)

    fix_config(config)
    model = model_from_json(json.dumps(config))
    model.load_weights(path)
    print(f"✅ Loaded model weights from {path}")
    return model


# ---------- Load models ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_leaf = load_any_model(os.path.join(BASE_DIR, "apple_disease_model.h5"))
model_fruit = load_any_model(os.path.join(BASE_DIR, "cnn_pommier_v1.h5"))

# ---------- Class labels ----------
fruit_class_names = [
    "Blotch_Apple",
    "Normal_Apple",
    "Rot_Apple",
    "Scab_Apple",
]
fruit_traitements_names = [
    "Myclobutanil or mancozeb",
    "no traitements",
    "Thyopanate-methyle or captan",
    "captan or myclobutanil",
]

leaf_class_names = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
]
leaf_traitements_names = [
    "captan or propiconazol",
    "myclobutanil or tebucanozole",
    "propiconazole or myclobutanil",
    "no traitements",
]


# ---------- Preprocessing ----------
def preprocess_image(image_bytes, target_size=(224, 224)):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array


# ---------- Prediction helper ----------
def get_prediction(model, class_names, image_bytes, traitements_names):
    input_array = preprocess_image(image_bytes)
    prediction = model.predict(input_array)[0]
    probs = prediction.tolist()
    predicted_index = int(np.argmax(prediction))
    predicted_class = class_names[predicted_index]
    traitement = traitements_names[predicted_index]
    confidence = round(100 * float(np.max(prediction)), 2)
    return predicted_class, confidence, probs, traitement


# ---------- Routes ----------
@app.route("/predict/fruit", methods=["POST"])
def predict_fruit():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files["image"]
        predicted_class, confidence, probs, traitement = get_prediction(
            model_fruit, fruit_class_names, image_file.read(), fruit_traitements_names
        )

        return jsonify(
            {
                "predictedClass": predicted_class,
                "confidence": confidence,
                "probs": probs,
                "traitement": traitement
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/leaf", methods=["POST"])
def predict_leaf():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files["image"]
        predicted_class, confidence, probs, traitements = get_prediction(
            model_leaf, leaf_class_names, image_file.read(), leaf_traitements_names
        )

        return jsonify(
            {
                "predictedClass": predicted_class,
                "confidence": confidence,
                "probs": probs,
                "traitements": traitements
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------- Run ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
