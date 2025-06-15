from pyhive import hive
from TCLIService.ttypes import TOperationState
import sys

def verificar_conexion_y_consultar():
    try:
        # Conexión a HiveServer2
        conn = hive.Connection(host="localhost", port=10000, username="hadoop")
        print("✅ Conexión a Hive establecida")

        cursor = conn.cursor()
        cursor.execute("SELECT * FROM video_metadata")

        # Obtener nombres de columnas
        columnas = [desc[0] for desc in cursor.description]
        print("📋 Columnas:", columnas)

        # Mostrar filas
        print("\n📄 Contenido de la tabla video_metadata:")
        for row in cursor.fetchall():
            print(row)

        cursor.close()
        conn.close()

    except Exception as e:
        print("❌ Error al conectarse o consultar:", e)
        sys.exit(1)

if __name__ == "__main__":
    verificar_conexion_y_consultar()
