# Permanent Environment Variables Setup

This document records the setup of permanent environment variables for the Meme Generator project.

## What Are Permanent Environment Variables?

Permanent environment variables are stored in your shell configuration file (`~/.zshrc` for zsh on macOS) and are automatically loaded every time you open a new terminal session. Unlike temporary variables (set with `export`), they persist across:
- Terminal sessions
- System reboots
- New terminal windows

## Why We Use Them

For the Meme Generator project, we use permanent environment variables to store:
- Google OAuth Client ID
- Google OAuth Client Secret

This ensures that Supabase can always access these credentials, regardless of which terminal session you use.

## Setup Date

**Setup Date:** [Fill in when you run the setup]

## Variables Configured

The following environment variables have been added to `~/.zshrc`:

```bash
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-client-id-here"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="your-client-secret-here"
```

## How to Set Up

### Option 1: Using the Setup Script (Recommended)

```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
./setup-permanent-env.sh
```

The script will:
1. Check if variables already exist
2. Prompt for your Google OAuth credentials
3. Add them to `~/.zshrc`
4. Reload your shell configuration

### Option 2: Manual Setup

1. Open your shell configuration file:
   ```bash
   nano ~/.zshrc
   # or
   code ~/.zshrc
   ```

2. Add these lines at the end:
   ```bash
   # Google OAuth for Supabase (Meme Generator)
   export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-client-id"
   export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="your-client-secret"
   ```

3. Save and reload:
   ```bash
   source ~/.zshrc
   ```

## How to Verify

Check if variables are set:
```bash
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET
```

Check if they're in your config file:
```bash
grep SUPABASE_AUTH_EXTERNAL_GOOGLE ~/.zshrc
```

## How to Update

If you need to change the values:

1. **Using the script:**
   ```bash
   ./setup-permanent-env.sh
   ```
   It will detect existing values and offer to update them.

2. **Manually:**
   - Edit `~/.zshrc`
   - Find the lines with `SUPABASE_AUTH_EXTERNAL_GOOGLE`
   - Update the values
   - Run `source ~/.zshrc`

## How to Remove

To remove permanent environment variables:

1. Open `~/.zshrc`:
   ```bash
   nano ~/.zshrc
   ```

2. Find and delete these lines:
   ```bash
   export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="..."
   export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="..."
   ```

3. Save and reload:
   ```bash
   source ~/.zshrc
   ```

Or use sed:
```bash
sed -i.bak '/SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID/d' ~/.zshrc
sed -i.bak '/SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET/d' ~/.zshrc
source ~/.zshrc
```

## File Location

- **Shell Config File:** `~/.zshrc` (or `~/.bashrc` for bash)
- **Full Path:** `/Users/user/.zshrc`

## Important Notes

1. **Security:** Never commit these credentials to git. They're stored locally in your home directory.

2. **Current Session:** After adding to `~/.zshrc`, run `source ~/.zshrc` to load them in your current terminal.

3. **New Terminals:** New terminal windows automatically load variables from `~/.zshrc`.

4. **Supabase:** Supabase CLI reads environment variables from your shell, so permanent variables ensure Supabase always has access.

5. **Different Shells:** If you use bash instead of zsh, add to `~/.bashrc` or `~/.bash_profile` instead.

## Troubleshooting

### Variables not loading?
- Make sure you ran `source ~/.zshrc` after adding them
- Check the file exists: `ls -la ~/.zshrc`
- Verify syntax: `cat ~/.zshrc | grep SUPABASE`

### Supabase can't see variables?
- Restart Supabase: `supabase stop && supabase start`
- Check Supabase status: `supabase status`
- Verify variables are set: `env | grep SUPABASE`

### Wrong shell?
- Check your shell: `echo $SHELL`
- If bash, use `~/.bashrc` instead of `~/.zshrc`

## Related Files

- `setup-permanent-env.sh` - Automated setup script
- `setup-google-oauth.sh` - Original OAuth setup script (temporary variables)
- `GOOGLE_OAUTH_SETUP.md` - Complete OAuth setup guide
- `supabase/config.toml` - Supabase configuration file

## History

- **2024-12-XX**: Initial permanent environment variables setup
  - Added Google OAuth credentials to `~/.zshrc`
  - Created setup script for easy configuration

