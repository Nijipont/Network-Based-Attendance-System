import { createClient } from "@/lib/supabase/server";
import QRCode from "react-qr-code";

export default async function SessionAttendancePage({ params }) {
  const resolvedParams = await params;
  const { courseId, sessionId } = resolvedParams;

  const supabase = createClient();

  // โหลด session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  const token = session?.token;

  // URL ของ QR
  const attendanceUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/student/courses/${courseId}/attendance/${sessionId}?token=${token}`;

  // โหลด attendance
  const { data: attendance } = await supabase
    .from("attendance")
    .select("*, students(name, student_id)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Session Attendance</h1>

      {/* QR Code แบบไม่ใช้ DataURL */}
      <div className="bg-white p-4 inline-block rounded shadow">
        <QRCode value={attendanceUrl} size={220} />
      </div>

      <h2 className="text-xl font-semibold mt-4">Checked-in Students</h2>

      {attendance?.length ? (
        <div className="space-y-3">
          {attendance.map((a) => (
            <div key={a.id} className="border p-3 rounded flex justify-between">
              <p className="font-bold">
                {a.students?.name} ({a.students?.student_id})
              </p>

              <p className="text-gray-600 text-sm">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No one has checked in yet.</p>
      )}
    </div>
  );
}
