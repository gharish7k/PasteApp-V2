import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { setPastes, removeFromPastes } from '../redux/pasteSlice'
import {
  Pencil,
  Trash2,
  Eye,
  Copy,
  Share2,
  CalendarDays,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPastes } from '../api/pasteApi'


const Paste = () => {

  const pastes = useSelector(
    (state) => state.paste.pastes
  )

  const [searchTerm, setSearchTerm] = useState("")

  const dispatch = useDispatch()

  useEffect(() => {

    getPastes()
      .then((data) => {
        console.log("Pastes page received:", data)

        dispatch(setPastes(data))
      })
      .catch((error) => {
        console.error("Failed to fetch pastes:", error)
        toast.error("Failed to load pastes")
      })

  }, [dispatch])

  const filteredData = pastes.filter((paste) =>
    paste.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  
  
  async function handleDelete(pasteId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/pastes/${pasteId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to delete paste"
        );
      }

      // Reload the authoritative database state
      const updatedPastes = await getPastes();

      dispatch(setPastes(updatedPastes));

      toast.success("Paste deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete paste");
    }
  }



  function handleCopy(content) {

    navigator.clipboard.writeText(content)

    toast.success("Copied to Clipboard")
  }

  async function handleShare(paste) {

    const shareData = {
      title: paste.title,
      text: paste.content,
      url: `${window.location.origin}/pastes/${paste._id}`
    }

    try {

      if (navigator.share) {

        await navigator.share(shareData)

      } else {

        await navigator.clipboard.writeText(
          shareData.url
        )

        toast.success("Paste link copied!")

      }

    } catch (error) {

      if (error.name !== "AbortError") {
        toast.error("Unable to share paste")
      }

    }
  }

  return (
    <div className="mx-auto w-full max-w-[1126px] px-6 py-8">

      {/* Search */}

      <div className="relative">

        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="search"
          placeholder="Search paste here..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <X size={18} />
          </button>
        )}

      </div>


      {/* Main container */}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-300 bg-white">

        <div className="border-b border-gray-300 px-4 py-4">

          <h1 className="text-left text-3xl font-bold text-black">
            All Pastes
          </h1>

        </div>


        {/* Pastes */}

        <div className="flex flex-col gap-4 p-4">

          {filteredData.length > 0 ? (

            filteredData.map((paste) => (

              <div
                key={paste._id}
                className="rounded-lg border border-gray-300 p-4 transition hover:shadow-md"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  {/* Paste information */}

                  <div className="min-w-0 flex-1">

                    <h2 className="break-words text-2xl font-bold text-black">
                      {paste.title}
                    </h2>

                    <p className="mt-2 break-words text-gray-600">
                      {paste.content}
                    </p>

                  </div>


                  {/* Actions */}

                  <div className="flex flex-wrap gap-2">

                    {/* Edit */}

                    <Link
                      to={`/?pasteId=${paste._id}`}
                      title="Edit"
                      className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100"
                    >
                      <Pencil size={19} />
                    </Link>


                    {/* Delete */}

                    <button
                      onClick={() =>
                        handleDelete(paste._id)
                      }
                      title="Delete"
                      className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={19} />
                    </button>


                    {/* View */}

                    <Link
                      to={`/pastes/${paste._id}`}
                      title="View"
                      className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100"
                    >
                      <Eye size={19} />
                    </Link>


                    {/* Copy */}

                    <button
                      onClick={() =>
                        handleCopy(paste.content)
                      }
                      title="Copy"
                      className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100"
                    >
                      <Copy size={19} />
                    </button>


                    {/* Share */}

                    <button
                      onClick={() =>
                        handleShare(paste)
                      }
                      title="Share"
                      className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100"
                    >
                      <Share2 size={19} />
                    </button>

                  </div>

                </div>


                {/* Date */}

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">

                  <CalendarDays size={17} />

                  {new Date(
                    paste.createdAt
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}

                </div>

              </div>

            ))

          ) : (

            <div className="py-10 text-center text-xl text-gray-600">
              No Data Found
            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default Paste