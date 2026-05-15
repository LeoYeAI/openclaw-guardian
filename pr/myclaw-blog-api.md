# MyClaw Blog Submission API

## Overview

This API allows authorized third-party partners to submit and manage blog content. Posts default to **draft**, and keys with the `posts:publish` scope can publish immediately by sending `"status": "published"`.

## Authentication

Every request must include an API key in the `X-API-Key` header.

```
X-API-Key: mck_blog_xxxx...
```

API keys are issued by the MyClaw admin team. Contact your account manager to obtain one.

---

## API Key Scopes

Each API key is granted a set of scopes that control which operations are allowed. If your key is missing the required scope, you will receive a `403 Forbidden` response with a message indicating which scope is needed.

| Scope | Description |
|---|---|
| `posts:write` | Create & update posts. Granted by default even when no scopes are listed. |
| `posts:delete` | Delete own posts. |
| `posts:publish` | Create or update posts directly as published. |
| `categories:write` | Create & update categories. |
| `categories:delete` | Delete categories (only if no posts use it). |

---

## Posts

### Submit a new post

```
POST https://myclaw.ai/api/blog/submit
Content-Type: application/json
```

Required scope: `posts:write` (default). Setting `status: "published"` also requires `posts:publish`.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | Post title (max 200 characters) |
| content | string | Yes | Post content in Markdown format (max 100KB) |
| locale | string | No | Language code: `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `es`, `fr`, `it`, `nl`, `pt-BR`, `ru`, `fi`, `sv` (default: `en`) |
| description | string | No | Meta description for SEO (max 500 characters) |
| status | string | No | `draft` or `published` (default: `draft`; `published` requires `posts:publish`) |
| slug | string | No | URL slug (auto-generated from title if omitted, max 100 characters) |
| cover_image_url | string | No | Cover image URL (must be `https://`) |
| keywords | string[] | No | SEO keywords (each max 50 characters) |
| tags | string[] | No | Post tags (each max 50 characters) |
| category | string | No | Category slug (e.g. `guides`) |
| external_author_name | string | No | Author byline (max 200 characters) |

#### Response

```json
{
  "code": 0,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "getting-started-with-clawdbot",
    "locale": "en",
    "status": "draft"
  },
  "msg": "ok"
}
```

Omit `status` to keep the default **draft** workflow. To publish immediately, send `"status": "published"` with a key that has the `posts:publish` scope.

#### Example

```bash
curl -X POST https://myclaw.ai/api/blog/submit \
  -H "X-API-Key: mck_blog_xxxx..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Clawdbot",
    "content": "# Introduction\n\nClawdbot is an AI assistant that...",
    "status": "published",
    "tags": ["tutorial", "getting-started"],
    "category": "guides",
    "external_author_name": "John Doe"
  }'
```

---

### Update a post

```
PUT https://myclaw.ai/api/blog/submit
Content-Type: application/json
```

Required scope: `posts:write` (default). Setting `status: "published"` also requires `posts:publish`. Any post identifiable by `id` or `slug`+`locale` can be updated (not limited to the key that originally submitted it).

#### Identifying the Post

Provide **one** of the following:
- `id` — The post UUID returned from the original submission
- `slug` — The URL slug (defaults to `locale: "en"` if not specified)
- `slug` + `locale` — The slug and locale for non-English posts

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | Conditional | Post UUID (required if not using slug) |
| slug | string | Conditional | URL slug (required if not using id). When used with id, will update the slug. |
| locale | string | No | Language code (defaults to `en`). When used with id, will update the locale. |
| status | string | No | `draft` or `published`. Use `published` to publish immediately or keep a live post published after edits. |
| title | string | No | Updated title (max 200 characters) |
| content | string | No | Updated content in Markdown (max 100KB) |
| description | string | No | Updated meta description (max 500 characters) |
| cover_image_url | string | No | Updated cover image URL (must be `https://`) |
| keywords | string[] | No | Updated SEO keywords |
| tags | string[] | No | Updated tags |
| category | string | No | Updated category slug |
| external_author_name | string | No | Updated author byline |

At least one updatable field (besides identifiers) must be provided.

