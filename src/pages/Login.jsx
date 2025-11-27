import React from "react";
import { useNavigate } from "react-router-dom";
import StudentLogin from "./logins/StudentLogin";
import DoctorLogin from "./logins/DoctorLogin";

export default function Login() {
  const [isDoctor, setIsDoctor] = React.useState(false);
  
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="bg-[#a71930] px-8 py-4 flex justify-end">
        <div className="text-white text-2xl">🌐</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white rounded-3xl shadow-2xl px-12 py-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="flex-shrink-0">
                <img
                  src="/telkomedikaLogo.png"
                  alt="TelkoMedika Logo"
                  className="w-28"
                />
              </div>

              <div className="flex-1 text-center">
                <h1 className="text-black text-2xl font-bold">
                  Welcome to <br /> MyTelkomedika
                </h1>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => setIsDoctor(false)}
                className={`flex-1 py-3 rounded-lg font-semibold transition text-sm ${
                  !isDoctor
                    ? "bg-[#a71930] text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setIsDoctor(true)}
                className={`flex-1 py-3 rounded-lg font-semibold transition text-sm ${
                  isDoctor
                    ? "bg-[#a71930] text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Doctor
              </button>
            </div>

            <div className="px-2">
              {isDoctor ? <DoctorLogin /> : <StudentLogin />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}