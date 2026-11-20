# FlightFix — Defect Log

| Defect ID | Description | Severity | Module | Status | Resolution |
|---|---|---|---|---|---|
| `DEF-001` | PowerShell 5.1 failed on `&&` command chaining during initial setup | Low | DevOps / CLI | **Resolved** | Used `;` statement separator in PowerShell commands |
| `DEF-002` | Sandbox `WinError 10013` prevents binding `127.0.0.1:8000` inside agent sandbox | Low | Environment | **Documented** | Verified APIs via `pytest-django` `APIClient`; user can run `python manage.py runserver` locally |
| `DEF-003` | Django 5.1 deprecation warning for `STATICFILES_STORAGE` in `settings.py` | Low | Backend Config | **Open (Non-blocking)** | Safe on Django 4.2 LTS; can migrate to `STORAGES` dict when upgrading to Django 5.x |
