// app/(teacher)/courses/page.js

import Link from "next/link";

export default function CoursesPage() {
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
        </div>
    </section>
  );
}