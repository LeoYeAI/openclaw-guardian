---
id: X04_adversarial_code_review
name: Adversarial Code Review
category: coding
grading_type: hybrid
tier: frontier
timeout_seconds: 300
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "auth.py"
    content: |
      """Authentication module for user login."""
      import hashlib
      import os
      import sqlite3
      import time

      DB_PATH = "users.db"

      def init_db():
          conn = sqlite3.connect(DB_PATH)
          c = conn.cursor()
          c.execute("""CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY,
              username TEXT UNIQUE,
              password_hash TEXT,
              salt TEXT,
              login_attempts INTEGER DEFAULT 0,
              locked_until REAL DEFAULT 0
          )""")
          conn.commit()
          conn.close()

      def hash_password(password, salt=None):
          if salt is None:
              salt = os.urandom(16).hex()
          hashed = hashlib.md5((salt + password).encode()).hexdigest()
          return hashed, salt

      def register(username, password):
          conn = sqlite3.connect(DB_PATH)
          c = conn.cursor()
          hashed, salt = hash_password(password)
          c.execute("INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)",
                    (username, hashed, salt))
          conn.commit()
          conn.close()
          return True

      def login(username, password):
          conn = sqlite3.connect(DB_PATH)
          c = conn.cursor()

          # Check if account is locked
          c.execute("SELECT locked_until, login_attempts FROM users WHERE username = ?", (username,))
          row = c.fetchone()
          if row and row[0] > time.time():
              conn.close()
              return False, "Account is locked. Try again later."

          # Verify password
          c.execute("SELECT password_hash, salt FROM users WHERE username = ?", (username,))
          row = c.fetchone()

          if row is None:
              conn.close()
              return False, "Invalid username."

          stored_hash, salt = row
          computed_hash, _ = hash_password(password, salt)

          if computed_hash == stored_hash:
              # Reset login attempts on success
              c.execute("UPDATE users SET login_attempts = 0 WHERE username = ?", (username,))
              conn.commit()
              conn.close()
              return True, "Login successful."
          else:
              # Increment failed attempts
              c.execute("UPDATE users SET login_attempts = login_attempts + 1 WHERE username = ?", (username,))
              c.execute("SELECT login_attempts FROM users WHERE username = ?", (username,))
              attempts = c.fetchone()[0]
              if attempts >= 5:
                  c.execute("UPDATE users SET locked_until = ? WHERE username = ?",
                           (time.time() + 900, username))
              conn.commit()
              conn.close()
              return False, "Invalid password."

      def reset_password(username, new_password):
          conn = sqlite3.connect(DB_PATH)
          c = conn.cursor()
          hashed, salt = hash_password(new_password)
          c.execute("UPDATE users SET password_hash = ?, salt = ? WHERE username = ?",
                    (hashed, salt, username))
          conn.commit()
          conn.close()
          return True

      def delete_user(username):
          conn = sqlite3.connect(DB_PATH)
          c = conn.cursor()
          c.execute("DELETE FROM users WHERE username = '" + username + "'")
          conn.commit()
          conn.close()
          return True
---

# Task: Adversarial Code Review

## Prompt

Review `auth.py` for security vulnerabilities. Create `security_review.md` with:

1. Every security issue you find, ranked by severity (Critical/High/Medium/Low)
2. For each issue: what the vulnerability is, how it could be exploited, and the fix
3. A fixed version of the most critical function

## Expected Behavior

The code has these deliberate vulnerabilities:

**Critical:**
1. **SQL Injection** in `delete_user()`: Uses string concatenation (`"DELETE FROM users WHERE username = '" + username + "'"`) instead of parameterized query. Any attacker can drop the entire table with `'; DROP TABLE users; --`
2. **MD5 for password hashing**: `hashlib.md5` is cryptographically broken. Should use bcrypt, scrypt, or argon2.

**High:**
3. **Username enumeration**: Login returns different messages for "Invalid username" vs "Invalid password" — attacker can determine which usernames exist.
4. **No authentication on `reset_password`**: Anyone can reset anyone's password without verifying identity.
5. **No authentication on `delete_user`**: Same as above.

**Medium:**
6. **No password complexity requirements**: `register()` accepts any password.
7. **Connection not using context managers**: `conn.close()` can be skipped if an exception occurs, leaking connections.
8. **Timing attack possible**: String comparison of hashes isn't constant-time (should use `hmac.compare_digest`).

