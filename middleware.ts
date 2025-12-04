import { createSupabaseMiddlewareClient } from "./lib/supabase/supabaseMiddlewareClient"; 
import { NextResponse, type NextRequest } from 'next/server';

// ----------------------------------------------------
// 1. กำหนดเส้นทาง
// ----------------------------------------------------
const LOGIN_ROUTE = '/'; 
const STUDENT_DASHBOARD = '/student-dashboard';
const TEACHER_DASHBOARD = '/teacher-dashboard';
const PUBLIC_ROUTES = [
  '/register',
  '/reset-password',
  '/update-password',
];

/**
 * Middleware function สำหรับตรวจสอบการอนุญาตและ role
 */
export async function middleware(req: NextRequest) {
  // 1.1 สร้าง Supabase Client
  const { supabase, response: res } = createSupabaseMiddlewareClient(req);
  const pathname = req.nextUrl.pathname;
  const url = req.nextUrl.clone();

  // 1.2 *แก้ไข*: ใช้ getUser() เพื่อยืนยันตัวตน (Authenticates the data)
  const { data: { user } } = await supabase.auth.getUser();

  // ************ ส่วนที่ 1: จัดการผู้ใช้ที่ยังไม่ได้ล็อกอิน (NO USER) ************
  if (!user) {
    // อนุญาตให้เข้าถึงเส้นทางสาธารณะและหน้า Login ('/')
    if (PUBLIC_ROUTES.includes(pathname) || pathname === LOGIN_ROUTE) {
      return res;
    }

    // หากพยายามเข้าถึง Protected Route อื่นๆ ให้ Redirect ไปหน้า Login
    url.pathname = LOGIN_ROUTE;
    return NextResponse.redirect(url);
  }

  // ************ ส่วนที่ 2: จัดการผู้ใช้ที่ล็อกอินแล้ว (HAS USER) ************
  if (user) {
    const userId = user.id;
    let userRole: string | null = null;

    // 2.1 ดึง Role จากตาราง 'profiles' (ใช้ userId ที่ได้รับการยืนยันแล้ว)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (profileData) {
      userRole = profileData.role;
    } else {
      console.error("Profile not found for authenticated user:", userId);
    }
    
    // 2.2 กำหนด Dashboard ที่ถูกต้อง
    const currentDashboard = userRole === 'student' 
        ? STUDENT_DASHBOARD 
        : (userRole === 'teacher' ? TEACHER_DASHBOARD : LOGIN_ROUTE); 

    // A. Redirect จากหน้า Login ('/')
    if (pathname === LOGIN_ROUTE && currentDashboard !== LOGIN_ROUTE) {
        // ถ้าล็อกอินอยู่ และอยู่ที่หน้า Login ให้ Redirect ไป Dashboard ที่ถูกต้อง
        url.pathname = currentDashboard;
        return NextResponse.redirect(url);
    }
    
    // B. Dashboard Protection (ป้องกันการเข้าถึง Dashboard ผิด Role)
    if (userRole === 'student') {
        // นักเรียนพยายามเข้าถึงเส้นทางของครู (เริ่มต้นด้วย /teacher)
        if (pathname.startsWith('/teacher')) {
            url.pathname = STUDENT_DASHBOARD; 
            return NextResponse.redirect(url);
        }
    } else if (userRole === 'teacher') {
        // ครูพยายามเข้าถึงเส้นทางของนักเรียน (เริ่มต้นด้วย /student)
        if (pathname.startsWith('/student')) {
            url.pathname = TEACHER_DASHBOARD; 
            return NextResponse.redirect(url);
        }
    }
    
    // C. Redirect จาก Public Routes ไป Dashboard
    if (PUBLIC_ROUTES.includes(pathname) && currentDashboard !== LOGIN_ROUTE) {
        url.pathname = currentDashboard;
        return NextResponse.redirect(url);
    }
  }

  // อนุญาตให้ request ดำเนินการต่อไป
  return res;
}

// ----------------------------------------------------
// 3. กำหนด Matcher
// ----------------------------------------------------
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|trpc).*)',
  ],
};