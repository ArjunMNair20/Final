import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh optimizations
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],
  optimizeDeps: {
    // Include dependencies for pre-bundling
    include: ['react', 'react-dom', 'react-router-dom'],
    // Exclude lucide-react from pre-bundling to allow better tree-shaking
    exclude: ['lucide-react'],
    // Force optimization for better performance
    force: false,
  },
  build: {
    // Use modern targets for smaller bundles
    target: 'esnext',
    // Use esbuild for faster minification
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Disable source maps for production (smaller builds)
    sourcemap: false,
    // Report compressed size
    reportCompressedSize: true,
    // Rollup optimizations
    rollupOptions: {
      output: {
        // Better chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }
        },
        // Optimize chunk loading
        experimentalMinChunkSize: 20000,
        },
      },
    esbuild: {
      // Remove console/debugger statements for smaller bundles
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      // Legal comments for production
      legalComments: 'none',
      // Tree-shaking optimizations
      treeShaking: true,
    },
    // Enable terser-like optimizations
    terserOptions: undefined,
  },
  // CSS optimization
  css: {
    devSourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
