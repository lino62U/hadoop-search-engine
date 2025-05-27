package com.searchengine.backend.service;


import org.springframework.stereotype.Service;

import com.searchengine.backend.utils.InvertedIndexJob;

@Service
public class HadoopService {

    private final String inputPath = "metadatos";  // carpeta en HDFS o local con JSONs
    private final String outputPath = "salida/indice_invertido";

    public void ejecutarIndiceInvertido() throws Exception {
        // Lanza el job MapReduce de Hadoop para construir índice invertido
        InvertedIndexJob.runJob(inputPath, outputPath);
    }
    public void runInvertedIndexJob(String inputDirHdfs, String outputDirHdfs) throws Exception {
        InvertedIndexJob.runJob(inputDirHdfs, outputDirHdfs);
    }
}