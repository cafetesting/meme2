#!/usr/bin/env node

/**
 * Script to delete users from local Supabase instance
 * This is a workaround for the Studio UI bug that prevents user deletion
 * 
 * Usage: node scripts/delete-user.js <user-id>
 * Example: node scripts/delete-user.js 123e4567-e89b-12d3-a456-426614174000
 */

const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')

// Get Supabase URL and service role key
let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// If service role key is not set, try to get it from supabase status
if (!SUPABASE_SERVICE_ROLE_KEY) {
	try {
		const statusOutput = execSync('supabase status', { encoding: 'utf-8', cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })
		// Match the secret key from the status output (handles box-drawing characters)
		const secretMatch = statusOutput.match(/Secret\s+[││]\s+(sb_secret_[^\s\n]+)/) || 
		                    statusOutput.match(/Secret\s+[││]\s+([^\s\n]+)/) ||
		                    statusOutput.match(/\│\s+Secret\s+\│\s+(sb_secret_[^\s\n]+)/) ||
		                    statusOutput.match(/sb_secret_[A-Za-z0-9_-]+/)
		if (secretMatch) {
			SUPABASE_SERVICE_ROLE_KEY = secretMatch[1] || secretMatch[0]
			console.log('ℹ️  Using service role key from supabase status')
		} else {
			throw new Error('Could not parse service role key from supabase status')
		}
	} catch (error) {
		console.error('⚠️  Warning: Could not get service role key from supabase status')
		console.error('   Please set SUPABASE_SERVICE_ROLE_KEY environment variable')
		console.error('   or run: supabase status to get the key\n')
		process.exit(1)
	}
}

async function deleteUser(userId) {
	if (!userId) {
		console.error('❌ Error: User ID is required')
		console.log('\nUsage: node scripts/delete-user.js <user-id>')
		console.log('Example: node scripts/delete-user.js 123e4567-e89b-12d3-a456-426614174000')
		process.exit(1)
	}

	try {
		// Create admin client with service role key
		const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		})

		console.log(`🔍 Attempting to delete user: ${userId}`)
		
		// First, delete the profile (this will cascade delete memes and meme_texts)
		console.log('  → Deleting profile and related data...')
		const { error: profileError } = await supabase
			.from('profiles')
			.delete()
			.eq('id', userId)

		if (profileError && profileError.code !== 'PGRST116') {
			// PGRST116 means no rows found, which is fine
			console.warn('⚠️  Warning deleting profile:', profileError.message)
		} else {
			console.log('  ✓ Profile and related data deleted')
		}
		
		// Then delete the auth user
		console.log('  → Deleting auth user...')
		const { data, error } = await supabase.auth.admin.deleteUser(userId)

		if (error) {
			console.error('❌ Error deleting user:', error.message)
			process.exit(1)
		}

		console.log('✅ User deleted successfully!')
		if (data) {
			console.log('Deleted user data:', JSON.stringify(data, null, 2))
		}
	} catch (error) {
		console.error('❌ Unexpected error:', error.message)
		process.exit(1)
	}
}

// Get user ID from command line arguments
const userId = process.argv[2]
deleteUser(userId)

