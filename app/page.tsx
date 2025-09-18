import Image from "next/image";
import tasklogo from "./../assets/images/task.png";
import Link from "next/link";

export default function Page() {
  return (
    <div className="pt-20">
      <div className="flex flex-col items-center">
        <Image src={tasklogo} alt="Task Logo" width={150} height={150} />
        <h1 className="text-2xl font-bold mt-7 mb-7">Manage Task App</h1>
        <Link
          href="/alltask"
          className="text-white hover:text-black w-sm px-4 py-2 rounded bg-blue-500 text-center"
        >
          เข้าใช้งาน
        </Link>
      </div>
    </div>
  );
}
