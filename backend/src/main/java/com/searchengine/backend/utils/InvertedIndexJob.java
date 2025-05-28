package com.searchengine.backend.utils;

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.mapreduce.Mapper;


import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.json.JSONArray;
import org.json.JSONObject;



public class InvertedIndexJob {

    public static class TokenizerMapper extends Mapper<LongWritable, Text, Text, Text> {

        private Text word = new Text();
        private Text location = new Text();

        @Override
        protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            // value = línea JSON completa (lista de objetos detectados en un video)
            String jsonString = value.toString();

            try {
                JSONArray jsonArray = new JSONArray(jsonString);
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject obj = jsonArray.getJSONObject(i);
                    String objectName = obj.getString("object");
                    String loc = obj.getString("video") + ":" + obj.getInt("frame");
                    word.set(objectName);
                    location.set(loc);
                    context.write(word, location);
                }
            } catch (Exception e) {
                // Ignorar líneas malformadas
            }
        }
    }

    public static class InvertedIndexReducer extends Reducer<Text, Text, Text, Text> {

        private Text result = new Text();

        @Override
        protected void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
            StringBuilder sb = new StringBuilder();
            for (Text val : values) {
                sb.append(val.toString()).append(", ");
            }
            // Quitar la última coma y espacio
            if (sb.length() > 2) {
                sb.setLength(sb.length() - 2);
            }
            result.set(sb.toString());
            context.write(key, result);
        }
    }

    public static void runJob(String inputPath, String outputPath) throws Exception {
        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "inverted index");
        job.setJarByClass(InvertedIndexJob.class);
        job.setMapperClass(TokenizerMapper.class);
        job.setCombinerClass(InvertedIndexReducer.class);
        job.setReducerClass(InvertedIndexReducer.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);

        FileInputFormat.addInputPath(job, new Path(inputPath));
        FileOutputFormat.setOutputPath(job, new Path(outputPath));

        if (!job.waitForCompletion(true)) {
            throw new RuntimeException("Error en el job Hadoop");
        }
    }
}