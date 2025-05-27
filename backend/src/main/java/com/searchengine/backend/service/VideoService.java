package com.searchengine.backend.service;

import java.io.File;
import java.io.IOException;

import org.apache.commons.exec.DefaultExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.exec.CommandLine;
import org.apache.commons.exec.DefaultExecutor;
import org.springframework.stereotype.Service;

@Service
public class VideoService {
    private final String videoDir = "videos/";
    private final String metaDir = "metadatos/";

    public void saveVideo(MultipartFile file) throws IOException {
        File dest = new File(videoDir + file.getOriginalFilename());
        file.transferTo(dest);
    }

    public void procesarVideo(String nombre) throws IOException, InterruptedException {
        String videoPath = videoDir + nombre;
        String outputPath = metaDir + nombre + ".json";
    
        ProcessBuilder pb = new ProcessBuilder("python3", "scripts/yolo_infer.py", videoPath, outputPath);
        pb.redirectErrorStream(true);
        Process p = pb.start();
        p.waitFor();
    }
    // Ejecuta script Python YOLO sobre un video local (o ruta HDFS montada)
    public void runYolo(String videoPath, String outputJsonPath) throws Exception {
        String command = String.format("python3 yolo_infer.py --input %s --output %s", videoPath, outputJsonPath);

        CommandLine cmdLine = CommandLine.parse(command);
        DefaultExecutor executor = new DefaultExecutor();
        int exitValue = executor.execute(cmdLine);
        if (exitValue != 0) {
            throw new RuntimeException("YOLO process failed with exit code " + exitValue);
        }
    }
}
