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

    // Seed Departments
    console.log('🌱 Seeding Departments...');
    const deptSciRes = await pool.query("INSERT INTO departments (name, code) VALUES ('Science Department', 'SCI') RETURNING id");
    const deptHumRes = await pool.query("INSERT INTO departments (name, code) VALUES ('Humanities Department', 'HUM') RETURNING id");
    const sciId = deptSciRes.rows[0].id;
    const humId = deptHumRes.rows[0].id;

    // Seed Classes
    console.log('🌱 Seeding Classes...');
    const cls10Res = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 10', $1) RETURNING id", [sciId]);
    const cls11Res = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 11', $1) RETURNING id", [sciId]);
    const cls12Res = await pool.query("INSERT INTO classes (name, department_id) VALUES ('Grade 12', $1) RETURNING id", [humId]);
    const cls10Id = cls10Res.rows[0].id;
    const cls11Id = cls11Res.rows[0].id;
    const cls12Id = cls12Res.rows[0].id;

    // Seed Sections
    console.log('🌱 Seeding Sections...');
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('A', $1, 'Room 101')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('B', $1, 'Room 102')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('C', $1, 'Room 103')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('D', $1, 'Room 104')", [cls10Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('A', $1, 'Room 201')", [cls11Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('B', $1, 'Room 202')", [cls11Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('C', $1, 'Room 203')", [cls11Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('A', $1, 'Room 301')", [cls12Id]);
    await pool.query("INSERT INTO sections (name, class_id, room_number) VALUES ('B', $1, 'Room 302')", [cls12Id]);

    // Seed Subjects
    console.log('🌱 Seeding Subjects...');
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Mathematics', 'MATH-101', $1, 4)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Organic Chemistry', 'CHEM-101', $1, 3)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Physics', 'PHYS-101', $1, 3)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Biology', 'BIOL-101', $1, 3)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('English Literature', 'ENGL-101', $1, 2)", [humId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Computer Science', 'COSC-101', $1, 4)", [sciId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('History', 'HIST-101', $1, 3)", [humId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Geography', 'GEOG-101', $1, 3)", [humId]);
    await pool.query("INSERT INTO subjects (name, code, department_id, credits) VALUES ('Economics', 'ECON-101', $1, 3)", [humId]);

    console.log('🎉 PostgreSQL Database successfully seeded with baseline roles, Admin user, departments, classes, sections, and subjects catalog!');
  } catch (error) {
    console.error('❌ Error seeding PostgreSQL database:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
