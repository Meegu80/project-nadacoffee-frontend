import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAlertStore } from "../../stores/useAlertStore";
import { MdCheckCircle, MdChevronRight, MdSecurity, MdDescription, MdShare, MdCampaign, MdExpandMore, MdExpandLess } from "react-icons/md";

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
   } = useForm<SignUpFormData>({
      resolver: zodResolver(signUpSchema),
      mode: "onChange",
   });

   const [serverError, setServerError] = useState("");
   const [showSuccessAlert, setShowSuccessAlert] = useState(false);
   const [openAccordion, setOpenAccordion] = useState<string | null>(null);

   const toggleAccordion = (key: string) => {
      setOpenAccordion(prev => (prev === key ? null : key));
   };

   const termContents = {
      service: "서비스 이용약관 상세 내용입니다... 나다커피의 다양한 서비스를 이용함에 있어 필요한 규칙과 의무사항을 규정합니다.",
      privacy: "개인정보 수집 및 이용에 관한 상세 안내입니다... 성명, 이메일, 연락처 등 서비스 제공을 위한 최소한의 정보를 수집합니다.",
      thirdParty: "개인정보의 제3자 제공에 동의하실 경우, 협력사를 통해 보다 원활한 배송 및 CS 서비스를 받으실 수 있습니다.",
      marketing: "이벤트 및 신제품 출시 소식을 누구보다 빠르게 받아보실 수 있습니다. 마케팅 정보 수신에 동의해 주세요.",
   };

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
         <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] relative overflow-hidden px-4 font-premium">
            {/* Soft Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#FFD40015_0%,transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#22222210_0%,transparent_50%)]"></div>
            
            <div className="bg-white rounded-[45px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative z-10 border border-white/50">
               {/* Left Brand Panel */}
               <div className="md:w-[40%] bg-brand-dark p-10 md:p-14 flex flex-col justify-between text-white relative self-stretch">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10">
                     <div className="w-12 h-1 bg-brand-yellow mb-8"></div>
                     <h2 className="text-4xl font-black leading-tight tracking-tighter mb-4">BECOME A<br/>MEMBER</h2>
                     <p className="text-white/60 font-medium text-sm leading-relaxed">나다커피의 멤버가 되어<br/>특별한 혜택과 소식을 만나보세요.</p>
                  </div>
                  <div className="relative z-10 mt-12 md:mt-0">
                     <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">Step 01 / Term Agreement</p>
                  </div>
               </div>

               {/* Right Content Panel */}
               <div className="flex-1 p-8 md:p-14 bg-white">
                  <div className="mb-10">
                     <h3 className="text-2xl font-black text-brand-dark tracking-tighter mb-2">약관 동의</h3>
                     <p className="text-gray-400 text-sm">원활한 서비스 이용을 위해 필수 약관 동의가 필요합니다.</p>
                  </div>

                  <div className="space-y-4">
                     <div className="group cursor-pointer bg-gray-50 border-2 border-gray-100 p-6 rounded-[25px] transition-all hover:border-brand-yellow flex items-center">
                        <input
                           type="checkbox"
                           id="all"
                           checked={isAllChecked}
                           onChange={handleAgreeAll}
                           className="w-6 h-6 accent-brand-dark mr-4 cursor-pointer"
                        />
                        <label htmlFor="all" className="font-black text-lg text-brand-dark cursor-pointer flex-1">
                           전체 동의합니다.
                        </label>
                     </div>

                     <div className="space-y-4 px-1 py-4">
                        {/* 서비스 이용약관 */}
                        <div className="border-b border-gray-100 pb-4">
                           <div className="flex items-center gap-4 group">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                 <MdDescription size={18} />
                              </div>
                              <label
                                 onClick={() => toggleAccordion("service")}
                                 className="flex-1 text-sm font-bold text-gray-500 cursor-pointer flex items-center justify-between">
                                 [필수] 서비스 이용약관
                                 {openAccordion === "service" ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                              </label>
                              <input
                                 type="checkbox"
                                 checked={agreements.service}
                                 onChange={() => handleAgreementChange("service")}
                                 className="w-5 h-5 accent-brand-yellow cursor-pointer"
                              />
                           </div>
                           {openAccordion === "service" && (
                              <div className="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                 {termContents.service}
                              </div>
                           )}
                        </div>

                        {/* 개인정보 수집 */}
                        <div className="border-b border-gray-100 pb-4">
                           <div className="flex items-center gap-4 group">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                 <MdSecurity size={18} />
                              </div>
                              <label 
                                 onClick={() => toggleAccordion("privacy")}
                                 className="flex-1 text-sm font-bold text-gray-500 cursor-pointer flex items-center justify-between">
                                 [필수] 개인정보 수집 및 이용
                                 {openAccordion === "privacy" ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                              </label>
                              <input
                                 type="checkbox"
                                 checked={agreements.privacy}
                                 onChange={() => handleAgreementChange("privacy")}
                                 className="w-5 h-5 accent-brand-yellow cursor-pointer"
                              />
                           </div>
                           {openAccordion === "privacy" && (
                              <div className="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                 {termContents.privacy}
                              </div>
                           )}
                        </div>

                        {/* 제3자 제공 */}
                        <div className="border-b border-gray-100 pb-4">
                           <div className="flex items-center gap-4 group">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                 <MdShare size={18} />
                              </div>
                              <label 
                                 onClick={() => toggleAccordion("thirdParty")}
                                 className="flex-1 text-sm font-bold text-gray-500 cursor-pointer flex items-center justify-between">
                                 [필수] 개인정보 제3자 제공
                                 {openAccordion === "thirdParty" ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                              </label>
                              <input
                                 type="checkbox"
                                 checked={agreements.thirdParty}
                                 onChange={() => handleAgreementChange("thirdParty")}
                                 className="w-5 h-5 accent-brand-yellow cursor-pointer"
                              />
                           </div>
                           {openAccordion === "thirdParty" && (
                              <div className="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                 {termContents.thirdParty}
                              </div>
                           )}
                        </div>

                        {/* 마케팅 동의 */}
                        <div className="pb-2">
                           <div className="flex items-center gap-4 group">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                 <MdCampaign size={18} />
                              </div>
                              <label 
                                 onClick={() => toggleAccordion("marketing")}
                                 className="flex-1 text-sm font-bold text-gray-500 cursor-pointer flex items-center justify-between">
                                 [선택] 마케팅 정보 수신
                                 {openAccordion === "marketing" ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                              </label>
                              <input
                                 type="checkbox"
                                 checked={agreements.marketing}
                                 onChange={() => handleAgreementChange("marketing")}
                                 className="w-5 h-5 accent-brand-yellow cursor-pointer"
                              />
                           </div>
                           {openAccordion === "marketing" && (
                              <div className="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                 {termContents.marketing}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                     <button
                        onClick={() => navigate("/")}
                        className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-[20px] hover:bg-gray-200 transition-all">
                        취소
                     </button>
                     <button
                        onClick={handleNextStep}
                        className="flex-[2] py-4 bg-brand-yellow text-brand-dark font-black rounded-[20px] shadow-[0_10px_20px_rgba(255,212,0,0.2)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                        다음으로 <MdChevronRight size={20} />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] relative overflow-hidden px-4 font-premium">
         {/* Soft Ambient Background */}
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#FFD40010_0%,transparent_50%)]"></div>
         
         <div className="w-full max-w-4xl bg-white rounded-[45px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-white/50 relative z-10">
            {/* Left Brand Panel */}
            <div className="md:w-[40%] bg-brand-dark p-10 md:p-14 flex flex-col justify-between text-white relative self-stretch min-h-[400px]">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               <div className="relative z-10">
                  <div className="w-12 h-1 bg-brand-yellow mb-8"></div>
                  <h2 className="text-4xl font-black leading-tight tracking-tighter mb-4">MEMBER<br/>INFO</h2>
                  <p className="text-white/60 font-medium text-sm leading-relaxed">최소한의 정보 입력으로<br/>간편하게 가입을 완료하세요.</p>
               </div>
               <div className="relative z-10 mt-12 md:mt-0">
                  <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">Step 02 / Data Entry</p>
               </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 p-8 md:p-14 bg-white">
               {serverError && (
                  <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[13px] font-bold flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                     {serverError}
                  </div>
               )}
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">Name</label>
                        <input
                           {...register("name")}
                           type="text"
                           placeholder="홍길동"
                           className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:border-brand-yellow transition-all text-sm font-bold ${errors.name ? "border-red-400" : "border-gray-50"}`}
                        />
                        <div className="min-h-[14px]">
                           {errors.name && (
                              <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>
                           )}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">Phone</label>
                        <input
                           {...register("phone")}
                           type="text"
                           placeholder="010-0000-0000"
                           onChange={onPhoneChange}
                           className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:border-brand-yellow transition-all text-sm font-bold ${errors.phone ? "border-red-400" : "border-gray-50"}`}
                        />
                        <div className="min-h-[14px]">
                           {errors.phone && (
                              <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.phone.message}</p>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">Email Address</label>
                     <input
                        {...register("email")}
                        type="email"
                        placeholder="nada@example.com"
                        className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:border-brand-yellow transition-all text-sm font-bold ${errors.email ? "border-red-400" : "border-gray-50"}`}
                     />
                     <div className="min-h-[14px]">
                        {errors.email && (
                           <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>
                        )}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                     <input
                        {...register("password")}
                        type="password"
                        placeholder="••••••••"
                        className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:border-brand-yellow transition-all text-sm font-bold ${errors.password ? "border-red-400" : "border-gray-50"}`}
                     />
                     <div className="min-h-[14px]">
                        {errors.password && (
                           <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>
                        )}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">Confirm Password</label>
                     <input
                        {...register("passwordConfirm")}
                        type="password"
                        placeholder="••••••••"
                        className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:border-brand-yellow transition-all text-sm font-bold ${errors.passwordConfirm ? "border-red-400" : "border-gray-50"}`}
                     />
                     <div className="min-h-[14px]">
                        {errors.passwordConfirm && (
                           <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.passwordConfirm.message}</p>
                        )}
                     </div>
                  </div>

                  <div className="flex gap-4 pt-10">
                     <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 bg-gray-50 text-gray-400 font-bold rounded-[20px] hover:bg-gray-100 transition-all text-sm">
                        이전 단계
                     </button>
                     <button
                        type="submit"
                        className="flex-[2] bg-brand-yellow text-brand-dark font-black py-4 rounded-[20px] shadow-[0_10px_20px_rgba(255,212,0,0.2)] hover:translate-y-[-2px] transition-all text-sm">
                        회원가입 완료
                     </button>
                  </div>
               </form>
            </div>
         </div>
         {showSuccessAlert && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/60 backdrop-blur-md p-4">
               <div className="bg-white rounded-[40px] p-10 text-center shadow-2xl max-w-sm w-full border-t-[12px] border-brand-yellow animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-yellow">
                     <MdCheckCircle size={50} />
                  </div>
                  <h3 className="text-3xl font-black text-brand-dark mb-2 tracking-tighter">환영합니다!</h3>
                  <p className="text-gray-500 font-medium mb-8">나다커피의 회원이 되셨습니다.<br/>이제 모든 서비스를 이용하실 수 있습니다.</p>
                  <button
                     onClick={() => navigate("/login")}
                     className="w-full py-5 bg-brand-dark text-white font-black rounded-[20px] shadow-xl hover:translate-y-[-2px] transition-all">
                     로그인하러 가기
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default SignUp;

