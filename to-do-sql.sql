-- SQL for To-Do List Project

DROP TABLE IF EXISTS to_do_item, to_do_list_user;

CREATE TABLE to_do_list_user (
  id SERIAL PRIMARY KEY,
  username text,
  full_name text,
  password text,
  date_created TIMESTAMP WITH TIME ZONE,
  date_modified TIMESTAMP WITH TIME ZONE
);

CREATE TABLE to_do_item (
  id SERIAL PRIMARY KEY,
  user_id_fk INT REFERENCES to_do_list_user(id),
  name text,
  notes text,
  date_to_start TIMESTAMP WITH TIME ZONE,
  date_to_be_done TIMESTAMP WITH TIME ZONE,
  date_completed TIMESTAMP WITH TIME ZONE,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_modified TIMESTAMP WITH TIME ZONE
);