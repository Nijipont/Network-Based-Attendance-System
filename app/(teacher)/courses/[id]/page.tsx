"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CourseDetail() {
  const { id } = useParams(); // ← ดึง id จาก URL
  const supabase = createClient();

  const [course, setCourse] = useState(null);

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

  if (!course) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">{course.course_name}</h1>
      <p className="text-gray-600">{course.description}</p>
    </div>
  );
}
