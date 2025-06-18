from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pyhive import hive
import subprocess
import re
import tempfile
import os
from random import randint

app = Flask(__name__)
CORS(app)

HDFS_PATH = "/videos"
CHUNK_SIZE = 1024 * 1024  # 1MB


HIVE_HOST = "localhost"
HIVE_PORT = 10000
HIVE_USER = "hadoop"
HIVE_DB = "default"
HIVE_TABLE = "inverted_index_v2"


# 🔍 Consulta al índice invertido para una o varias palabras clave
@app.route("/buscar", methods=["GET"])
def buscar_videos():
    palabras = request.args.get("q", "").strip().lower()

    if not palabras:
        return jsonify({"error": "Se requiere un parámetro 'q'"}), 400

    try:
        lista_palabras = [p.strip() for p in palabras.split(",") if p.strip()]
        if not lista_palabras:
            return jsonify({"error": "Lista de palabras vacía"}), 400

        # Conectar a Hive
        conn = hive.Connection(host="localhost", port=10000, username="hadoop")
        cursor = conn.cursor()

        videos = []

        for palabra in lista_palabras:
            cursor.execute(f"SELECT video_id FROM inverted_index WHERE term='{palabra}'")
            resultados = cursor.fetchall()

            for fila in resultados:
                archivos = fila[0].split(",")
                videos.extend(archivos)

        cursor.close()
        conn.close()

        # Eliminar duplicados
        videos_unicos = sorted(set(videos))

        # Asignar puntuación aleatoria
        video_objs = [{"id": video, "puntuacion": randint(1, 1000)} for video in videos_unicos]

        return jsonify({"videos": video_objs})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": "Fallo al consultar Hive"}), 500

# 📺 Streaming de video desde HDFS
@app.route("/video/<filename>")
def stream_video(filename):
    hdfs_file_path = f"{HDFS_PATH}/{filename}"
    range_header = request.headers.get("Range", None)

    try:
        # Obtener tamaño del archivo
        size_cmd = ["hdfs", "dfs", "-du", "-s", hdfs_file_path]
        size_output = subprocess.check_output(size_cmd).decode()
        total_size = int(size_output.strip().split()[0])

        # Analizar Range
        if range_header:
            match = re.match(r"bytes=(\d+)-(\d*)", range_header)
            if match:
                start = int(match.group(1))
                end = int(match.group(2)) if match.group(2) else min(start + CHUNK_SIZE - 1, total_size - 1)
            else:
                return Response("Invalid Range header", status=400)
        else:
            start = 0
            end = min(CHUNK_SIZE - 1, total_size - 1)

        byte_count = end - start + 1

        # Archivo temporal
        fd, tmp_filename = tempfile.mkstemp()
        os.close(fd)
        os.remove(tmp_filename)

        # Descargar archivo desde HDFS
        subprocess.check_call(["hdfs", "dfs", "-get", hdfs_file_path, tmp_filename])

        # Leer fragmento
        with open(tmp_filename, "rb") as f:
            f.seek(start)
            fragment = f.read(byte_count)

        if os.path.exists(tmp_filename):
            os.remove(tmp_filename)

        # Cabeceras HTTP
        headers = {
            "Content-Type": "video/mp4" if filename.endswith(".mp4") else "video/mpeg",
            "Content-Range": f"bytes {start}-{end}/{total_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(len(fragment)),
        }

        return Response(fragment, status=206, headers=headers)

    except Exception as e:
        print("❌ Error:", e)
        return Response("Error al procesar video", status=500)

conn = hive.Connection(
    host='localhost',
    port=10000,
    username='hadoop',
    database='video_index_db'  # <<----- AQUI ESTA EL CAMBIO CLAVE
)
cursor = conn.cursor()


@app.route('/search', methods=['GET'])
def buscar_termino():
    termino = request.args.get('termino')
    if not termino:
        return jsonify({"error": "Debe proporcionar un término"}), 400

    try:
        query = f"SELECT * FROM inverted_index_normalized WHERE term='{termino}'"
        cursor.execute(query)
        resultados = cursor.fetchall()

        # Construir salida en formato {"videos": [{"id": ..., "puntuacion": ...}, ...]}
        videos = [
            {
                "id": row[1],          # video
                "puntuacion": row[2]   # frequency
            }
            for row in resultados
        ]

        return jsonify({"videos": videos})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


import random

@app.route('/videos_random', methods=['GET'])
def obtener_videos():
    try:
        query = "SELECT * FROM inverted_index_normalized"
        cursor.execute(query)
        resultados = cursor.fetchall()

        # Filtrar aleatoriamente 20 entradas (o menos si no hay suficientes)
        muestra_aleatoria = random.sample(resultados, min(20, len(resultados)))

        # Convertir a formato deseado: { id, frecuencia }
        videos = [
            {
                "id": fila[1],           # video
                "frecuencia": fila[2]    # frequency
            }
            for fila in muestra_aleatoria
        ]

        return jsonify(videos)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
