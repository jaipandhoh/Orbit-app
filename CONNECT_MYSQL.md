# Connect MySQL to Orbit

The Orbit app reads database config from a `.env` file in the project root. Use these steps to get MySQL connected.

## 1. Install MySQL

- **macOS (Homebrew):** `brew install mysql` then `brew services start mysql`
- **macOS (DMG):** Install from [MySQL downloads](https://dev.mysql.com/downloads/mysql/)
- **Windows:** Use the MySQL installer from the same link.

## 2. Create `.env`

In the project root, create a `.env` file (or update it) with:

```
DB_HOST=localhost
DB_USER=orbit_user
DB_PASSWORD=your_password_here
DB_NAME=orbit
DB_PORT=3306
PORT=3000
```

Replace `your_password_here` with the password you assign to `orbit_user` in step 4.

## 3. Create database, user, and schema

**Important:** Open `orbit_schema.sql` and replace `your_password_here` (in the `CREATE USER` line) with the same password you use in `.env` for `DB_PASSWORD`. Then run the script.

You must run the setup SQL **as a MySQL user with privileges to create databases and users** (usually `root`).

**Option A – MySQL CLI**

```bash
mysql -u root -p < orbit_schema.sql
```

Enter your MySQL root password when prompted. The script will create the `orbit` database, `orbit_user`, and all required tables.

**Option B – MySQL Workbench / GUI**

1. Connect as `root`.
2. Open `orbit_schema.sql`.
3. Execute the full script.

**Option C – Run statements manually**

1. Connect as root: `mysql -u root -p`
2. Copy and run the contents of `orbit_schema.sql` in order.

## 4. Create `orbit_user` (if the script doesn’t)

If your MySQL setup doesn’t allow the script to create users, run this yourself as root:

```sql
CREATE USER IF NOT EXISTS 'orbit_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON orbit.* TO 'orbit_user'@'localhost';
FLUSH PRIVILEGES;
```

Use the same password as in `.env`.

## 5. Verify

1. Start the app: `npm run dev:server` and `npm run dev:client`.
2. Open **http://localhost:5173**.
3. Check the sidebar: **Connected** means the app reached MySQL; **Disconnected** means `.env` or MySQL setup is wrong.

You can also hit:

```bash
curl http://localhost:3000/api/health/db
```

A response like `{"status":"connected","result":[...]}` means the backend is connected to MySQL.

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **Access denied for 'orbit_user'@'localhost'** | Wrong password in `.env`, or user not created. Re-run the `CREATE USER` / `GRANT` commands (step 4) and ensure `DB_PASSWORD` matches. |
| **Unknown database 'orbit'** | Database not created. Run `orbit_schema.sql` as root (step 3). |
| **Table 'orbit.xxx' doesn't exist** | Schema not fully applied. Run the entire `orbit_schema.sql` again. |
| **ECONNREFUSED 127.0.0.1:3306** | MySQL not running. Start it (e.g. `brew services start mysql` or your OS service manager). |
| **Can’t connect as root** | Use the root password you set at install. Reset it via MySQL docs if you forgot it. |

## Summary

1. Install and start MySQL.
2. Add `.env` with `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.
3. Run `orbit_schema.sql` as root.
4. Create `orbit_user` if needed (step 4).
5. Restart the app and check **http://localhost:5173** or `/api/health/db`.
