'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteMemeButtonProps {
  memeId: string
  onDelete: () => Promise<void>
}

export default function DeleteMemeButton({ memeId, onDelete }: DeleteMemeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete()
      router.push('/memes')
      router.refresh()
    } catch (error) {
      console.error('Error deleting meme:', error)
      alert('Failed to delete meme. Please try again.')
      setDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn bg-red-600 text-white hover:bg-red-700 text-sm"
        >
          {deleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={deleting}
          className="btn btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn bg-red-600 text-white hover:bg-red-700 text-sm"
    >
      Delete Meme
    </button>
  )
}