**Note:** If the post is currently **published** or **scheduled**, updating it without `"status": "published"` automatically reverts status to **draft**. To keep it live after edits, send `"status": "published"` with a key that has `posts:publish`.

#### Example

```bash
curl -X PUT https://myclaw.ai/api/blog/submit \
  -H "X-API-Key: mck_blog_xxxx..." \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated: Getting Started with Clawdbot",
    "content": "# Introduction\n\nThis is the updated content...",
    "status": "published"
  }'
```

---

### Read the latest saved version of a post

```
GET https://myclaw.ai/api/blog/post?id={id}
GET https://myclaw.ai/api/blog/post?slug={slug}&locale={locale}
```

Required scope: `posts:write` (default). Any post identifiable by `id` or `slug`+`locale` can be read (same visibility rule as updates).

This returns the latest saved source content from the blog backend, including **draft** and **published** posts. The `content` field is returned as raw Markdown so it can be used for downstream editing or translation workflows.

#### Query Parameters

Provide **one** of the following:
- `id` — The post UUID returned from the original submission
- `slug` — The URL slug (defaults to `locale=en` if omitted)
- `slug` + `locale` — The slug and locale for non-English posts

#### Response

```json
{
  "code": 0,
  "data": {
    "post": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "getting-started-with-clawdbot",
      "locale": "en",
      "title": "Getting Started with Clawdbot",
      "description": "Latest reviewed draft",
      "content": "# Introduction\n\nThis is the latest markdown source...",
      "status": "draft",
      "updated_at": "2026-03-15T09:30:00.000Z"
    }
  },
  "msg": "ok"
}
```

#### Example

```bash
curl "https://myclaw.ai/api/blog/post?slug=getting-started-with-clawdbot&locale=en" \
  -H "X-API-Key: mck_blog_xxxx..."
```

---

## Categories

### List all categories

```
GET https://myclaw.ai/api/blog/categories
```

Public — no API key required. Returns all categories ordered by `sort_order`.

#### Response

```json
{
  "code": 0,
  "data": [
    { "id": "uuid", "name": "Guides", "slug": "guides", "description": null, "sort_order": 0, "created_at": "..." }
  ],
  "msg": "ok"
}
```

---

### Create a category

```
POST https://myclaw.ai/api/blog/categories
Content-Type: application/json
```

Required scope: `categories:write`

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Category display name (max 100 characters) |
| slug | string | No | URL slug (auto-generated from name if omitted) |
| description | string | No | Category description |
| sort_order | number | No | Display order (default: 0) |

#### Example

```bash
curl -X POST https://myclaw.ai/api/blog/categories \
  -H "X-API-Key: mck_blog_xxxx..." \
  -H "Content-Type: application/json" \
  -d '{ "name": "Case Studies", "slug": "case-studies" }'
```

---

### Update a category

```
PATCH https://myclaw.ai/api/blog/categories/{id}
Content-Type: application/json
```

Required scope: `categories:write`

Accepted fields: `name`, `slug`, `description`, `sort_order` (all optional, provide only what you want to change).

---

### Delete a category

```
DELETE https://myclaw.ai/api/blog/categories/{id}
```

Required scope: `categories:delete`

Returns `400` if any posts are still using this category.

---

## Error Codes

| HTTP Status | Code | Description |
|---|---|---|
| 401 | 40100 | Invalid or disabled API key |
| 403 | 40300 | API key missing required scope |
| 404 | 40400 | Resource not found |
| 429 | 42900 | Rate limit exceeded |
| 400 | 40000 | Validation error (see `msg` for details) |
| 500 | 50000 | Internal server error |

---

## Notes

- Posts default to **draft**. Keys with `posts:publish` can publish immediately by sending `"status": "published"`.
- Updating a published post without `"status": "published"` reverts it to **draft**.
- Content must be in **Markdown** format. Raw HTML is not recommended.
- If the provided slug is already taken, a numeric suffix (`-2`, `-3`, etc.) is appended automatically.
- Rate limits are configured per API key. Contact the admin team if you need a higher limit.
- Read/update via API key are not restricted to posts originally submitted with that key; protect keys accordingly.
