import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAlertStore } from "../../stores/useAlertStore";

// Zod 스키마 정의
const signUpSchema = z
   .object({
      name: z
         .string()
         .min(2, "이름은 2글자 이상이어야 합니다.")
         .max(6, "이름은 6글자 이내여야 합니다."),
      email: z.string().email("유효한 이메일 형식이 아닙니다."),
      password: z
         .string()
         .min(8, "비밀번호는 8자 이상이어야 합니다.")
         .regex(
            /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/,
            "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.",
         ),
      passwordConfirm: z.string(),
      phone: z.string().regex(/^\d{3}-\d{3,4}-\d{4}$/, "올바른 휴대폰 번호 형식이 아닙니다."),
   })
   .refine(data => data.password === data.passwordConfirm, {
      message: "비밀번호가 일치하지 않습니다.",
      path: ["passwordConfirm"],
   });

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp: React.FC = () => {
   const navigate = useNavigate();
   const { registerUser } = useAuthStore();
   const { showAlert } = useAlertStore();

   const [step, setStep] = useState<1 | 2>(1);
   const [agreements, setAgreements] = useState({
      service: false,
      privacy: false,
      thirdParty: false,
      marketing: false,
   });

   const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
   } = useForm<SignUpFormData>({
      resolver: zodResolver(signUpSchema),
      mode: "onChange",
   });

   const [serverError, setServerError] = useState("");
   const [showSuccessAlert, setShowSuccessAlert] = useState(false);

   const handleAgreeAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setAgreements({
         service: checked,
         privacy: checked,
         thirdParty: checked,
         marketing: checked,
      });
   };

   const handleAgreementChange = (name: keyof typeof agreements) => {
      setAgreements(prev => ({ ...prev, [name]: !prev[name] }));
   };

   const isAllChecked = Object.values(agreements).every(val => val);

   const handleNextStep = () => {
      if (!agreements.service || !agreements.privacy || !agreements.thirdParty) {
         showAlert("필수 약관에 모두 동의해 주세요.", "약관 동의", "warning");
         return;
      }
      setStep(2);
      window.scrollTo(0, 0);
   };

   const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numbers = value.replace(/[^\d]/g, "");
      let newValue = numbers;

      if (numbers.length <= 11) {
         if (numbers.length > 3 && numbers.length <= 7) {
            newValue = numbers.replace(/(\d{3})(\d{1,4})/, "$1-$2");
         } else if (numbers.length >= 8) {
            newValue = numbers.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
         }
      }
      setValue("phone", newValue, { shouldValidate: true });
   };

   const onSubmit = async (data: SignUpFormData) => {
      setServerError("");

      const success = await registerUser({
         email: data.email,
         password: data.password,
         password_confirm: data.passwordConfirm,
         name: data.name,
         phone: data.phone,
      });

      if (success) {
         setShowSuccessAlert(true);
      } else {
         setServerError(
            "회원가입 중 서버 에러가 발생했습니다. (이미 가입된 이메일인지 확인하거나 다른 정보를 입력해보세요)",
         );
      }
   };

   if (step === 1) {
      return (
         <div className="min-h-screen pt-10 pb-20 flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-2xl border border-gray-100">
               <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-brand-dark mb-2">JOIN US</h2>
                  <p className="text-gray-500">회원가입 약관동의</p>
               </div>
               <div className="mb-6 border-2 border-brand-yellow bg-yellow-50 p-5 rounded-xl flex items-center">
                  <input
                     type="checkbox"
                     id="all"
                     checked={isAllChecked}
                     onChange={handleAgreeAll}
                     className="w-5 h-5 accent-brand-yellow mr-3"
                  />
                  <label htmlFor="all" className="font-bold text-brand-dark cursor-pointer">
                     전체 동의합니다.
                  </label>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <label className="text-sm font-bold text-brand-dark">
                        [필수] 서비스 이용약관
                     </label>
                     <input
                        type="checkbox"
                        checked={agreements.service}
                        onChange={() => handleAgreementChange("service")}
                        className="w-4 h-4 accent-brand-yellow"
                     />
                  </div>
                  <div className="flex justify-between items-center">
                     <label className="text-sm font-bold text-brand-dark">
                        [필수] 개인정보 수집 및 이용
                     </label>
                     <input
                        type="checkbox"
                        checked={agreements.privacy}
                        onChange={() => handleAgreementChange("privacy")}
                        className="w-4 h-4 accent-brand-yellow"
                     />
                  </div>
                  <div className="flex justify-between items-center">
                     <label className="text-sm font-bold text-brand-dark">
                        [필수] 개인정보 제3자 제공
                     </label>
                     <input
                        type="checkbox"
                        checked={agreements.thirdParty}
                        onChange={() => handleAgreementChange("thirdParty")}
                        className="w-4 h-4 accent-brand-yellow"
                     />
                  </div>
               </div>
               <div className="flex gap-4 mt-10">
                  <button
                     onClick={() => navigate("/")}
                     className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl">
                     취소
                  </button>
                  <button
                     onClick={handleNextStep}
                     className="flex-[2] py-4 bg-brand-yellow text-brand-dark font-black rounded-xl shadow-lg">
                     다음 단계로
                  </button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen pt-10 pb-20 flex flex-col items-center bg-gray-50 px-4">
         <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="h-36 bg-brand-dark flex items-center justify-center text-white/40 text-lg font-bold uppercase tracking-widest">
               NADA BRAND VISUAL
            </div>
            <div className="p-10 md:p-14">
               <h2 className="text-center text-brand-dark mb-8 text-2xl font-black">
                  회원정보 입력
               </h2>
               {serverError && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                     {serverError}
                  </div>
               )}
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                     <input
                        {...register("name")}
                        type="text"
                        placeholder="이름"
                        className={`w-full p-4 bg-gray-50 border rounded-xl ${errors.name ? "border-red-500" : "border-gray-200"}`}
                     />
                     {errors.name && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>
                     )}
                  </div>
                  <div>
                     <input
                        {...register("email")}
                        type="email"
                        placeholder="이메일"
                        className={`w-full p-4 bg-gray-50 border rounded-xl ${errors.email ? "border-red-500" : "border-gray-200"}`}
                     />
                     {errors.email && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
                     )}
                  </div>
                  <div>
                     <input
                        {...register("password")}
                        type="password"
                        placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)"
                        className={`w-full p-4 bg-gray-50 border rounded-xl ${errors.password ? "border-red-500" : "border-gray-200"}`}
                     />
                     {errors.password && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
                     )}
                  </div>
                  <div>
                     <input
                        {...register("passwordConfirm")}
                        type="password"
                        placeholder="비밀번호 확인"
                        className={`w-full p-4 bg-gray-50 border rounded-xl ${errors.passwordConfirm ? "border-red-500" : "border-gray-200"}`}
                     />
                     {errors.passwordConfirm && (
                        <p className="text-red-500 text-xs mt-1 ml-1">
                           {errors.passwordConfirm.message}
                        </p>
                     )}
                  </div>
                  <div>
                     <input
                        {...register("phone")}
                        type="text"
                        placeholder="휴대폰 번호 (010-0000-0000)"
                        onChange={onPhoneChange}
                        className={`w-full p-4 bg-gray-50 border rounded-xl ${errors.phone ? "border-red-500" : "border-gray-200"}`}
                     />
                     {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone.message}</p>
                     )}
                  </div>
                  <div className="flex gap-4 mt-10">
                     <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 bg-white border border-gray-300 font-bold rounded-xl">
                        이전
                     </button>
                     <button
                        type="submit"
                        className="flex-[2] bg-brand-yellow text-brand-dark font-black py-4 rounded-xl shadow-lg">
                        회원가입 완료
                     </button>
                  </div>
               </form>
            </div>
         </div>
         {showSuccessAlert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
               <div className="bg-white rounded-[25px] p-8 text-center shadow-2xl border-t-8 border-brand-yellow">
                  <h3 className="text-xl font-black text-brand-dark mb-2">가입을 축하합니다!</h3>
                  <button
                     onClick={() => navigate("/login")}
                     className="w-full py-4 bg-brand-dark text-white font-bold rounded-xl mt-6">
                     로그인하러 가기
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default SignUp;

