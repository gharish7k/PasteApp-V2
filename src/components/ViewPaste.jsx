
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Copy, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPasteById } from '../api/pasteApi'

const ViewPaste = () => {
  const { id } = useParams()

  const [paste, setPaste] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadPaste() {
      setLoading(true)
      setError("")
      setPaste(null)

      try {
        const data = await getPasteById(id)

        // Supports either a direct paste or a wrapped response.
        const fetchedPaste = data.paste ?? data.data ?? data

        if (!fetchedPaste?._id) {
          throw new Error("Paste not found")
        }

        if (!cancelled) {
          setPaste(fetchedPaste)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load paste")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPaste()

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleCopy() {
    if (!paste) return

    try {
      await navigator.clipboard.writeText(paste.content)
      toast.success("Copied to Clipboard")
    } catch {
      toast.error("Unable to copy content")
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1126px] px-6 py-20 text-center">
        <p className="text-xl text-gray-600">Loading paste...</p>
      </div>
    )
  }

  if (error || !paste) {
    return (
      <div className="mx-auto max-w-[1126px] px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">
          Paste Not Found
        </h1>

        <p className="mt-3 text-gray-600">
          {error || "This paste could not be found."}
        </p>

        <Link
          to="/pastes"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          <ArrowLeft size={18} />
          Back to Pastes
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1126px] px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 outline-none sm:w-[75%]"
          type="text"
          value={paste.title}
          readOnly
        />

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <Copy size={18} />
          Copy
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>

          <button
            onClick={handleCopy}
            className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
            title="Copy content"
          >
            <Copy size={20} />
          </button>
        </div>

        <textarea
          className="min-h-[480px] w-full resize-y p-4 text-gray-800 outline-none"
          value={paste.content}
          readOnly
        />
      </div>
    </div>
  )
}

export default ViewPaste