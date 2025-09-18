"use client";

import Image from "next/image";
import tasklogo from "../../assets/images/task.png";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// ---- กำหนดชนิดข้อมูลของ Task ----
type Task = {
  id: string;
  created_at: string;
  title: string;
  detail: string;
  image_url: string;
  is_complete: boolean;
  updated_at: string;
};

export default function Page() {
  // ---- สร้างตัวแปร state สำหรับเก็บข้อมูล Task ----
  const [tasks, setTasks] = useState<Task[]>([]);

  // ---- ดึงข้อมูล Task จาก Supabase ----
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("task_tb") // ชื่อ table ใน Supabase
        .select(
          "id, created_at, title, detail, image_url, is_complete, updated_at"
        )
        .order("id", { ascending: false }); // เรียงลำดับจากใหม่ไปเก่า
      if (error) {
        console.log(error);
      } else {
        setTasks(data as Task[]);
      }
    };

    fetchTasks();
  }, []);

  // สร้างฟังชันลบ Task
  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบงานนี้หรือไม่?")) {
      const { error } = await supabase.from("task_tb").delete().eq("id", id);
      if (error) {
        console.log(error);
      } else {
        setTasks(tasks.filter((task) => task.id !== id));
      }
    }
  };

  return (
    <div className="p-20 ">
      <div className="flex flex-col items-center">
        <Image src={tasklogo} alt="Task Logo" width={100} height={100} />
        <h1 className="text-xl font-bold mt-5 mb-5">Manage Task App</h1>
      </div>
      <div className="flex flex-row-reverse">
        <Link
          href="/addtask"
          className="text-white hover:text-black block px-4 py-2 rounded bg-blue-500 text-center"
        >
          เพิ่มงาน
        </Link>
      </div>
      {/* ---- ดึงข้อมูลมาแสดง ---- */}
      <div className="mt-5 mb-5">
        <table className="min-w-full border border-gray-700 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">รูปภาพ</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Detail</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">วันที่เพิ่ม</th>
              <th className="border p-2">วันที่แก้ไข</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* วนลูปแสดงข้อมูล Task */}
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="border p-2">
                  {task.image_url ? (
                    <Image
                      src={task.image_url}
                      alt={task.title}
                      width={50}
                      height={50}
                    />
                  ) : (
                    <span>ไม่มีรูปภาพ</span>
                  )}
                </td>
                <td className="border p-2">{task.title}</td>
                <td className="border p-2">{task.detail}</td>
                <td className="border p-2">
                  {task.is_complete ? "✅เสร็จสิ้น" : "❌ยังไม่เสร็จสิ้น"}
                </td>
                <td className="border p-2">
                  {new Date(task.created_at).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  {new Date(task.updated_at).toLocaleDateString()}
                </td>
                <td className="border p-2 text-center">
                  <Link
                    href={`/edittask/${task.id}`}
                    className="text-blue-500 hover:text-blue-800 mr-5"
                  >
                    แก้ไข
                  </Link>
                  <button
                    className="text-red-500 hover:text-red-800 cursor-pointer"
                    onClick={() => handleDelete(task.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ----------------------- */}
      <Link
        href="/"
        className="text-blue-500 hover:text-blue-700 block px-4 py-2 rounded text-center"
      >
        กลับไปหน้าแรก
      </Link>
    </div>
  );
}
