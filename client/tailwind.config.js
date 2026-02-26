/** @type {import('tailwindcss').Config} */
export default {
  // 这行最关键：告诉引擎去扫描哪些文件里的颜色和排版代码！
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}