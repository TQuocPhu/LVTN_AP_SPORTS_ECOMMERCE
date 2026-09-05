package com.web.ap_sports.service;

import com.web.ap_sports.dto.request.UserCreateRequest;
import com.web.ap_sports.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserCreateRequest request);
    UserResponse getUserById(Long id);
    List<UserResponse> getAllUsers();
}
