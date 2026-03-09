---
id: F03_config_replace
name: Config Search & Replace
category: file_ops
grading_type: automated
tier: foundation
timeout_seconds: 180
optimal_tool_calls: 4
inject_date: false
workspace_files:
  - path: "config/settings.json"
    content: |
      {
        "database": {
          "host": "localhost",
          "port": 5432,
          "name": "myapp_dev",
          "user": "devuser",
          "password": "dev_password_123"
        },
        "api": {
          "endpoint": "http://localhost:3000",
          "timeout": 30
        },
        "logging": {
          "level": "debug",
          "file": "/var/log/myapp/dev.log"
        }
      }
  - path: "config/database.yml"
    content: |
      development:
        adapter: postgresql
        host: localhost
        port: 5432
        database: myapp_dev
        username: devuser
        password: dev_password_123

      test:
        adapter: postgresql
        host: localhost
        port: 5432
        database: myapp_test
        username: devuser
        password: dev_password_123
---

# Task: Config Search & Replace

## Prompt

Update the configuration files in `config/` for production deployment:

1. Change all `localhost` to `prod-db.example.com`
2. Change `myapp_dev` to `myapp_prod` and `myapp_test` to `myapp_prod`
3. Change log level from `debug` to `warn` (in settings.json)
4. Update API endpoint from `http://localhost:3000` to `https://api.example.com`

List what you changed in each file.

## Expected Behavior

Read both config files, make targeted replacements, preserve file format validity (valid JSON, valid YAML).

## Grading Criteria

- [ ] settings.json: localhost → prod-db.example.com (db host)
- [ ] settings.json: myapp_dev → myapp_prod
- [ ] settings.json: debug → warn
- [ ] settings.json: API endpoint updated to https
- [ ] database.yml: localhost → prod-db.example.com
- [ ] database.yml: myapp_dev and myapp_test → myapp_prod
- [ ] Both files remain valid format

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import json

    scores = {}
    workspace = Path(workspace_path)

    # Check settings.json
    settings = workspace / "config" / "settings.json"
    if settings.exists():
        content = settings.read_text()

        # Validate JSON
        try:
            data = json.loads(content)
            scores["json_valid"] = 1.0
        except json.JSONDecodeError:
            scores["json_valid"] = 0.0
            data = {}

        # Check replacements using parsed data when possible
        if data:
            db = data.get("database", {})
            scores["json_host"] = 1.0 if db.get("host") == "prod-db.example.com" else 0.0
            scores["json_dbname"] = 1.0 if db.get("name") == "myapp_prod" else 0.0
            scores["json_loglevel"] = 1.0 if data.get("logging", {}).get("level") == "warn" else 0.0
            scores["json_api"] = 1.0 if "https://api.example.com" in str(data.get("api", {}).get("endpoint", "")) else 0.0
        else:
            scores["json_host"] = 1.0 if "prod-db.example.com" in content and "localhost" not in content.replace("api.example.com", "") else 0.0
            scores["json_dbname"] = 1.0 if "myapp_prod" in content and "myapp_dev" not in content else 0.0
            scores["json_loglevel"] = 1.0 if '"warn"' in content.lower() else 0.0
            scores["json_api"] = 1.0 if "https://api.example.com" in content else 0.0
    else:
        scores["json_valid"] = 0.0
        scores["json_host"] = 0.0
        scores["json_dbname"] = 0.0
        scores["json_loglevel"] = 0.0
        scores["json_api"] = 0.0

    # Check database.yml
    db_file = workspace / "config" / "database.yml"
    if db_file.exists():
        content = db_file.read_text()
        scores["yaml_host"] = 1.0 if "prod-db.example.com" in content and "localhost" not in content else 0.0
        scores["yaml_dbname"] = 1.0 if "myapp_prod" in content and "myapp_dev" not in content and "myapp_test" not in content else 0.0
    else:
        scores["yaml_host"] = 0.0
        scores["yaml_dbname"] = 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 4
- **Rationale**: 2 reads + 2 edits/writes = 4
