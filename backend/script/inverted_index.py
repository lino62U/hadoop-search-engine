from pyspark.sql import SparkSession
import re
import sys

# Validar argumentos
if len(sys.argv) != 3:
    print("Uso: spark-submit contar_labels_spark.py <ruta_entrada_hdfs> <ruta_salida_hdfs>")
    sys.exit(1)

ruta_entrada = sys.argv[1]
ruta_salida = sys.argv[2]

# Inicializa Spark
spark = SparkSession.builder.appName("ContarLabelsPorVideo").getOrCreate()
sc = spark.sparkContext

# Leer archivos del HDFS
lines = sc.textFile(ruta_entrada)

# Función estilo mapper
def extraer_labels(lineas):
    current_video = None
    salida = []

    for line in lineas:
        line = line.strip()
        if not line:
            continue

        if "Video:" in line:
            partes = line.split("Video:")
            if len(partes) > 1:
                current_video = partes[1].strip()
        elif line.startswith("Frame") and current_video:
            m = re.search(r'\[(.*)\]', line)
            if not m:
                continue
            etiquetas = m.group(1).split(',')
            for etiqueta in etiquetas:
                etiqueta = etiqueta.strip().strip("'").strip('"')
                if etiqueta:
                    salida.append(((etiqueta, current_video), 1))
    return salida

# Procesamiento estilo map-reduce
conteos = (
    lines
    .mapPartitions(lambda part: extraer_labels(part))
    .reduceByKey(lambda x, y: x + y)
)

# Agrupar por etiqueta
salida_final = (
    conteos
    .map(lambda x: (x[0][0], (x[0][1], x[1])))  # (label, (video, count))
    .groupByKey()
    .mapValues(lambda it: ",".join(f"{vid}:{cnt}" for vid, cnt in it))
    .map(lambda x: f"{x[0]}|{x[1]}")
)

# Guardar en HDFS
salida_final.coalesce(1).saveAsTextFile(ruta_salida)

spark.stop()

