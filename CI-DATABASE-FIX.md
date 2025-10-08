# Database Authentication Fix for CI

## Issue Fixed
The CI was failing with `password authentication failed for user "db_user_name"` because the database credentials in the CI workflow didn't match the application's expected credentials.

## Changes Made

### 1. PostgreSQL Service Credentials
**Before:**
```yaml
POSTGRES_DB: test_db
POSTGRES_USER: test_user  
POSTGRES_PASSWORD: test_pass
```

**After:**
```yaml
POSTGRES_DB: be-template
POSTGRES_USER: db_user_name
POSTGRES_PASSWORD: db_password@123
```

### 2. Database Setup Command
**Before:**
```bash
PGPASSWORD=test_pass psql -h localhost -U test_user -d test_db -f docker/test-data.sql
```

**After:**
```bash
PGPASSWORD=db_password@123 psql -h localhost -U db_user_name -d be-template -f docker/test-data.sql
```

### 3. Application Environment Variables
**Before:**
```yaml
DB_NAME: test_db
DB_USER: test_user
DB_PASSWORD: test_pass
```

**After:**
```yaml
DB_NAME: be-template
DB_USER: db_user_name
DB_PASSWORD: db_password@123
```

## Credentials Alignment

The credentials now match what's defined in:
- `config/default.yaml`
- `config/test.yaml`
- `docker/docker-compose.local.yml`

## Expected Result

The application should now start successfully in CI without database authentication errors.

## Test the Fix

Run the CI workflow or test locally with:
```bash
# Test database connection
PGPASSWORD=db_password@123 psql -h localhost -U db_user_name -d be-template -c "SELECT 1;"

# Start the application
NODE_ENV=test npm run start:prod
```