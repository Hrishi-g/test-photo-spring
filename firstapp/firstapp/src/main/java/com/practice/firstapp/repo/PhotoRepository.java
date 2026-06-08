package com.practice.firstapp.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practice.firstapp.vo.Photo;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

}
