-- SQL for To-Do List Project

-- Initial version: 2018/11/24

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


-- 2018/11/26

DROP TABLE IF EXISTS to_do_item, to_do_list_user;

CREATE TABLE to_do_list_user (
  id SERIAL PRIMARY KEY,
  username text NOT NULL,
  full_name text NOT NULL,
  password text NOT NULL,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  date_modified TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE to_do_item (
  id SERIAL PRIMARY KEY,
  user_id_fk INT REFERENCES to_do_list_user(id) NOT NULL,
  thing_to_do text NOT NULL,
  notes text,
  date_to_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_to_be_done TIMESTAMP WITH TIME ZONE NOT NULL,
  date_completed TIMESTAMP WITH TIME ZONE,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  date_modified TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

INSERT INTO to_do_list_user (username, full_name, password)
VALUES ('asquire', 'Timothy Bohman', 'rights');

INSERT INTO to_do_list_user (username, full_name, password)
VALUES ('tester', 'Test User', 'access');

INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done)
VALUES (1, 'Do laundry', 'Separate batches for whites, colors, and darks', '2018-11-30', '2018-12-01');

INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done)
VALUES (1, 'Complete Week 11 Prove assignment', 'Build client-side interaction', '2018-11-29', '2018-12-01');

INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done)
VALUES (1, 'Complete Week 12 Prove assignment', 'Finish client-side interaction', '2018-12-06', '2018-12-08');

INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done)
VALUES (1, 'Complete the work week', 'The last week of November', '2018-11-26', '2018-11-30');

SELECT * FROM to_do_item;