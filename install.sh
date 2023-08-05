#!/bin/bash

# Create the directory
mkdir devographics

# Change into the directory
cd devographics

# 
git clone https://github.com/Devographics/Monorepo.git monorepo

#
git clone https://github.com/Devographics/entities.git entities

#
git clone https://github.com/Devographics/surveys.git surveys

# Create the directory
mkdir locales

# Change into the directory
cd locales

#
git clone https://github.com/Devographics/locale-en-US locale-en-US

cd ../monorepo

cd surveyform

touch .env.development.local

cd ../surveyadmin

touch .env.development.local

cd ../api

touch .env

cd ../results

touch .env

cd ../homepage

touch .env