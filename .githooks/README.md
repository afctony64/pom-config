# pom-config Repo Hooks

Repo-specific hooks live in `.githooks/`.
Enable them once:

```bash
chmod +x .githooks/post-merge
```

Global pre-commit hooks are managed separately via `core.hooksPath`.
