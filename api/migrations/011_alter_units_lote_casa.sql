-- Migration to allow alphanumeric lote and casa
ALTER TABLE units MODIFY lote VARCHAR(50) NOT NULL;
ALTER TABLE units MODIFY casa VARCHAR(50) NOT NULL;
