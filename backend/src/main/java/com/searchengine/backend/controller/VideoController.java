package com.searchengine.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import com.searchengine.backend.service.IndexService;
import com.searchengine.backend.service.HadoopService;
import com.searchengine.backend.service.HdfsService;
import com.searchengine.backend.service.VideoService;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private HdfsService hdfsService;
    @Autowired private VideoService yoloService;
    @Autowired private HadoopService hadoopService;
    @Autowired private IndexService indexService;

    // Subir video y copiar a HDFS (simulación)
    @PostMapping("/upload")
    public String uploadVideo(@RequestParam String localVideoPath) throws Exception {
        String hdfsPath = "/user/hadoop/videos/" + localVideoPath.substring(localVideoPath.lastIndexOf('/') + 1);
        hdfsService.uploadFile(localVideoPath, hdfsPath);
        return "Video subido a HDFS: " + hdfsPath;
    }
    // Procesar videos (ejecutar YOLO para cada video en HDFS y guardar JSON en HDFS)
    @PostMapping("/processVideos")
    public String processVideos() throws Exception {
        List<String> videos = hdfsService.listFiles("/user/hadoop/videos");
        for (String videoHdfsPath : videos) {
            // Descargar video localmente para procesar YOLO (en producción ejecutar remotamente en nodos esclavos)
            String localVideo = "/tmp/" + videoHdfsPath.substring(videoHdfsPath.lastIndexOf('/') + 1);
            hdfsService.downloadFile(videoHdfsPath, localVideo);

            // Ejecutar YOLO (output JSON local)
            String jsonOutput = "/tmp/" + localVideo.substring(localVideo.lastIndexOf('/') + 1) + ".json";
            yoloService.runYolo(localVideo, jsonOutput);

            // Subir JSON a HDFS
            String hdfsJson = "/user/hadoop/metadatos/" + jsonOutput.substring(jsonOutput.lastIndexOf('/') + 1);
            hdfsService.uploadFile(jsonOutput, hdfsJson);
        }
        return "Procesamiento de videos completado y metadata subida a HDFS.";
    }

    // Ejecutar job MapReduce para crear índice invertido
    @PostMapping("/buildIndex")
    public String buildIndex() throws Exception {
        String inputDir = "/user/hadoop/metadatos";
        String outputDir = "/user/hadoop/salida/indice_invertido";
        hadoopService.runInvertedIndexJob(inputDir, outputDir);
        return "Índice invertido generado en: " + outputDir;
    }

    // Cargar índice invertido para consultas (descargar resultado MapReduce)
    @PostMapping("/loadIndex")
    public String loadIndex() throws Exception {
        String hdfsIndexFile = "/user/hadoop/salida/indice_invertido/part-r-00000";
        String localIndexFile = "/tmp/indice_invertido.txt";
        hdfsService.downloadFile(hdfsIndexFile, localIndexFile);
        indexService.loadIndex(localIndexFile);
        return "Índice invertido cargado para consultas.";
    }

    // Buscar palabra clave en índice invertido
    @GetMapping("/search")
    public List<String> search(@RequestParam String q) {
        return indexService.search(q);
    }
}
