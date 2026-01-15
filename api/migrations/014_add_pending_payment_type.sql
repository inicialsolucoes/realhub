ALTER TABLE payments MODIFY COLUMN type ENUM('income', 'expense', 'pending') NOT NULL;
