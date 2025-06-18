from pyspark.sql import SparkSession
import os
import cv2
from ultralytics import YOLO
import tempfile
import shutil
import sys
import socket
import subprocess
import time

# Leer argumentos
if len(sys.argv) != 2:
    print("Uso: spark-submit listar_videos.py <ruta_salida>")
    sys.exit(1)

ruta_salida = sys.argv[1]
hadoop_bin = "/home/hadoop/hadoop/bin/hadoop"

# Inicializar Spark
spark = SparkSession.builder.appName("ListarVideosConHostname").getOrCreate()
sc = spark.sparkContext

# Obtener rutas de videos desde HDFS
hdfs_path = "hdfs:///videos"
fs = sc._jvm.org.apache.hadoop.fs.FileSystem.get(sc._jsc.hadoopConfiguration())
path = sc._jvm.org.apache.hadoop.fs.Path(hdfs_path)
files = fs.listStatus(path)
hdfs_video_paths = [f.getPath().toString() for f in files if f.getPath().toString().endswith(".mp4")]

# Función para descargar con reintentos (dentro del worker)
def intentar_descarga_con_reintentos(hdfs_file, local_path, intentos=3, espera=5):
    for intento in range(1, intentos + 1):
        try:
            subprocess.run([hadoop_bin, "fs", "-get", "-f", hdfs_file, local_path], check=True)

            if os.path.exists(local_path) and os.path.getsize(local_path) > 100000:
                return True
        except Exception as e:
            pass
        time.sleep(espera)
    return False

# Función de procesamiento por nodo
def procesar_video(hdfs_path):
    hostname = socket.gethostname()
    errores = []
    debug = []

    try:
        tmp_dir = tempfile.mkdtemp(prefix="video_tmp_")
        local_path = os.path.join(tmp_dir, os.path.basename(hdfs_path))

        debug.append(f"[{hostname}] ⏬ Descargando: {hdfs_path}")
        if not intentar_descarga_con_reintentos(hdfs_path, local_path):
            msg = f"[{hostname}] ❌ Error al descargar {hdfs_path}"
            errores.append(msg)
            shutil.rmtree(tmp_dir)
            return "\n".join(errores + debug)

        if not os.path.exists(local_path) or os.path.getsize(local_path) < 100000:
            msg = f"[{hostname}] ⚠️ Archivo sospechosamente pequeño o inexistente: {local_path}"
            errores.append(msg)
            shutil.rmtree(tmp_dir)
            return "\n".join(errores + debug)

        debug.append(f"[{hostname}] ▶️ Procesando: {local_path}")

        model = YOLO("yolov8n.pt")
        cap = cv2.VideoCapture(local_path)

        if not cap.isOpened():
            errores.append(f"[{hostname}] ❌ No se pudo abrir el video {local_path}")
            shutil.rmtree(tmp_dir)
            return "\n".join(errores + debug)

        detections = []
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                debug.append(f"[{hostname}] ⏹️ Fin del video o error al leer frame")
                break

            if frame_count % 30 == 0:
                try:
                    results = model(frame)
                    detected = [model.names[int(box.cls[0])]
                                for r in results for box in r.boxes]
                    detections.append(f"Frame {frame_count}: {detected}")
                    debug.append(f"[{hostname}] ✅ Frame {frame_count}: {detected}")
                except Exception as e:
                    errores.append(f"[{hostname}] ⚠️ Error frame {frame_count}: {e}")
            frame_count += 1

        cap.release()
        shutil.rmtree(tmp_dir)
        return "\n".join([f"[{hostname}] Video: {os.path.basename(hdfs_path)}"] + detections + debug + errores)

    except Exception as e:
        return f"[{hostname}] ❌ Error general: {e}"

# Procesamiento paralelo
rdd = sc.parallelize(hdfs_video_paths, numSlices=len(hdfs_video_paths))
resultados = rdd.map(procesar_video)

# Guardar resultados
resultados.saveAsTextFile(ruta_salida + "/resultados")

spark.stop()
