-- Migration to add interfone field to units
ALTER TABLE units ADD COLUMN interfone VARCHAR(50);
