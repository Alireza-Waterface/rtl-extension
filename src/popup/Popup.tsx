export default function Popup() {
   return (
      <div className="w-80 p-4 font-sans text-right">
         <h1 className="text-xl font-bold text-blue-600 mb-2">تنظیمات RTL</h1>
         <p className="text-sm text-gray-600">
            نسخه اولیه با Tailwind v4 و React 19
         </p>
         <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
            تست دکمه
         </button>
      </div>
   );
}
