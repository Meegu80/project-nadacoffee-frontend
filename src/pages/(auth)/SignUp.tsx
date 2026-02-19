import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/useAuthStore';
import SEO from '../../components/common/SEO';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// [추가] 회원가입 유효성 검사 스키마 정의
const signupSchema = z.object({
  email: z.string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  name: z.string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.'),
  phone: z.string()
    .min(10, '올바른 연락처를 입력해주세요.')
    .regex(/^[0-9]+$/, '숫자만 입력해주세요.'),
  password: z.string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  confirmPassword: z.string()
    .min(1, '비밀번호 확인을 입력해주세요.')
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"], // 에러 메시지가 표시될 필드
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError('');
    try {
      const success = await signup({
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: data.password
      });

      if (success) {
        navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요!' } });
      } else {
        setServerError('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || '이미 사용 중인 이메일이거나 서버 오류입니다.');
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-20 flex flex-col items-center bg-gray-50 px-4">
      <SEO
        title="회원가입"
        description="나다커피의 회원이 되어 특별한 혜택을 누려보세요. 첫 구매 할인 및 포인트 적립 기회를 드립니다."
      />

      <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="h-32 bg-brand-dark flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <h1 className="text-2xl font-black italic tracking-tighter z-10">JOIN <span className="text-brand-yellow">NADA COFFEE</span></h1>
        </div>

        <div className="p-10 md:p-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
              <UserPlus size={20} className="text-brand-dark" />
            </div>
            <h2 className="text-2xl font-black text-brand-dark tracking-tight">CREATE ACCOUNT</h2>
          </div>

          {serverError && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-r-xl text-xs font-bold animate-in fade-in slide-in-from-left-2">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* 이름 필드 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="홍길동"
                className={twMerge([
                  "w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm",
                  errors.name ? "border-red-200 focus:border-red-500" : "focus:border-brand-yellow"
                ])}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            {/* 이메일 필드 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className={twMerge([
                  "w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm",
                  errors.email ? "border-red-200 focus:border-red-500" : "focus:border-brand-yellow"
                ])}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
            </div>

            {/* 연락처 필드 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input
                {...register('phone')}
                type="text"
                placeholder="01012345678 (숫자만)"
                className={twMerge([
                  "w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm",
                  errors.phone ? "border-red-200 focus:border-red-500" : "focus:border-brand-yellow"
                ])}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 비밀번호 필드 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={twMerge([
                    "w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm",
                    errors.password ? "border-red-200 focus:border-red-500" : "focus:border-brand-yellow"
                  ])}
                />
                {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
              </div>

              {/* 비밀번호 확인 필드 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className={twMerge([
                    "w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm",
                    errors.confirmPassword ? "border-red-200 focus:border-red-500" : "focus:border-brand-yellow"
                  ])}
                />
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-dark text-white font-black rounded-[20px] shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <CheckCircle2 size={20} className="text-brand-yellow" />
                  가입 완료하기
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 font-bold text-xs hover:text-brand-dark transition-colors"
            >
              이미 계정이 있으신가요? <span className="text-brand-dark font-black ml-1 underline underline-offset-4">로그인하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
