---
id: M06_multi_file_refactor
name: Multi-File Refactoring
category: coding
grading_type: automated
tier: mastery
timeout_seconds: 300
optimal_tool_calls: 6
inject_date: false
workspace_files:
  - path: "utils.py"
    content: |
      def calculate_price(base, tax_rate, discount_pct):
          price = base * (1 + tax_rate)
          price = price * (1 - discount_pct)
          return round(price, 2)

      def format_currency(amount):
          return f"${amount:,.2f}"

      def validate_email(email):
          import re
          return bool(re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email))

      def slugify(text):
          import re
          text = text.lower().strip()
          text = re.sub(r'[^\w\s-]', '', text)
          text = re.sub(r'[\s_-]+', '-', text)
          return text
  - path: "orders.py"
    content: |
      from utils import calculate_price, format_currency

      class Order:
          def __init__(self, items, tax_rate=0.08):
              self.items = items
              self.tax_rate = tax_rate

          def total(self):
              total = 0
              for item in self.items:
                  total += calculate_price(item['price'], self.tax_rate, item.get('discount', 0))
              return total

          def summary(self):
              lines = []
              for item in self.items:
                  price = calculate_price(item['price'], self.tax_rate, item.get('discount', 0))
                  lines.append(f"{item['name']}: {format_currency(price)}")
              lines.append(f"Total: {format_currency(self.total())}")
              return '\n'.join(lines)
  - path: "users.py"
    content: |
      from utils import validate_email, slugify

      class User:
          def __init__(self, name, email):
              if not validate_email(email):
                  raise ValueError(f"Invalid email: {email}")
              self.name = name
              self.email = email
              self.slug = slugify(name)

          def profile_url(self):
              return f"/users/{self.slug}"

          def __repr__(self):
              return f"User({self.name}, {self.email})"
---

# Task: Multi-File Refactoring

## Prompt

Refactor the code across `utils.py`, `orders.py`, and `users.py`:

1. Split `utils.py` into two modules: `pricing.py` (calculate_price, format_currency) and `text.py` (validate_email, slugify)
2. Update all imports in `orders.py` and `users.py` to use the new modules
3. Delete the old `utils.py` (or rename to `utils.py.bak`)
4. Verify all imports are correct by checking the code

## Expected Behavior

The agent must:
- Create `pricing.py` with the pricing functions
- Create `text.py` with the text/validation functions
- Update `orders.py` to import from `pricing` instead of `utils`
- Update `users.py` to import from `text` instead of `utils`
- Remove or rename `utils.py`

This tests the ability to make coordinated changes across multiple files without breaking imports.

## Grading Criteria

- [ ] pricing.py created with calculate_price and format_currency
- [ ] text.py created with validate_email and slugify
- [ ] orders.py imports from pricing (not utils)
- [ ] users.py imports from text (not utils)
- [ ] utils.py removed or renamed
- [ ] All files have valid Python syntax

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import ast

    scores = {}
    workspace = Path(workspace_path)

    # Check pricing.py
    pricing = workspace / "pricing.py"
    if pricing.exists():
        content = pricing.read_text()
        try:
            ast.parse(content)
            has_calc = "def calculate_price" in content
            has_format = "def format_currency" in content
            scores["pricing_created"] = 1.0 if (has_calc and has_format) else 0.5
        except SyntaxError:
            scores["pricing_created"] = 0.0
    else:
        scores["pricing_created"] = 0.0

    # Check text.py
    text_mod = workspace / "text.py"
    if text_mod.exists():
        content = text_mod.read_text()
        try:
            ast.parse(content)
            has_email = "def validate_email" in content
            has_slug = "def slugify" in content
            scores["text_created"] = 1.0 if (has_email and has_slug) else 0.5
        except SyntaxError:
            scores["text_created"] = 0.0
    else:
        scores["text_created"] = 0.0

    # Check orders.py imports
    orders = workspace / "orders.py"
    if orders.exists():
        content = orders.read_text()
        try:
            ast.parse(content)
            imports_pricing = "from pricing" in content or "import pricing" in content
            no_utils = "from utils" not in content and "import utils" not in content
            scores["orders_updated"] = 1.0 if (imports_pricing and no_utils) else 0.0
        except SyntaxError:
            scores["orders_updated"] = 0.0
    else:
        scores["orders_updated"] = 0.0

    # Check users.py imports
    users = workspace / "users.py"
    if users.exists():
        content = users.read_text()
        try:
            ast.parse(content)
            imports_text = "from text" in content or "import text" in content
            no_utils = "from utils" not in content and "import utils" not in content
            scores["users_updated"] = 1.0 if (imports_text and no_utils) else 0.0
        except SyntaxError:
            scores["users_updated"] = 0.0
    else:
        scores["users_updated"] = 0.0

    # Check utils.py removed
    utils_gone = not (workspace / "utils.py").exists()
    utils_backed = (workspace / "utils.py.bak").exists()
    scores["utils_removed"] = 1.0 if (utils_gone or utils_backed) else 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 6
- **Rationale**: 3 reads + 2 creates (pricing.py, text.py) + 2 edits (orders.py, users.py) + 1 delete ≈ 6-8. Strong models may batch.
