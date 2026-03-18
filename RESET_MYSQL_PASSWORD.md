# Reset MySQL Root Password (Mac – Oracle/MySQL installer)

You have MySQL at `/usr/local/mysql`. Use these steps when you get "Access denied" for every login.

---

## Step 1: Stop MySQL

**Option A – System preference**
- Open **System Settings** (or **System Preferences**) → find **MySQL** → stop the server.

**Option B – Terminal**
```bash
sudo /usr/local/mysql/support-files/mysql.server stop
```
If that fails, find the process and kill it:
```bash
ps aux | grep mysql
sudo kill <PID>
```

---

## Step 2: Start MySQL in safe mode (skip password check)

In Terminal:

```bash
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables --user=mysql &
```

Wait a few seconds until MySQL is up. You may see "Starting mysqld daemon" and some log lines.

---

## Step 3: Log in as root (no password)

Open a **new** terminal window/tab and run:

```bash
/usr/local/mysql/bin/mysql -u root
```

You should get a `mysql>` prompt. If you do, continue to Step 4.

---

## Step 4: Set a new root password and fix orbit_user

At the `mysql>` prompt, run these lines **one at a time** (replace `YourNewRootPass` with a root password you’ll remember):

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewRootPass';
CREATE USER IF NOT EXISTS 'orbit_user'@'localhost' IDENTIFIED BY 'jaipandhoh';
GRANT ALL PRIVILEGES ON orbit.* TO 'orbit_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 5: Stop safe-mode MySQL and start MySQL normally

In the terminal where you started `mysqld_safe`, press **Ctrl+C** to stop it.

Then start MySQL the normal way:

**If you use the MySQL preference pane:** start the MySQL server from there.

**Or from Terminal:**
```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

---

## Step 6: Test

**Test root:** (use the password you set in Step 4)
```bash
/usr/local/mysql/bin/mysql -u root -p -e "SELECT 'root works';"
```

**Test orbit_user:** (password: `jaipandhoh`)
```bash
/usr/local/mysql/bin/mysql -u orbit_user -p orbit -e "SELECT 'orbit_user works';"
```
When prompted, type: **jaipandhoh**

If both commands run without "Access denied", you’re done. Restart your Orbit app and try again.

---

## If the database `orbit` doesn’t exist yet

After resetting the root password, create the database and run the schema:

```bash
/usr/local/mysql/bin/mysql -u root -p < orbit_schema.sql
```

Use your **new root password**. Make sure the line in `orbit_schema.sql` that creates `orbit_user` uses the password `jaipandhoh` (so it matches your `.env`), or run the `CREATE USER` and `GRANT` from Step 4 after running the schema.
