# User Management Scripts

These scripts provide a workaround for the known Supabase Studio UI bug that prevents user deletion in local development environments.

## Prerequisites

- Supabase CLI installed and local instance running (`supabase start`)
- Node.js installed

## Available Scripts

### List Users

List all users in your local Supabase instance:

```bash
npm run list-users
# or
node scripts/list-users.js
```

This will display:
- User ID
- Email address
- Creation date
- Last sign-in date
- User metadata

### Delete User

Delete a specific user by their ID:

```bash
npm run delete-user <user-id>
# or
node scripts/delete-user.js <user-id>
```

**Example:**
```bash
npm run delete-user 123e4567-e89b-12d3-a456-426614174000
```

## How It Works

These scripts use the Supabase Admin API with the service role key to perform user management operations. The service role key is automatically retrieved from `supabase status` if not set as an environment variable.

## Environment Variables (Optional)

You can set these environment variables if you prefer:

- `NEXT_PUBLIC_SUPABASE_URL` - Defaults to `http://localhost:54321`
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically retrieved from `supabase status` if not set

## Troubleshooting

If you encounter errors:

1. **Make sure Supabase is running:**
   ```bash
   supabase status
   ```

2. **Check the service role key:**
   ```bash
   supabase status | grep Secret
   ```

3. **Verify the user ID exists:**
   ```bash
   npm run list-users
   ```

## Known Issues

This is a workaround for a known bug in Supabase Studio UI. The Supabase team is working on a fix. You can track the issue here:
- GitHub Issue: https://github.com/supabase/supabase/issues/32901

