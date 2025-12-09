"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StudentSessionAttendance() {
  const { id, sessionId } = useParams(); // id = course_id
  const supabase = createClient();

  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  // Load session + attendance status
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Load session info
      const { data: sessionData } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      // Load student attendance for this session
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("status")
        .eq("session_id", sessionId)
        .eq("student_id", user.id)
        .maybeSingle();

      setSession(sessionData);
      setStatus(attendanceData?.status || "Not checked in");

      setLoading(false);
    };

    loadData();
  }, [sessionId]);

  const checkIn = async () => {
    setCheckingIn(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("attendance").insert([
      {
        session_id: sessionId,
        student_id: user.id,
        status: "Present",
      },
    ]);

    if (error) {
      alert(error.message);
      setCheckingIn(false);
      return;
    }

    setStatus("Present");
    setCheckingIn(false);
    alert("Checked in successfully!");
  };

  if (loading) return <p className="p-6">Loading session...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Session Attendance</h1>

      <div className="p-4 border rounded-lg bg-white space-y-2">
        <h2 className="font-semibold text-xl">
          Session {session.session_number}: {session.title}
        </h2>

        <p className="text-gray-600">Date: {session.session_date}</p>

        <p className="text-lg">
          Status:{" "}
          <span
            className={
              status === "Present"
                ? "text-green-600 font-bold"
                : "text-red-600"
            }
          >
            {status}
          </span>
        </p>
      </div>

      {/* Check-in button */}
      {status !== "Present" && (
        <button
          onClick={checkIn}
          disabled={checkingIn}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          {checkingIn ? "Checking in..." : "Check-in"}
        </button>
      )}

      {status === "Present" && (
        <p className="text-green-700 font-medium">
          ✓ You have already checked in.
        </p>
      )}
    </div>
  );
}
