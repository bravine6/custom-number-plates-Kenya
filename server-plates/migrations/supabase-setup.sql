-- Create tables for Custom Plates Kenya application

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(20) DEFAULT 'user',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plates table
CREATE TABLE IF NOT EXISTS "plates" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "image_url" TEXT,
  "base_price" DECIMAL(10, 2) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "features" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id"),
  "total_amount" DECIMAL(10, 2) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'pending',
  "payment_method" VARCHAR(50),
  "payment_status" VARCHAR(20) DEFAULT 'unpaid',
  "shipping_address" JSONB,
  "tracking_number" VARCHAR(100),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER REFERENCES "orders"("id"),
  "plate_id" INTEGER REFERENCES "plates"("id"),
  "quantity" INTEGER DEFAULT 1,
  "price" DECIMAL(10, 2) NOT NULL,
  "customization" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial plate types
INSERT INTO "plates" ("name", "description", "base_price", "type", "features") 
VALUES 
('Standard Plate', 'Regular Kenyan number plate', 5000.00, 'standard', '{"colors": ["white", "black"], "materials": ["aluminum"]}'),
('Personalized Plate', 'Custom text on your plate', 15000.00, 'personalized', '{"colors": ["white", "black", "blue"], "materials": ["aluminum", "carbon-fiber"]}'),
('Vintage Plate', 'Classic design for vintage vehicles', 8000.00, 'vintage', '{"colors": ["cream", "black"], "materials": ["aluminum"]}'),
('Digital Plate', 'Modern digital display plate', 25000.00, 'digital', '{"colors": ["multi"], "materials": ["digital-display"], "features": ["gps-tracking", "digital-display"]}')
ON CONFLICT DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO "users" ("name", "email", "password", "role")
VALUES ('Admin', 'admin@plates.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOSsJTWR3K4Pw2xx1l8HXgnLwD.Ne', 'admin')
ON CONFLICT DO NOTHING;