const searchWords = async (palabras: string[], route = "inverted_index") => {
  try {
    const response = await fetch(`http://localhost:5000/leer?ruta=/${route}/part-00000`);
    const data = await response.json();
    const contenido = data.contenido;

    // Paso 1: separar por líneas
    const lineas = contenido.trim().split("\n");

    // Paso 2: mapear a objetos, cada palabra tendrá un array de archivos
    const resultado = lineas.reduce((acc, linea) => {
      const [palabra, valores] = linea.split("\t");
      const archivos = valores.split(",").map(par => {
        const [archivo, frecuencia] = par.split(":");
        return {
          id: archivo,
          frecuencia: Number(frecuencia),
        };
      });

      acc[palabra] = archivos;
      return acc;
    }, {} as Record<string, { id: string, frecuencia: number }[]>);

    // Paso 3: Construir ranking de videos
    const ranking: Record<string, number> = {};

    palabras.forEach(palabra => {
      const entradas = resultado[palabra];
      if (entradas) {
        entradas.forEach(({ id, frecuencia }) => {
          ranking[id] = (ranking[id] || 0) + frecuencia;
        });
      }
    });

    const videosOrdenados = Object.entries(ranking)
      .sort((a, b) => b[1] - a[1])
      .map(([id, puntuacion]) => ({ id, puntuacion }));
    return videosOrdenados;
  } catch (error: any) {
    console.error('Error en la operación:', error.message);
    return [];
  }
};
export default searchWords;
