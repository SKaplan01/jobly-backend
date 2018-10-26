
-- schema for companies table

CREATE TABLE companies(
handle TEXT PRIMARY KEY,
name TEXT NOT NULL,
num_employees INTEGER,
description TEXT,
logo_url TEXT);


-- schema for jobs table

CREATE TABLE jobs(
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
salary FLOAT NOT NULL,
equity FLOAT NOT NULL CONSTRAINT max_equity CHECK (equity<=1),
company_handle TEXT REFERENCES companies(handLe) ON DELETE CASCADE,
date_posted TIMESTAMP);


--schema for users table

CREATE TABLE users(
username TEXT PRIMARY KEY,
password TEXT NOT NULL,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
photo_url TEXT,
is_admin BOOLEAN NOT NULL DEFAULT FALSE);
