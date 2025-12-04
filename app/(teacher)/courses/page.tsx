// app/(teacher)/courses/page.js
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CoursesPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", user.id);

      setCourses(data);
    };

    loadCourses();
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Courses</h1>
      
      <div className="space-y-4">
        <div className="flex justify-end items-center">
            <Link 
                href={"/course-creation"} 
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
            >
                + Create New Course
            </Link>
          </div>
           {courses.length === 0 ? (
            <p className="text-gray-500 text-center mt-4">No courses yet.</p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500"
              >
                <h3 className="text-xl font-semibold">{course.course_id} | {course.course_name}</h3>
                <p className="text-gray-600">{course.description}</p>

                <Link
                  href={`/courses/${course.course_id}`}
                  className="mt-2 inline-block text-sm text-teal-600 hover:text-teal-800"
                >
                  Manage Course →
                </Link>
              </div>
            ))
          )}
        </div>
    </section>
  );
}