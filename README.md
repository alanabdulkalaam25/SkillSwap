# SkillSwap - College student's skill exchange platform

## Run locally

1. Install dependencies with `pnpm install`.
2. Start the bundled PostgreSQL instance with `pnpm db:start` (configured for port 5432).
3. Apply the Prisma schema with `pnpm --filter skillswap-backend prisma:push`.
4. Load the catalog and 16 mock student profiles with `pnpm --filter skillswap-backend seed`.
5. Start the API and web app with `pnpm dev`, then visit `http://localhost:5173`.

Seeded student accounts use the demo password `Password123!`.

Admin accounts are provisioned explicitly, not through student registration. In PowerShell, set the four values below (the password prompt is not committed to the repo), then run the provisioner:

```powershell
$env:ADMIN_NAME = "College Admin"
$env:ADMIN_EMAIL = "admin@college.edu"
$env:ADMIN_PASSWORD = Read-Host "Admin password (12+ characters)"
$env:ADMIN_ROLL_NUMBER = "ADMIN-001"
pnpm --filter skillswap-backend seed:admin
```

The provisioner checks the institutional email domain, hashes the password, and refuses to overwrite an existing account.
