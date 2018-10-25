
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