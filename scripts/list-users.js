#!/usr/bin/env node

/**
 * Script to list all users from local Supabase instance
 * 
 * Usage: node scripts/list-users.js
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

async function listUsers() {
	try {
		// Create admin client with service role key
		const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		})

		console.log('🔍 Fetching users...\n')
		
		// List users using admin API
		const { data, error } = await supabase.auth.admin.listUsers()

		if (error) {
			console.error('❌ Error fetching users:', error.message)
			process.exit(1)
		}

		if (!data || data.users.length === 0) {
			console.log('📭 No users found')
			return
		}

		console.log(`📋 Found ${data.users.length} user(s):\n`)
		console.log('─'.repeat(80))
		
		data.users.forEach((user, index) => {
			console.log(`\n${index + 1}. User ID: ${user.id}`)
			console.log(`   Email: ${user.email || 'N/A'}`)
			console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
			console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`)
			if (user.user_metadata) {
				console.log(`   Metadata: ${JSON.stringify(user.user_metadata)}`)
			}
		})
		
		console.log('\n' + '─'.repeat(80))
		console.log('\n💡 To delete a user, run:')
		console.log('   node scripts/delete-user.js <user-id>')
		console.log('   or')
		console.log('   npm run delete-user <user-id>\n')
	} catch (error) {
		console.error('❌ Unexpected error:', error.message)
		process.exit(1)
	}
}

listUsers()

