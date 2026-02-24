import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "../../stores/useAuthStore";

// Zod 스키마 정의
const loginSchema = z.object({
  email: z.string().email("유효한 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [serverError, setServerError] = useState("");

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");

    const success = await login({ email: data.email, password: data.password });
    if (success) {
      navigate("/");
    } else {
      setServerError("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-20 flex flex-col items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-36 bg-brand-dark flex items-center justify-center text-white/40 text-lg font-bold uppercase tracking-widest font-premium">
          Nada Coffee
        </div>
        <div className="p-8 md:p-10">
          <h2 className="text-center text-brand-dark mb-8 text-2xl font-black font-premium">LOGIN</h2>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                이메일
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                placeholder="example@email.com"
                className={`w-full p-4 bg-gray-50 border rounded-xl focus:outline-none focus:border-brand-yellow transition-all ${errors.email ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                비밀번호
              </label>
              <input
                {...register("password")}
                type="password"
                id="password"
                placeholder="비밀번호를 입력하세요"
                className={`w-full p-4 bg-gray-50 border rounded-xl focus:outline-none focus:border-brand-yellow transition-all ${errors.password ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-brand-yellow text-brand-dark font-black rounded-xl shadow-lg hover:bg-yellow-400 transition-all duration-200 mt-4">
              로그인하기
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-4">아직 회원이 아니신가요?</p>
            <button
              onClick={() => navigate("/signup")}
              className="text-brand-dark font-bold hover:underline">
              회원가입 하러가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

