-- Renombrar columna de Stripe a Clip
ALTER TABLE reservas RENAME COLUMN stripe_payment_id TO clip_payment_request_id;
