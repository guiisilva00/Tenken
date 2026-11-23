import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "-03:00",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on("connection", (connection) => {
  connection.query("SET time_zone = '-03:00'");
});

export async function checkDatabaseConnection() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}
