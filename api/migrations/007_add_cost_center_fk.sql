ALTER TABLE payments ADD CONSTRAINT fk_payment_cost_center FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id);
