package com.searchengine.backend.repository;

import com.searchengine.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    // Aquí puedes agregar consultas personalizadas si quieres
}