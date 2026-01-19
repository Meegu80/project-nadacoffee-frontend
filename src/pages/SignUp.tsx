import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { User, Mail, Lock, Phone } from 'lucide-react';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const { signup } = useAuthStore();

    // Step 1: TOS, Step 2: Form
    const [step, setStep] = useState<1 | 2>(1);

    // TOS State
    const [agreements, setAgreements] = useState({
        service: false,
        privacy: false,
        thirdParty: false,
        marketing: false,
    });

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
        phone: ''
    });

    const [error, setError] = useState('');

    // --- TOS Handlers ---
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
        setAgreements(prev => {
            const next = { ...prev, [name]: !prev[name] };
            return next;
        });
    };

    const isAllChecked = Object.values(agreements).every(val => val);

    const handleNextStep = () => {
        if (!agreements.service) {
            alert('서비스 이용약관에 동의해 주세요.');
            return;
        }
        if (!agreements.privacy) {
            alert('개인정보 수집 및 이용에 동의해 주세요.');
            return;
        }
        if (!agreements.thirdParty) {
            alert('개인정보 제3자 제공에 동의해 주세요.');
            return;
        }

        if (!agreements.marketing) {
            alert('마케팅 정보제공에 동의하지 않으셨습니다.\n(이동은 가능합니다)');
        }

        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleCancel = () => {
        if (window.confirm('회원가입을 취소하시겠습니까?\n모든 입력 정보가 사라집니다.')) {
            navigate('/');
        }
    };

    // --- Form Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        let newValue = value;

        // Name: Max 6 chars
        if (name === 'name' && value.length > 6) return;

        // Phone: Auto hyphen
        if (name === 'phone') {
            const numbers = value.replace(/[^\d]/g, '');
            if (numbers.length <= 11) {
                newValue = numbers.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
                if (numbers.length < 10) newValue = numbers; // fallback for short input
                // Better typing experience
                if (numbers.length > 3 && numbers.length <= 7) {
                    newValue = numbers.replace(/(\d{3})(\d{1,4})/, '$1-$2');
                } else if (numbers.length >= 8) {
                    newValue = numbers.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
                }
            } else {
                return;
            }
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleDuplicateCheck = () => {
        if (formData.email.length < 6) {
            alert('아이디는 6자 이상이어야 합니다.');
            return;
        }
        // Mock API call
        alert('사용 가능한 아이디입니다.');
    };

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // ID Validation
        if (formData.email.length < 6 || formData.email.length > 20) {
            setError('아이디(이메일)는 6~20자 사이여야 합니다.');
            return;
        }

        // Password Validation (Regex)
        const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/;
        if (!pwRegex.test(formData.password)) {
            setError('비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자여야 합니다.');
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // Name Validation
        if (!formData.name) {
            setError('이름을 입력해주세요.');
            return;
        }

        // Phone Validation
        if (formData.phone.length < 10) { // Simple check
            setError('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }

        // Mock Sign Up
        signup({
            id: Date.now().toString(),
            username: formData.name,
            email: formData.email
        });

        // Show Custom Overlay instead of alert
        setShowSuccessAlert(true);
    };

    // --- Render ---

    // Step 1: Terms of Service
    if (step === 1) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
                <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-2xl border border-gray-100 dark:border-zinc-700">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-brand-black dark:text-white mb-2">JOIN US</h2>
                        <p className="text-gray-500 dark:text-gray-400">회원가입 약관동의</p>
                    </div>

                    <div className="mb-6 border-2 border-brand-yellow bg-yellow-50 dark:bg-yellow-900/10 p-5 rounded-xl flex items-center">
                        <input
                            type="checkbox"
                            id="all"
                            checked={isAllChecked}
                            onChange={handleAgreeAll}
                            className="w-5 h-5 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded cursor-pointer accent-brand-yellow mr-3"
                        />
                        <label htmlFor="all" className="font-bold text-sm md:text-base text-brand-black dark:text-white cursor-pointer select-none">
                            이용약관, 개인정보 수집/이용, 제3자 제공, 마케팅 정보제공에 모두 동의합니다.
                        </label>
                    </div>

                    <div className="space-y-6">
                        {/* Service Terms */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center space-x-2 font-bold text-sm text-brand-black dark:text-gray-200 cursor-pointer select-none">
                                    <span className="text-brand-yellow transform scale-110 mr-1">●</span> [필수] 서비스 이용약관
                                </label>
                                <input
                                    type="checkbox"
                                    checked={agreements.service}
                                    onChange={() => handleAgreementChange('service')}
                                    className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded cursor-pointer accent-brand-yellow"
                                />
                            </div>
                            <div className="h-24 overflow-y-auto bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-600 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                제1조 (목적) 본 약관은 나다커피(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
                                <br />제2조 (약관의 효력) 본 약관은 서비스를 이용하고자 하는 모든 회원에게 효력이 발생합니다.
                                <br />... (이하 생략)
                            </div>
                        </div>

                        {/* Privacy Terms */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center space-x-2 font-bold text-sm text-brand-black dark:text-gray-200 cursor-pointer select-none">
                                    <span className="text-brand-yellow transform scale-110 mr-1">●</span> [필수] 개인정보 수집 및 이용 동의
                                </label>
                                <input
                                    type="checkbox"
                                    checked={agreements.privacy}
                                    onChange={() => handleAgreementChange('privacy')}
                                    className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded cursor-pointer accent-brand-yellow"
                                />
                            </div>
                            <div className="h-24 overflow-y-auto bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-600 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                1. 수집하는 개인정보 항목: 이름, 이메일, 휴대전화번호, 비밀번호 등
                                <br />2. 수집 및 이용 목적: 회원제 서비스 제공, 본인확인, 구매 및 요금결제 등
                                <br />3. 보유 및 이용 기간: 회원탈퇴 시 까지 (단, 법령에 특별한 규정이 있는 경우 관련 법령에 따름)
                            </div>
                        </div>

                        {/* Third Party Terms */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center space-x-2 font-bold text-sm text-brand-black dark:text-gray-200 cursor-pointer select-none">
                                    <span className="text-brand-yellow transform scale-110 mr-1">●</span> [필수] 개인정보 제3자 제공 동의
                                </label>
                                <input
                                    type="checkbox"
                                    checked={agreements.thirdParty}
                                    onChange={() => handleAgreementChange('thirdParty')}
                                    className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded cursor-pointer accent-brand-yellow"
                                />
                            </div>
                            <div className="h-24 overflow-y-auto bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-600 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                회사는 고객님의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 배송 업무 등 서비스 이행을 위해 필요한 경우 제한적으로 제공될 수 있습니다.
                            </div>
                        </div>

                        {/* Marketing Terms */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center space-x-2 font-bold text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                    <span className="text-gray-400 mr-1">●</span> [선택] 마케팅 정보제공 동의
                                </label>
                                <input
                                    type="checkbox"
                                    checked={agreements.marketing}
                                    onChange={() => handleAgreementChange('marketing')}
                                    className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded cursor-pointer accent-brand-yellow"
                                />
                            </div>
                            <div className="h-24 overflow-y-auto bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-600 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                이벤트 및 혜택 알림, 신규 서비스 안내 등 다양한 정보를 받아보실 수 있습니다.
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button
                            onClick={handleCancel}
                            className="flex-1 py-4 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-white font-bold rounded-xl transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleNextStep}
                            className="flex-[2] py-4 bg-brand-yellow text-brand-black hover:bg-yellow-400 font-black rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                            다음 단계로
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Form (High Fidelity Design)
    return (
        <div className="min-h-screen pt-24 pb-20 flex flex-col items-center bg-gray-50 dark:bg-zinc-900 px-4">

            {/* Main Content Area */}
            <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-b-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-700 flex flex-col">

                {/* Mega Banner */}
                <div className="h-36 bg-zinc-800 flex items-center justify-center text-white/40 text-lg tracking-[0.2em] font-bold">
                    NADA BRAND MEGA VISUAL
                </div>

                <div className="p-10 md:p-14 flex-1">
                    <h2 className="text-center text-brand-black dark:text-white mb-8 text-2xl md:text-3xl font-black tracking-tight">회원정보 입력</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="relative">
                            <label className="block font-extrabold text-sm mb-2 text-brand-black dark:text-white">이름<span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                placeholder="성함을 입력해주세요 (한글 최대 6자)"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-700/50 border-[1.5px] border-gray-200 dark:border-zinc-600 rounded-xl text-brand-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow transition-colors"
                            />
                        </div>

                        {/* ID (Email for now based on previous code, but design says ID with duplicate check) */}
                        <div className="relative">
                            <label className="block font-extrabold text-sm mb-2 text-brand-black dark:text-white">아이디 (이메일)<span className="text-red-500">*</span></label>
                            <div className="flex gap-3">
                                <input
                                    type="text" // changed from email to text to allow generic ID if needed, but keeping email logic for now
                                    name="email"
                                    placeholder="영문/숫자 6~20자"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-700/50 border-[1.5px] border-gray-200 dark:border-zinc-600 rounded-xl text-brand-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={handleDuplicateCheck}
                                    className="w-28 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors"
                                >
                                    중복확인
                                </button>
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-extrabold text-sm mb-2 text-brand-black dark:text-white">비밀번호<span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="영문/숫자/특수문자 8~20자"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-700/50 border-[1.5px] border-gray-200 dark:border-zinc-600 rounded-xl text-brand-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block font-extrabold text-sm mb-2 text-brand-black dark:text-white">비밀번호 확인<span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    name="passwordConfirm"
                                    placeholder="비밀번호 재입력"
                                    required
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-700/50 border-[1.5px] border-gray-200 dark:border-zinc-600 rounded-xl text-brand-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow transition-colors"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="relative">
                            <label className="block font-extrabold text-sm mb-2 text-brand-black dark:text-white">휴대폰 번호<span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="010-0000-0000"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={13}
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-700/50 border-[1.5px] border-gray-200 dark:border-zinc-600 rounded-xl text-brand-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow transition-colors"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mt-10">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] bg-brand-yellow text-brand-black font-black py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg text-lg"
                            >
                                회원가입 완료
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Welcome Alert Overlay */}
            {showSuccessAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[25px] w-full max-w-sm p-8 text-center shadow-2xl border-t-8 border-brand-yellow animate-in zoom-in-95 duration-200 relative">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-black text-brand-black mb-2">가입을 축하합니다!</h3>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            나다커피의 새로운 가족이<br />되신 것을 진심으로 환영합니다.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            확인 (메인이동)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignUp;
