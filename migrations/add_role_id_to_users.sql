-- Add roleId column to Users table
ALTER TABLE "Users" ADD COLUMN "roleId" INTEGER REFERENCES "Roles"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Sync existing users' roleId based on their role string
UPDATE "Users" u SET "roleId" = r.id 
FROM "Roles" r 
WHERE LOWER(r.name) = LOWER(u.role);

-- Make roleId nullable for backward compatibility
-- (already set as nullable in the model)
