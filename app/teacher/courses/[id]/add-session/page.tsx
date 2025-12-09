"use client";

import { use, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddSessionPage({ params }) {
  const { id } = use(params); // ← แก้ตรงนี้! ใช้ use() เพื่อ unwrap params
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [loading, setLoading] = useState(false);

  const addSession = async () => {
    setLoading(true);

    // หา session ล่าสุด → สร้าง session_number ถัดไป
    const { data: last } = await supabase
      .from("sessions")
      .select("session_number")
      .eq("course_id", id)
      .order("session_number", { ascending: false })
      .limit(1);

    const newNumber = last?.[0]?.session_number + 1 || 1;

    // token สำหรับนักเรียน
    const token = crypto.randomUUID();

    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          course_id: id,
          session_number: newNumber,
          title,
          session_date: sessionDate,
          session_token: token,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Redirect ไปหน้า attendance ของ session
    router.push(`/teacher/courses/${id}/attendance/${data.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Session for Course {id}</h1>

      <label className="block mb-2 font-medium">Session Title</label>
      <input
        className="border p-2 w-full mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Lecture 1: Introduction"
      />

      <label className="block mb-2 font-medium">Session Date</label>
      <input
        type="date"
        className="border p-2 w-full mb-4"
        value={sessionDate}
        onChange={(e) => setSessionDate(e.target.value)}
      />

      <button
        onClick={addSession}
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
      >
        {loading ? "Creating..." : "Create Session"}
      </button>
    </div>
  );
}
