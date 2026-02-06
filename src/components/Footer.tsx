import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer: React.FC = () => {
    return (
        <footer className="bg-brand-dark text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                            <Link to="/" className="flex items-center gap-2 group">
                                <span className="text-3xl font-black tracking-tighter uppercase italic transition-colors text-white">
                                    Nada<span className="text-brand-yellow">Coffee</span>
                                </span>
                            </Link>
                            
                            {/* [수정] mr-[70px]를 추가하여 왼쪽으로 70px 이동 */}
                            <div className="flex space-x-4 sm:mr-[70px]">
                                <a 
                                    href="https://www.instagram.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-zinc-800 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-all"
                                    title="Instagram"
                                >
                                    <FaInstagram size={18} />
                                </a>
                                <a 
                                    href="https://www.facebook.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-zinc-800 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-all"
                                    title="Facebook"
                                >
                                    <FaFacebook size={18} />
                                </a>
                                <a 
                                    href="https://www.youtube.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-zinc-800 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-all"
                                    title="YouTube"
                                >
                                    <FaYoutube size={18} />
                                </a>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                            나다커피는 최고의 맛과 품질을 자랑하는 원두를 직접 볶아 고객님들께 제공합니다.
                            언제나 신선하고 맛있는 커피를 부담 없는 가격에 만나보세요.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-6">INFORMATION</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-brand-yellow transition-colors">이용약관</a></li>
                            <li><a href="#" className="hover:text-brand-yellow transition-colors text-white font-medium">개인정보처리방침</a></li>
                            <li><a href="#" className="hover:text-brand-yellow transition-colors">이메일무단수집거부</a></li>
                            <li><a href="#" className="hover:text-brand-yellow transition-colors">채용안내</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-6">CONTACT US</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>본사: 부산광역시 기장군 기장읍 기장해안로 232</li>
                            <li>가맹사업문의: 1899-1234</li>
                            <li>고객센터: 1544-1234</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>© 2026 NADA COFFEE. ALL RIGHTS RESERVED.</p>
                    <div className="mt-4 md:mt-0 flex space-x-6">
                        <span>Family Site: (주)나다디저트</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
