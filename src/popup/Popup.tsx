import { MdTranslate } from "react-icons/md";
import { useStorage } from "../shared/hooks/useStorage";
import { FaAlignRight, FaCog, FaGithub, FaLinkedin, FaPowerOff, FaTelegram } from "react-icons/fa";

export default function Popup() {
   const [isEnabled, setIsEnabled] = useStorage<boolean>('isEnabled', true);

   return (
      <div className="w-[320px] bg-slate-50 min-h-[300px] flex flex-col font-[Vazirmatn]">
         <header className="bg-white p-3 shadow-sm flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2 text-indigo-600">
               <MdTranslate className="text-2xl" />
               <h1 className="font-bold text-lg tracking-tight">RTL Master</h1>
            </div>
            <button
               onClick={() => chrome.runtime.openOptionsPage()}
               className="text-gray-400 hover:text-indigo-600 transition p-1 cursor-pointer"
               title="تنظیمات"
            >
               <FaCog size={20} />
            </button>
         </header>

         <main className="flex-1 p-6 flex flex-col items-center justify-center gap-6">
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isEnabled ? 'bg-indigo-50 shadow-indigo-100' : 'bg-gray-100 shadow-gray-200'} shadow-xl`}>
               <div className={`absolute inset-0 rounded-full border-4 border-dashed animate-[spin_10s_linear_infinite] opacity-30 ${isEnabled ? 'border-indigo-400' : 'border-gray-300'}`}></div>
               <FaAlignRight className={`text-6xl transition-colors duration-300 ${isEnabled ? 'text-indigo-600' : 'text-gray-400'}`} />
            </div>

            <div className="text-center space-y-1">
               <h2 className="text-xl font-semibold text-gray-800">
                  {isEnabled ? 'اکستنشن فعال است' : 'اکستنشن غیرفعال است'}
               </h2>
               <p className="text-xs text-gray-500 px-8">
                  {isEnabled
                  ? 'متون فارسی در صفحات وب به صورت خودکار راست‌چین می‌شوند.'
                  : 'برای فعال‌سازی مجدد دکمه زیر را بزنید.'}
               </p>
            </div>

            <button
               onClick={() => setIsEnabled(!isEnabled)}
               className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-bold cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 ${
                  isEnabled
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
               }`}
            >
               <FaPowerOff className={isEnabled ? '' : 'text-gray-400'} />
               <span>{isEnabled ? 'غیرفعال کردن' : 'فعال کردن'}</span>
            </button>
         </main>

         <footer className="p-3 text-center text-xs text-gray-400 border-t border-gray-100 bg-white flex flex-col gap-2">
            <div className="flex justify-center items-center gap-2">
               <a href="https://github.com/Alireza-Waterface" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-1 hover:text-gray-600 transition cursor-pointer">
               <FaGithub size={20} />
            </a>
            <a href="https://t.me/Alireza_Waterface" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-1 hover:text-gray-600 transition cursor-pointer">
               <FaTelegram size={20} />
            </a>
            <a href="https://linkedin.com/in/waterface" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-1 hover:text-gray-600 transition cursor-pointer">
               <FaLinkedin size={20} />
            </a>
            </div>

            <span>نسخه 0.1.0 • توسعه داده شده با ❤️</span>
         </footer>
      </div>
   );
}
