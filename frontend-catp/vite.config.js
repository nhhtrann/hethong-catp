import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Tăng mức cảnh báo dung lượng file để tránh console báo chữ vàng
    chunkSizeWarningLimit: 1500, 
    rollupOptions: {
      output: {
        // Thuật toán "Chia để trị" (Code Splitting)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Tách riêng cục Ant Design nặng nề ra một file
            if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) {
              return 'vendor_antd';
            }
            // Tách riêng thư viện vẽ biểu đồ
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor_recharts';
            }
            // Tách riêng nhân cốt lõi của React
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor_react';
            }
            // Gộp các thư viện lặt vặt còn lại
            return 'vendor_other';
          }
        }
      }
    }
  }
})