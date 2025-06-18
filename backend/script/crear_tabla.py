#!/usr/bin/env python3
from pyhive import hive
import subprocess

# Configuración
HDFS_INDEX_PATH = "/spark/inverted_index_videos_2"
HIVE_TABLE_NAME = "inverted_index_v2"
HIVE_DB_NAME = "default"

def create_hive_table():
    """Crea la tabla Hive para el índice invertido"""
    try:
        # Conexión a Hive
        conn = hive.Connection(host="localhost", port=10000, username="hadoop")
        cursor = conn.cursor()
        
        cursor.execute(f"USE {HIVE_DB_NAME}")
        cursor.execute(f"DROP TABLE IF EXISTS {HIVE_TABLE_NAME}")
        
        create_table_query = f"""
        CREATE EXTERNAL TABLE {HIVE_TABLE_NAME} (
            term STRING COMMENT 'Término de búsqueda',
            video_list STRING COMMENT 'Lista de videos y conteos en formato video:cnt,video:cnt'
        )
        ROW FORMAT DELIMITED
        FIELDS TERMINATED BY '\t'
        STORED AS TEXTFILE
        LOCATION '{HDFS_INDEX_PATH}'
        """
        cursor.execute(create_table_query)
        print(f"✅ Tabla {HIVE_TABLE_NAME} creada exitosamente en Hive.")
        
        # Crear vista normalizada CORREGIDA
        create_view_query = f"""
        CREATE VIEW IF NOT EXISTS {HIVE_TABLE_NAME}_normalized AS
        SELECT 
            term,
            split(video_entry, ':')[0] AS filename,
            cast(split(video_entry, ':')[1] AS INT) AS count
        FROM {HIVE_TABLE_NAME}
        LATERAL VIEW explode(split(video_list, ',')) t AS video_entry
        """
        cursor.execute(create_view_query)
        print(f"✅ Vista normalizada {HIVE_TABLE_NAME}_normalized creada correctamente.")
        
    except Exception as e:
        print(f"❌ Error al crear la tabla Hive: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

def verify_hdfs_data():
    """Verifica que los datos existen en HDFS"""
    try:
        print("Verificando datos en HDFS...")
        result = subprocess.check_output(["hdfs", "dfs", "-ls", HDFS_INDEX_PATH])
        files = result.decode().strip().split('\n')
        print(f"Archivos encontrados en {HDFS_INDEX_PATH}:")
        for f in files:
            print(f)
        return True
    except subprocess.CalledProcessError:
        print(f"❌ No se encontraron datos en {HDFS_INDEX_PATH}")
        return False
    except Exception as e:
        print(f"❌ Error al verificar HDFS: {str(e)}")
        return False

if __name__ == "__main__":
    print("Iniciando creación de tabla Hive para índice invertido...")
    
    if verify_hdfs_data():
        create_hive_table()
    
    print("Proceso completado.")
(venv) hadoop@leon:~/hadoop-search-engine/backend/script$ 


