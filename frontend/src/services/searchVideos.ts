// Función que busca palabras en un endpoint y luego las añade
const searchWords = async (palabras: string[]) => {
  // try {
    // // Buscar palabras en el endpoint (GET)
    // const query = palabras.map(p => `q=${encodeURIComponent(p)}`).join('&');
    // const respuestaBusqueda = await fetch(`/inverted-index/?${query}`);

    // if (!respuestaBusqueda.ok) {
    //   throw new Error('Error al buscar palabras');
    // }

    // const resultados = await respuestaBusqueda.json();
    // console.log('Resultados encontrados:', resultados);

    // // Luego, añadir las palabras (POST o PUT)
    // const respuestaAdd = await fetch('/inverted-index/', {
    //   method: 'POST', // o 'PUT' según el backend
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ palabras }),
    // });

    // if (!respuestaAdd.ok) {
    //   throw new Error('Error al añadir palabras');
    // }

    // const resultadoAdd = await respuestaAdd.json();
    // console.log('Palabras añadidas correctamente:', resultadoAdd);
    return [
      {
        "id": "video1",
        "titulo": "Perros y Gatos en la ciudad",
        "descripcion": "Un documental sobre mascotas urbanas",
        "duracion": "3:45",
        "url": "/videos/video1.mp4",
        "palabras_clave": ["perro", "gato"]
      },
      {
        "id": "video2",
        "titulo": "Cómo entrenar a tu perro",
        "descripcion": "Consejos para adiestrar perros",
        "duracion": "5:10",
        "url": "/videos/video2.mp4",
        "palabras_clave": ["perro"]
      },
      {
        "id": "video5",
        "titulo": "Gatos divertidos",
        "descripcion": "Compilación de gatos graciosos",
        "duracion": "2:00",
        "url": "/videos/video5.mp4",
        "palabras_clave": ["gato"]
      }
    ]

  // } catch (error: any) {
  //   console.error('Error en la operación:', error.message);
  //   return []
  // }
}
export default searchWords;