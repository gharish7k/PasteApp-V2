
const API_URL = "https://paste-app-backend-v2.vercel.app/api/pastes";

// Fetch all pastes
export const getPastes = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch pastes");
  }

  return response.json();
};

// Create a paste
export const createPaste = async (paste) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paste),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Failed to create paste"
    );
  }

  return data;
};

// Update an existing paste
export const updatePaste = async (pasteId, paste) => {
  const response = await fetch(`${API_URL}/${pasteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paste),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Failed to update paste"
    );
  }

  return data;
};



export const getPasteById = async (pasteId) => {
  const response = await fetch(`${API_URL}/${pasteId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Failed to fetch paste"
    );
  }

  return data;
};
