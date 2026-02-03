import { useEffect, useState } from 'react';
import '../styles/globals.css'
import { useStorage } from '../shared/hooks/useStorage';
import { FaPowerOff, FaFont, FaGlobe, FaLayerGroup, FaGithub, FaTelegram, FaLinkedin } from 'react-icons/fa';
import { MdTranslate } from 'react-icons/md';

const Popup = () => {
   const [scope, setScope] = useState<'global' | 'tab'>('global');
   const [loading, setLoading] = useState(true);

   const [tabEffectiveStatus, setTabEffectiveStatus] = useState<boolean>(true);
   const [localOverride, setLocalOverride] = useState<boolean | null>(null);

   const [useVazir, setUseVazir] = useStorage<boolean>('useVazir', true);
   const [globalEnabled, setGlobalEnabled] = useStorage<boolean>('isEnabled', true);

   const fetchTabStatus = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
         if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATUS' }, (response) => {
               if (!chrome.runtime.lastError && response) {
                  setTabEffectiveStatus(response.effectiveEnabled);
                  setLocalOverride(response.localOverride);
               }
               setLoading(false);
            });
         } else {
            setLoading(false);
         }
      });
   };

   useEffect(() => {
      fetchTabStatus();
   }, [globalEnabled]);

   const handleToggle = () => {
      if (scope === 'global') {
         const newGlobalStatus = !globalEnabled;
         setGlobalEnabled(newGlobalStatus);
      } else {
         const newLocalStatus = !tabEffectiveStatus;
         setTabEffectiveStatus(newLocalStatus);
         setLocalOverride(newLocalStatus);

         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
               chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_LOCAL_STATE', value: newLocalStatus }, () => {
                  fetchTabStatus();
               });
            }
         });
      }
   };

   const resetToGlobal = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
         if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_LOCAL_STATE', value: null }, () => {
               fetchTabStatus();
            });
         }
      });
   };

   const isButtonActive = scope === 'global' ? globalEnabled : tabEffectiveStatus;

   const hasOverride = localOverride !== null;

   if (loading) return <div className="p-8 text-center text-gray-500 font-[Vazirmatn]">در حال اتصال...</div>;

   return (
      <div className="w-[340px] bg-slate-50 min-h-[300px] flex flex-col font-[Vazirmatn] dir-rtl text-right">

         <header className="bg-white p-3 shadow-sm flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2 text-indigo-600">
               <MdTranslate className="text-2xl" />
               <h1 className="font-bold text-lg leading-none">RTL Master</h1>
            </div>
            <p className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">v0.1</p>
         </header>

         <main className="flex-1 p-3 flex flex-col gap-5">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex gap-1">
               <button
                  onClick={() => setScope('tab')}
                  className={`relative flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all ${
                  scope === 'tab' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
               >
                  <FaLayerGroup size={14} />
                  این تب
                  {hasOverride && (
                     <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${scope === 'tab' ? 'bg-white animate-pulse' : 'bg-indigo-600'}`}></span>
                  )}
               </button>
               <button
                  onClick={() => setScope('global')}
                  className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all ${
                  scope === 'global' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
               >
                  <FaGlobe size={14} />
                  همه تب‌ها
               </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
               <button
                  onClick={handleToggle}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all duration-500 border-4 cursor-pointer active:scale-95 ${
                     isButtonActive
                        ? 'bg-indigo-600 text-white border-indigo-100 shadow-indigo-200'
                        : 'bg-white text-gray-300 border-gray-100 shadow-none'
                  }`}
               >
                  <FaPowerOff />
               </button>

               <div className="text-center">
                  <h2 className={`font-bold text-base transition-colors ${isButtonActive ? 'text-gray-800' : 'text-gray-400'}`}>
                     {isButtonActive ? 'راست‌چین فعال است' : 'راست‌چین غیرفعال است'}
                  </h2>
                  <div className="flex flex-col items-center gap-1 mt-1">
                     <p className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {scope === 'global' ? 'در حال مدیریت تنظیمات کلی' : 'در حال مدیریت اختصاصی این تب'}
                     </p>
                     {scope === 'tab' && hasOverride && (
                        <button
                           onClick={resetToGlobal}
                           className="text-xs text-indigo-600 hover:underline mt-1 cursor-pointer"
                        >
                           پاک کردن اورراید و بازگشت به تنظیمات کلی
                        </button>
                     )}
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-700">
                     <div className={`p-2 rounded-lg transition-colors ${useVazir ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                        <FaFont size={14} />
                     </div>
                     <span className="text-sm font-medium">فونت وزیرمتن</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                     <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={useVazir}
                        onChange={(e) => setUseVazir(e.target.checked)}
                     />
                     <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[19px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
               </div>
            </div>
         </main>

         <footer className='flex flex-col gap-2 items-center p-3 shadow-lg bg-white border-t border-gray-100'>
            <div className='flex gap-2 items-center justify-center *:hover:scale-110'>
               <a href="https://github.com/Alireza-Waterface" target="_blank" rel="noreferrer">
                  <FaGithub className='text-gray-400 hover:text-indigo-600 transition-colors' size={24} />
               </a>
               <a href="https://t.me/Alireza_Waterface" target="_blank" rel="noreferrer">
                  <FaTelegram className='text-gray-400 hover:text-indigo-600 transition-colors' size={24} />
               </a>
               <a href="https://linkedin.com/in/waterface" target="_blank" rel="noreferrer">
                  <FaLinkedin className='text-gray-400 hover:text-indigo-600 transition-colors' size={24} />
               </a>
            </div>
            <div className='text-xs text-gray-500'>
               ساخته شده توسط <a className='text-indigo-500 hover:underline font-bold' href="https://waterface.ir" target="_blank" rel="noreferrer">علیرضا آبچهره</a>
            </div>
         </footer>
      </div>
   );
};

export default Popup;