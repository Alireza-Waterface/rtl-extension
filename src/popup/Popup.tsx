import { useEffect, useState } from 'react';
import '../styles/globals.css'
import { useStorage } from '../shared/hooks/useStorage';
import { FaPowerOff, FaFont, FaGlobe, FaLayerGroup, FaGithub, FaTelegram, FaLinkedin } from 'react-icons/fa';
import { MdTranslate } from 'react-icons/md';

const Popup = () => {
   const [effectiveStatus, setEffectiveStatus] = useState<boolean>(true);
   const [scope, setScope] = useState<'global' | 'tab'>('global');
   const [loading, setLoading] = useState(true);

   const [useVazir, setUseVazir] = useStorage<boolean>('useVazir', true);
   const [globalEnabled, setGlobalEnabled] = useStorage<boolean>('isEnabled', true);

   useEffect(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
         if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATUS' }, (response) => {
               if (chrome.runtime.lastError) {
                  setLoading(false);
                  return;
               }
               if (response) {
                  setEffectiveStatus(response.effectiveEnabled);
                  if (response.localOverride !== null) {
                     setScope('tab');
                  }
                  setLoading(false);
               }
            });
         }
      });
   }, [globalEnabled]);

   const handleToggle = () => {
      const newStatus = !effectiveStatus;
      setEffectiveStatus(newStatus);

      if (scope === 'global') {
         setGlobalEnabled(newStatus);
         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
               chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_LOCAL_STATE', value: null });
            }
         });
      } else {
         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
               chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_LOCAL_STATE', value: newStatus });
            }
         });
      }
   };

   const handleScopeChange = (newScope: 'global' | 'tab') => setScope(newScope);

   if (loading) return <div className="p-8 text-center text-gray-500">در حال اتصال...</div>;

   return (
      <div className="w-[340px] bg-slate-50 min-h-[300px] flex flex-col font-[Vazirmatn] dir-rtl">

         <header className="bg-white p-3 shadow-sm flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2 text-indigo-600">
               <MdTranslate className="text-2xl" />
               <h1 className="font-bold text-lg">RTL Master</h1>
            </div>
            <p className="text-xs font-mono bg-indigo-50 text-indigo-600 px-2 py-1 rounded">v0.1</p>
         </header>

         <main className="flex-1 p-3 flex flex-col gap-6">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex gap-2">
               <button
                  onClick={() => handleScopeChange('tab')}
                  className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all ${
                  scope === 'tab' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
               >
                  <FaLayerGroup />
                  این تب
               </button>
               <button
                  onClick={() => handleScopeChange('global')}
                  className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all ${
                  scope === 'global' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
               >
                  <FaGlobe />
                  همه تب‌ها
               </button>
            </div>

            <div className="flex flex-col items-center gap-4">
               <button
                  onClick={handleToggle}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all duration-300 border-4 ${
                     (scope === 'global' && globalEnabled) ? 'bg-indigo-600 text-white border-indigo-200 shadow-indigo-200 hover:scale-105' : (scope === 'tab' && effectiveStatus) ? 'bg-indigo-600 text-white border-indigo-200 shadow-indigo-200 hover:scale-105' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                  }`}
               >
                  <FaPowerOff />
               </button>
               <div className="text-center">
                  <h2 className="font-bold text-gray-800 text-base">
                  {
                     (scope === 'global' && globalEnabled) ? 'راست‌چین فعال است'
                     : (scope === 'tab' && effectiveStatus) ? 'راست‌چین فعال است' : 'راست‌چین غیرفعال است'
                  }
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                  {scope === 'global' ? 'تنظیمات روی تمام تب‌ها اعمال می‌شود' : 'تنظیمات فقط روی این تب اعمال می‌شود'}
                  </p>
               </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-700">
                     <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <FaFont />
                     </div>
                     <div className="text-sm font-medium">استفاده از فونت وزیرمتن</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                     <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={useVazir}
                        onChange={(e) => setUseVazir(e.target.checked)}
                     />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
               </div>
            </div>
         </main>

         <footer className='flex flex-col gap-2 items-center p-3 bg-white shadow-sm border-t border-gray-100'>
            <div className='flex gap-2 items-center justify-center'>
               <a href="https://github.com/Alireza-Waterface">
                  <FaGithub className='fill-gray-400 hover:fill-indigo-500 hover:scale-110 transition-all' size={24} />
               </a>
               <a href="https://t.me/Alireza_Waterface">
                  <FaTelegram className='fill-gray-400 hover:fill-indigo-500 hover:scale-110 transition-all' size={24} />
               </a>
               <a href="https://linkedin.com/in/waterface">
                  <FaLinkedin className='fill-gray-400 hover:fill-indigo-500 hover:scale-110 transition-all' size={24} />
               </a>
            </div>
            <div className='text-xs'>
               ساخته شده با ❤️ توسط <a className='text-indigo-500 hover:underline hover:text-indigo-700 transition-all' href="https://waterface.ir">علیرضا آبچهره</a>
            </div>
         </footer>
      </div>
   );
};

export default Popup;