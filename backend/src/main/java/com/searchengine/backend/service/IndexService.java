package com.searchengine.backend.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;





@Service
public class IndexService {

    private Map<String, List<String>> invertedIndex = new HashMap<>();

    
    public List<String> buscarObjeto(String objeto) throws IOException {
        List<String> resultados = new ArrayList<>();
        File folder = new File("salida/indice_invertido/");
        for (File file : folder.listFiles()) {
            List<String> lines = Files.readAllLines(file.toPath());
            for (String line : lines) {
                if (line.contains("'" + objeto + "'")) {
                    resultados.add(line);
                }
            }
        }
        return resultados;
    }

    // Cargar índice invertido desde archivo local (resultado MapReduce)
    public void loadIndex(String localIndexFilePath) throws Exception {
        invertedIndex.clear();
        try (BufferedReader br = new BufferedReader(new FileReader(localIndexFilePath))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split("\\t");
                if (parts.length != 2) continue;
                String key = parts[0];
                String[] videos = parts[1].split(",\\s*");
                invertedIndex.put(key, Arrays.asList(videos));
            }
        }
    }

    // Buscar palabra clave
    public List<String> search(String keyword) {
        return invertedIndex.getOrDefault(keyword.toLowerCase(), Collections.emptyList());
    }
}
