import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

const hash = (pass: string) => bcrypt.hashSync(pass, 10);

async function main() {
  console.log('🚀 Starting Database Seeding on PostgreSQL...');
  
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Executing DDL Schema...');
    await pool.query(schemaSql);
    console.log('✅ Schema tables successfully created.');

    // Clear existing data (optional / safe truncate in order)
    console.log('🗑️ Cleaning up existing tables...');
    await pool.query(`
      TRUNCATE TABLE 
        notifications, timetables, payments, fee_structures, 
        assignment_submissions, assignments, grades, exams, 
        attendance_records, attendance, subjects, students, 
        sections, classes, parents, departments, teachers, 
        users, roles, academic_years CASCADE
    `);

    // Insert Roles
    console.log('🌱 Seeding Roles...');
    const roles = [
      { name: 'Admin' },
      { name: 'Principal' },
      { name: 'HOD' },
      { name: 'Teacher' },
      { name: 'Student' },
      { name: 'Parent' },
      { name: 'Accountant' }
    ];
    const roleIdMap: Record<string, string> = {};
    for (const r of roles) {
      const res = await pool.query(
        'INSERT INTO roles (name) VALUES ($1) RETURNING id',
        [r.name]
      );
      roleIdMap[r.name] = res.rows[0].id;
    }

    // Insert Academic Years
    console.log('🌱 Seeding Academic Years...');
    const ayRes = await pool.query(
      "INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES ('2025-2026', '2025-06-01', '2026-04-30', true) RETURNING id"
    );
    const ayId = ayRes.rows[0].id;

    // Create Users (Admin, Principal, Accountant, Teachers, Parents, Students)
    console.log('🌱 Seeding Users & Role Identities...');
    
    // Admin User
    const adminUser = await pool.query(
      'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id',
      ['admin@edusync.com', hash('admin123'), roleIdMap['Admin']]
    );
    console.log('🎉 PostgreSQL Database successfully seeded with baseline roles and Admin user!');
  } catch (error) {
    console.error('❌ Error seeding PostgreSQL database:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
