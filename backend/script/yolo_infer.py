import torch
import cv2
import json
import argparse
import os

# --- Argumentos desde Java ---
parser = argparse.ArgumentParser()
parser.add_argument('--input', required=True, help='Ruta del video de entrada')
parser.add_argument('--output', required=True, help='Ruta del archivo de salida JSON')
args = parser.parse_args()

video_path = args.input
output_path = args.output

# --- Cargar modelo YOLOv5 (preentrenado con COCO) ---
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

# --- Abrir video ---
cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
frame_index = 0

detections = {}

print(f"[INFO] Procesando video: {video_path}")
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)
    labels = results.xyxyn[0][:, -1].cpu().numpy()
    classes = results.names

    for label_index in labels:
        class_name = classes[int(label_index)]
        timestamp = f"{int(frame_index // fps):02}:{int((frame_index % fps) * (1/fps*1000) // 1000):02}:{int(frame_index % fps):02}"
        if class_name not in detections:
            detections[class_name] = []
        detections[class_name].append(timestamp)

    frame_index += 1

cap.release()

# --- Escribir JSON ---
video_name = os.path.basename(video_path)
data = {
    "video": video_name,
    "detections": detections
}

with open(output_path, 'w') as f:
    json.dump(data, f, indent=4)

print(f"[INFO] JSON generado en: {output_path}")
