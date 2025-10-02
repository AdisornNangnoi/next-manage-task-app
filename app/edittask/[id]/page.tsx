"use client";

import Image from "next/image";
import tasklogo from "../../../assets/images/task.png";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTaskById() {
      const { data, error } = await supabase
        .from("task_tb")
        .select("*")
        .eq("id", taskId)
        .single();
      if (error) {
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน: " + error.message);
        console.log(error);
      }
      console.log(data);
      setTitle(data.title);
      setDetail(data.detail);
      setStatus(data.is_complete);
      setPreviewImage(data.image_url);
      setOldImage(data.image_url);
    }
    fetchTaskById();
  }, []);

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //อัพโหลดรูป

    let image_url = previewImage || "";
    if (image) {
      //ลบรูปเก่า
      const fileName = oldImage?.split("/").pop();
      if (fileName) {
        await supabase.storage.from("task_bk").remove([fileName]);
      }

      const newImageFileName = `${Date.now()}_${image.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("task_bk") // ชื่อ bucket
        .upload(newImageFileName, image);

      if (uploadError) {
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + uploadError.message);
        return;
      }

      // getPublicUrl เป็นเมธอดแบบ sync ใน v2
      const { data: urlData } = supabase.storage
        .from("task_bk")
        .getPublicUrl(newImageFileName);

      image_url = urlData.publicUrl;
    }
    //บันทึกข้อมูล
    const { data, error } = await supabase
      .from("task_tb")
      .update({
        title: title,
        detail: detail,
        is_complete: status,
        image_url: image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      alert("เกิดข้อผิดพลาดในการแก้ไขงาน: " + error.message);
      console.log(error);
    } else {
      alert("แก้ไขงานเรียบร้อยแล้ว");
      router.push("/alltask");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-20">
      <div className="flex flex-col items-center">
        <Image src={tasklogo} alt="Task Logo" width={100} height={100} />
        <h1 className="text-2xl font-bold mt-7 mb-7">Manage Task App</h1>
      </div>
      <div className="w-3xl border border-gray-500 p-10 mx-auto">
        <h1 className="text-xl font-bold text-center">🔄 แก้ไขงาน</h1>
        <form className="w-full space-y-4" onSubmit={handleUpdateTask}>
          <div>
            <label htmlFor="title" className="block mb-2">
              ชื่องาน
            </label>
            <input
              type="text"
              id="title"
              className="border border-gray-300 p-2 w-full"
              placeholder="ใส่ชื่องาน"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="detail" className="block mb-2">
              รายละเอียด
            </label>
            <textarea
              id="detail"
              className="border border-gray-300 p-2 w-full"
              placeholder="ใส่รายละเอียดงาน"
              rows={5}
              required
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block mb-1 font-medium">อัปโหลดรูป</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleImageChange(e);
              }}
              className="hidden"
            />
            <label
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
              htmlFor="fileInput"
            >
              เลือกรูป
            </label>
            {previewImage && (
              <div>
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={150}
                  height={150}
                  className="mt-2 object-cover border"
                />
              </div>
            )}
          </div>
          <div>
            <select
              className="border rounded-lg p-2 w-full"
              value={status ? "1" : "0"}
              onChange={(e) => setStatus(e.target.value === "1" ? true : false)}
            >
              <option value="0">❌ยังไม่เสร็จ</option>
              <option value="1">✅เสร็จแล้ว</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              บันทึกการแก้ไขงาน
            </button>
          </div>
        </form>

        <Link
          href="/alltask"
          className="text-blue-500 w-full text-center block mt-5 hover:text-blue-700"
        >
          กลับหน้าแสดงงานทั้งหมด
        </Link>
      </div>
    </div>
  );
}
