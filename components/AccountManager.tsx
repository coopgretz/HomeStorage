'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface Props {
  user: User
}

export default function AccountManager({ user }: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  // Email update state
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Password reset state
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Account deletion state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error

      setEmailMessage({
        type: 'success',
        text: 'Check your new email address for a confirmation link!'
      })
      setNewEmail('')
    } catch (error: any) {
      setEmailMessage({
        type: 'error',
        text: error.message || 'Failed to update email'
      })
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setResetLoading(true)
    setResetMessage(null)

    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${baseUrl}/auth/callback?redirectTo=/auth/reset-password`,
      })

      if (error) throw error

      setResetMessage({
        type: 'success',
        text: 'Password reset email sent! Check your inbox.'
      })
    } catch (error: any) {
      setResetMessage({
        type: 'error',
        text: error.message || 'Failed to send password reset email'
      })
    } finally {
      setResetLoading(false)
    }
  }

  const handleAccountDeletion = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteMessage({
        type: 'error',
        text: 'Please type "DELETE" to confirm account deletion'
      })
      return
    }

    setDeleteLoading(true)
    setDeleteMessage(null)

    try {
      // Call our API to delete user data and account
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      // Sign out the user
      await supabase.auth.signOut()
      
      // Redirect to home page
      router.push('/')
      router.refresh()
    } catch (error: any) {
      setDeleteMessage({
        type: 'error',
        text: error.message || 'Failed to delete account'
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Account Info */}
      <div className="card">
        <div className="flex items-center mb-6">
          <UserIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Email
            </label>
            <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
              {user.email}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Created
            </label>
            <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Email Update */}
      <div className="card">
        <div className="flex items-center mb-6">
          <EnvelopeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update Email Address</h2>
        </div>

        {emailMessage && (
          <div className={`mb-4 p-4 rounded-md ${
            emailMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            <div className="flex items-center">
              {emailMessage.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              {emailMessage.text}
            </div>
          </div>
        )}

        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Email Address
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="input-field"
              placeholder="Enter new email address"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={emailLoading || !newEmail}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {emailLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Password Reset */}
      <div className="card">
        <div className="flex items-center mb-6">
          <KeyIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reset Password</h2>
        </div>

        {resetMessage && (
          <div className={`mb-4 p-4 rounded-md ${
            resetMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            <div className="flex items-center">
              {resetMessage.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              {resetMessage.text}
            </div>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Click the button below to receive a password reset email. You'll be able to set a new password after clicking the link in the email.
        </p>

        <button
          onClick={handlePasswordReset}
          disabled={resetLoading}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resetLoading ? 'Sending...' : 'Send Password Reset Email'}
        </button>
      </div>

      {/* Account Deletion */}
      <div className="card border-red-200 dark:border-red-800">
        <div className="flex items-center mb-6">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-300">Delete Account</h2>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                Warning: This action cannot be undone
              </h3>
              <div className="text-sm text-red-700 dark:text-red-400">
                <p className="mb-2">Deleting your account will permanently remove:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All your storage boxes and items</li>
                  <li>All uploaded images</li>
                  <li>All categories and data</li>
                  <li>Your account and login credentials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {deleteMessage && (
          <div className={`mb-4 p-4 rounded-md ${
            deleteMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            <div className="flex items-center">
              {deleteMessage.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              {deleteMessage.text}
            </div>
          </div>
        )}

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type "DELETE" to confirm account deletion:
              </label>
              <input
                id="deleteConfirm"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input-field"
                placeholder="Type DELETE here"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAccountDeletion}
                disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirm('')
                  setDeleteMessage(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 