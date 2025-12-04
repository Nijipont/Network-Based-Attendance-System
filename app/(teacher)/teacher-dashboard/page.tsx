// app/(teacher)/teacher-dashboard/page.js
"use client"

import { createClient } from '@/lib/supabase/client';
import { count } from 'console';
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const supabase = createClient();
  const [num_course, setNumCourse] = useState<string | null>(null);

  useEffect(() => {
    const loadNumCourse = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { count, error } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", user.id);

      setNumCourse(String(count ?? 0));
    };

    loadNumCourse();
  }, []);
  return (
    <section>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher Dashboard Overview</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-xl font-semibold">Active Courses</p>
          <p className="text-4xl text-green-600">{num_course}</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        {/* รายละเอียดกิจกรรมล่าสุด */}
        <p>... Activity List ...</p>
      </div>
    </section>
  );
}