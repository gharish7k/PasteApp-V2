import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { setPastes } from '../redux/pasteSlice'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getPastes,
  createPaste as createPasteAPI,
  updatePaste as updatePasteAPI,
} from '../api/pasteApi'

const Home = () => {

  const [title, setTitle] = useState("")
  const [value, setValue] = useState("")

  const [searchParams, setSearchParams] = useSearchParams()

  const pasteId = searchParams.get("pasteId")

  const dispatch = useDispatch()

  const allPastes = useSelector((state) => state.paste.pastes)

  useEffect(() => {
    async function loadPastes() {
      try {
        const data = await getPastes();

        dispatch(setPastes(data));
        console.log("Pastes loaded from backend:", data);
      } catch (error) {
        console.error("Failed to fetch pastes:", error);
        toast.error("Failed to load pastes");
      }
    }

    loadPastes();
  }, [dispatch]);

  useEffect(() => {

    if (pasteId) {

      const paste = allPastes.find(
        (p) => p._id === pasteId
      )

      if (paste) {
        setTitle(paste.title)
        setValue(paste.content)
      }

    }

  }, [pasteId, allPastes])

  
  async function createPaste() {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!value.trim()) {
      toast.error("Please enter some content");
      return;
    }

    const pasteData = {
      title: title.trim(),
      content: value.trim(),
    };

    try {
      if (pasteId) {
        // Update the existing paste in MongoDB
        await updatePasteAPI(pasteId, pasteData);

        toast.success("Paste updated successfully!");
      } else {
        // Prevent duplicates using the currently loaded pastes
        const duplicate = allPastes.some(
          (item) =>
            item.title.trim().toLowerCase() ===
              pasteData.title.toLowerCase() &&
            item.content.trim() === pasteData.content
        );

        if (duplicate) {
          toast.error("Same paste already exists!");
          return;
        }

        // Create a new paste in MongoDB
        await createPasteAPI(pasteData);

        toast.success("Paste created successfully!");
      }

      // Refresh Redux with the latest database records
      const updatedPastes = await getPastes();
      dispatch(setPastes(updatedPastes));

      setTitle("");
      setValue("");
      setSearchParams({});
    } catch (error) {
      console.error("Save paste error:", error);
      toast.error(error.message || "Failed to save paste");
    }
  }


  function copyContent() {

    if (!value) {
      toast.error("Nothing to copy")
      return
    }

    navigator.clipboard.writeText(value)

    toast.success("Copied to Clipboard")
  }

  return (
    <div className="mx-auto w-full max-w-[1126px] px-6 py-8">

      {/* Title + Button */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <input
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-[75%]"
          type="text"
          placeholder="Enter title here..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          onClick={createPaste}
        >
          {pasteId ? "Update My Paste" : "Create My Paste"}
        </button>

      </div>


      {/* Editor */}

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">

        {/* Browser-like header */}

        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">

          <div className="flex gap-2">

            <span className="h-3 w-3 rounded-full bg-red-500"></span>

            <span className="h-3 w-3 rounded-full bg-yellow-400"></span>

            <span className="h-3 w-3 rounded-full bg-green-500"></span>

          </div>

          <button
            onClick={copyContent}
            className="rounded-md p-1 text-gray-600 transition hover:bg-gray-100 hover:text-black"
            title="Copy content"
          >
            <Copy size={20} />
          </button>

        </div>

        <textarea
          className="min-h-[480px] w-full resize-y p-4 text-gray-800 outline-none"
          value={value}
          placeholder="Write Your Content Here...."
          onChange={(e) => setValue(e.target.value)}
        />

      </div>

    </div>
  )
}

export default Home