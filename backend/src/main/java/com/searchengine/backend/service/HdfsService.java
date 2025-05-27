package com.searchengine.backend.service;

import org.apache.hadoop.fs.*;
import org.springframework.stereotype.Service;
import org.apache.hadoop.conf.Configuration;
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service

public class HdfsService {

    private final FileSystem fs;

    public HdfsService() throws IOException {
        Configuration conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://localhost:9000"); // Cambia por tu URL de HDFS
        fs = FileSystem.get(URI.create("hdfs://localhost:9000"), conf);
    }

    // Subir archivo local a HDFS
    public void uploadFile(String localPath, String hdfsDestPath) throws IOException {
        Path src = new Path(localPath);
        Path dst = new Path(hdfsDestPath);
        fs.copyFromLocalFile(false, true, src, dst);
    }

    // Listar archivos en carpeta HDFS
    public List<String> listFiles(String hdfsDir) throws IOException {
        List<String> files = new ArrayList<>();
        RemoteIterator<LocatedFileStatus> iterator = fs.listFiles(new Path(hdfsDir), false);
        while (iterator.hasNext()) {
            LocatedFileStatus status = iterator.next();
            files.add(status.getPath().toString());
        }
        return files;
    }

    // Descargar archivo de HDFS a local
    public void downloadFile(String hdfsPath, String localDest) throws IOException {
        Path src = new Path(hdfsPath);
        Path dst = new Path(localDest);
        fs.copyToLocalFile(false, src, dst);
    }
}