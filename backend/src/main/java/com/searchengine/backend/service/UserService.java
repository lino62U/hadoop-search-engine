package com.searchengine.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.searchengine.backend.model.User;
import com.searchengine.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}