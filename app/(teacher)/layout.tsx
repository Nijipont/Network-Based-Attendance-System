// app/(teacher)/layout.tsx
"use client";

import Link from 'next/link';
import { PropsWithChildren } from 'react'; 
import ClientLogoutButton from '@/app/clientLogoutButton';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from "react";
import { profile } from 'console';

// Component จำลอง: Sidebar สำหรับครู
const TeacherSidebar = () => (
  <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
    <h1 className="text-2xl font-bold mb-6">Teacher Panel</h1>
    <nav className="space-y-2">
      <Link href="/teacher-dashboard" className="block p-2 rounded hover:bg-slate-700 transition">
        Dashboard
      </Link>
      <Link href="/courses" className="block p-2 rounded hover:bg-slate-700 transition">
        My Courses
      </Link>
    </nav>
  </aside>
);


// 2. แก้ไขโดยการเพิ่ม Type PropsWithChildren
export default function TeacherLayout({ children }: PropsWithChildren) {
  const supabase = createClient();
  const [firstname, setFirstname] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("firstname")
        .eq("user_id", user.id)
        .single();

      setFirstname(profile?.firstname || "Student");
    };

    loadProfile();
  }, []);
  return (
    <div className="flex min-h-screen">
      {/* 1. Sidebar จะอยู่ด้านซ้ายเสมอ */}
      <TeacherSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* 2. Header จะอยู่ด้านบนเสมอ */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Welcome back, Teacher {firstname}</h2>
        <ClientLogoutButton></ClientLogoutButton>
        </header>
        
        {/* 3. children คือเนื้อหาของหน้าปัจจุบัน (Dashboard หรือ Courses) */}
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}