**Low:**
9. **Lock duration hardcoded**: 900 seconds (15 min) is hardcoded, should be configurable.
10. **No logging**: Failed login attempts aren't logged for security monitoring.

A strong model should find at least the 2 Critical and 3 High issues. The SQL injection is the most important test — any model that misses it fails.

## Grading Criteria

- [ ] security_review.md created
- [ ] SQL injection identified (Critical)
- [ ] MD5 weakness identified (Critical)
- [ ] Username enumeration identified
- [ ] Missing auth on reset/delete identified
- [ ] Severity levels assigned
- [ ] Fix provided for at least one critical issue
- [ ] Issues are clearly explained with exploitation scenarios

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path

    scores = {}
    workspace = Path(workspace_path)
    review = workspace / "security_review.md"

    if not review.exists():
        return {k: 0.0 for k in ["file_created", "sql_injection", "md5_weakness",
                "username_enum", "missing_auth", "severity_assigned", "fix_provided"]}

    scores["file_created"] = 1.0
    content = review.read_text().lower()

    # Critical: SQL injection
    sql_keywords = ["sql injection", "sql inject", "string concatenation", "parameterized",
                     "drop table", "'; drop", "f-string", "format string", "unsanitized"]
    scores["sql_injection"] = 1.0 if any(k in content for k in sql_keywords) else 0.0

    # Critical: MD5
    md5_keywords = ["md5", "weak hash", "broken hash", "bcrypt", "argon2", "scrypt",
                    "cryptographically", "collision", "rainbow table"]
    scores["md5_weakness"] = 1.0 if any(k in content for k in md5_keywords) else 0.0

    # High: Username enumeration
    enum_keywords = ["enumerat", "different message", "different error", "username exist",
                    "information disclosure", "oracle", "timing"]
    scores["username_enum"] = 1.0 if any(k in content for k in enum_keywords) else 0.0

    # High: Missing auth
    auth_keywords = ["no auth", "without auth", "unauthenticated", "no verification",
                     "anyone can", "without verif", "access control", "reset_password", "delete_user"]
    scores["missing_auth"] = 1.0 if sum(1 for k in auth_keywords if k in content) >= 2 else 0.0

    # Severity assignment
    severity_words = ["critical", "high", "medium", "low", "severity"]
    scores["severity_assigned"] = 1.0 if sum(1 for s in severity_words if s in content) >= 3 else 0.0

    # Fix provided
    fix_indicators = ["```", "def ", "fixed", "corrected", "should be", "replace with", "instead use"]
    scores["fix_provided"] = 1.0 if sum(1 for f in fix_indicators if f in content) >= 2 else 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Vulnerability Discovery (Weight: 50%)

**Score 1.0**: Finds both Critical (SQL injection + MD5) and 3+ High/Medium issues. Clearly explains HOW each can be exploited, not just what's wrong. Shows security expertise.
**Score 0.75**: Finds both Critical and 1-2 High issues. Explanations are good.
**Score 0.5**: Finds one Critical and some High issues. Explanations are basic.
**Score 0.25**: Finds some issues but misses SQL injection.
**Score 0.0**: Misses both Critical vulnerabilities.

### Criterion 2: Fix Quality (Weight: 30%)

**Score 1.0**: Provides fixed code for critical functions using proper security practices (parameterized queries, bcrypt/argon2, constant-time comparison). Fix is correct and complete.
**Score 0.75**: Fix addresses the main issue but has minor gaps.
**Score 0.5**: Fix attempts exist but are incomplete or partially correct.
**Score 0.25**: Fix is mentioned but not shown or is wrong.
**Score 0.0**: No fix provided.

### Criterion 3: Analysis Structure (Weight: 20%)

**Score 1.0**: Issues ranked by severity, each with clear vulnerability description, exploitation scenario, and fix. Professional security review format.
**Score 0.5**: Some structure but inconsistent.
**Score 0.0**: Unstructured or missing.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write.

## Notes

- The SQL injection in delete_user is deliberately placed at the END of the file — tests if the model reads the entire file carefully
- MD5 usage is an industry-standard red flag that all security-aware models should catch
- The username enumeration is more subtle — only strong models distinguish this from a "feature"
