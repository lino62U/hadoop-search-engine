package com.searchengine.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")

public class User {
    @Id
    private String id;
    private String nombre;
    private String email;

    // Constructor vacío
    public User() {}

    public User(String name, String email) {
        this.nombre = name;
        this.email = email;
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return nombre; }
    public void setName(String name) { this.nombre = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}