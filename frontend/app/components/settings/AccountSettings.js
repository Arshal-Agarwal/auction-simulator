"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Save, Pencil, UserCircle } from "lucide-react";

function FieldRow({ label, field, value, isEditing, onEdit, onChange, onSave, isTextarea }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow flex flex-col gap-2 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {!isEditing && (
          <button onClick={onEdit} className="text-indigo-500 hover:text-indigo-600 transition">
            <Pencil size={18} />
          </button>
        )}
      </div>

      {isEditing ? (
        <>
          {isTextarea ? (
            <textarea
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
          <div className="mt-2 flex justify-end">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </>
      ) : (
        <div className="text-gray-800 dark:text-gray-100">{value || "—"}</div>
      )}
    </div>
  );
}

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const fetchUserDetails = async () => {
    const res = await fetch("http://localhost:4000/users/crud/fetchUserDetails", {
      credentials: "include",
    });
    const data = await res.json();
    setUser(data.user);
    setFormData({
      username: data.user.username,
      email: data.user.email,
      bio: data.user.bio,
    });
  };
  useEffect(() => {

    fetchUserDetails();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    const toastId = toast.loading(`Updating ${field}...`);
    try {
      const payload = { [field]: formData[field] };

      const res = await fetch("http://localhost:4000/users/crud/updateUserDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMsg = data.error || `Failed to update ${field}`;
        if (errorMsg.includes("username")) {
          errorMsg = "❌ Username already exists. Please choose another.";
        } else if (errorMsg.includes("email")) {
          errorMsg = "❌ Email already in use.";
        }
        toast.error(errorMsg, { id: toastId });
      } else {
        toast.success(`✅ ${field.charAt(0).toUpperCase() + field.slice(1)} updated!`, { id: toastId });
        setEditField(null);
      }
    } catch (err) {
      console.error("Error during update:", err);
      toast.error("❌ Network or server error.", { id: toastId });
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return toast.error("No file selected");

    // Optional: check file size (e.g. limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return toast.error("❌ File too large (max 5MB)");
    }

    const formData = new FormData();
    formData.append("image", file); // 👈 Match this field name exactly

    const toastId = toast.loading("Uploading profile picture...");

    try {
      const res = await fetch("http://localhost:5001/crud/uploadProfilePicture", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Profile picture updated!", { id: toastId });
        await fetchUserDetails();
        // Optionally reload user data or force re-render
      } else {
        const errorMsg = data?.error || "Upload failed";
        toast.error(`❌ ${errorMsg}`, { id: toastId });
      }
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error("❌ Upload failed", { id: toastId });
    }
  };




  if (!user) {
    return <p className="text-gray-500 dark:text-gray-400">Loading account info...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Account Settings</h2>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="User profile"
              className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-md object-cover"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-indigo-500 shadow-md bg-gray-100 dark:bg-gray-700">
              <UserCircle className="text-gray-500 dark:text-gray-300" size={48} />
            </div>
          )}

          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow group-hover:opacity-100 opacity-0 transition"
            title="Change profile picture"
            disabled={uploading}
          >
            <Pencil size={16} />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleProfilePicChange}
            className="hidden"
          />
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          Joined: {new Date(user.created_at).toLocaleDateString()}
        </div>
      </div>

      <FieldRow
        label="Username"
        field="username"
        value={formData.username}
        isEditing={editField === "username"}
        onEdit={() => setEditField("username")}
        onChange={handleChange}
        onSave={() => handleSave("username")}
      />

      <FieldRow
        label="Email"
        field="email"
        value={formData.email}
        isEditing={editField === "email"}
        onEdit={() => setEditField("email")}
        onChange={handleChange}
        onSave={() => handleSave("email")}
      />

      <FieldRow
        label="Bio"
        field="bio"
        value={formData.bio}
        isEditing={editField === "bio"}
        onEdit={() => setEditField("bio")}
        onChange={handleChange}
        onSave={() => handleSave("bio")}
        isTextarea
      />
    </div>
  );
}
