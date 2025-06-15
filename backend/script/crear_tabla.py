import subprocess
from pyhive import hive

# Config
HDFS_VIDEOS_DIR = "/videos"
LOCAL_METADATA_FILE = "videos_metadata.txt"
LOCAL_INDEX_FILE = "inverted_index.txt"
HDFS_METADATA_DIR = "/videos_metadata"
HDFS_INDEX_DIR = "/inverted_index"

# 1. Leer lista de videos en HDFS
def listar_videos_en_hdfs():
    result = subprocess.check_output(["hdfs", "dfs", "-ls", HDFS_VIDEOS_DIR])
    lines = result.decode().strip().split("\n")[1:]
    rutas = [line.split()[-1] for line in lines]
    return rutas

# 2. Crear archivo metadata
def crear_archivo_metadata(rutas):
    with open(LOCAL_METADATA_FILE, "w") as f:
        for path in rutas:
            video_id = path.split("/")[-1]
            f.write(f"{video_id}\t{path}\n")
    print("✅ Metadata generada.")

# 3. Crear índice invertido simple
def crear_indice_invertido_simulado():
    # Este ejemplo es fijo, puedes usar NLP después
    data = [
        "perro\tprueba2.mp4",
        "gato\tprueba.mp4",
        "persona\tprueba2.mp4,prueba.mp4",
    ]
    with open(LOCAL_INDEX_FILE, "w") as f:
        f.write("\n".join(data))
    print("✅ Índice invertido simulado generado.")

# 4. Subir archivos a HDFS
def subir_a_hdfs():
    subprocess.run(["hdfs", "dfs", "-mkdir", "-p", HDFS_METADATA_DIR])
    subprocess.run(["hdfs", "dfs", "-put", "-f", LOCAL_METADATA_FILE, HDFS_METADATA_DIR])
    subprocess.run(["hdfs", "dfs", "-mkdir", "-p", HDFS_INDEX_DIR])
    subprocess.run(["hdfs", "dfs", "-put", "-f", LOCAL_INDEX_FILE, HDFS_INDEX_DIR])
    print("✅ Archivos subidos a HDFS.")

# 5. Crear tablas Hive
def crear_tablas_hive():
    conn = hive.Connection(host="localhost", port=10000, username="hadoop")
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS videos_metadata")
    cursor.execute(f"""
        CREATE EXTERNAL TABLE videos_metadata (
            video_id STRING,
            hdfs_path STRING
        )
        ROW FORMAT DELIMITED
        FIELDS TERMINATED BY '\\t'
        STORED AS TEXTFILE
        LOCATION '{HDFS_METADATA_DIR}'
    """)

    cursor.execute("DROP TABLE IF EXISTS inverted_index")
    cursor.execute(f"""
        CREATE EXTERNAL TABLE inverted_index (
            term STRING,
            video_id STRING
        )
        ROW FORMAT DELIMITED
        FIELDS TERMINATED BY '\\t'
        STORED AS TEXTFILE
        LOCATION '{HDFS_INDEX_DIR}'
    """)
    print("✅ Tablas Hive creadas.")

# Ejecutar todo
if __name__ == "__main__":
    rutas = listar_videos_en_hdfs()
    crear_archivo_metadata(rutas)
    crear_indice_invertido_simulado()
    subir_a_hdfs()
    crear_tablas_hive()
    print("🎉 Proceso completado.")
