"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams(); // course_id
  const supabase = createClient();

  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Load course
  useEffect(() => {
    const loadCourse = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("course_id", id)
        .single();

      if (!error) setCourse(data);
    };

    loadCourse();
  }, [id]);

  // Load sessions for this course
  useEffect(() => {
    const loadSessions = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("course_id", id)
        .order("session_number", { ascending: false });

      if (!error) setSessions(data);
    };

    loadSessions();
  }, [id]);

  if (!course) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{course.course_name}</h1>
        <p className="text-gray-600">{course.description}</p>
      </div>

      {/* Session List */}
      <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
        <h2 className="text-xl font-semibold">Attendance Sessions</h2>

        {sessions.length === 0 ? (
          <p className="text-gray-500">No sessions created yet.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/student/courses/${id}/attendance/${s.id}`}
                className="block p-3 border rounded-lg bg-white hover:bg-gray-100"
              >
                <div className="font-semibold">
                  Session {s.session_number}: {s.title}
                </div>
                <div className="text-sm text-gray-600">
                  Date: {s.session_date}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
