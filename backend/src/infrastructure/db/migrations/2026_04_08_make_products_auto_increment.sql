-- Ensure products.id is AUTO_INCREMENT so API can create without explicit id.
-- Safe even if table already has values.

ALTER TABLE products
  MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

