export default {
  content: ['./src/**/*.{astro,html,svelte,vue,js,ts,jsx,tsx}'],
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  darkMode: ['class', '[data-theme="dark"]'],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#23BFF2',
          secondary: '#FFE45C',
          accent: '#f471b5',
          neutral: '#BDCEE3',
          'base-100': '#ffffff',
          info: '#23BFF2',
          success: '#0DCA7A',
          warning: '#FF9500',
          error: '#F24165',
        },
        dark: {
          primary: '#23BFF2',
          secondary: '#FFE45C',
          accent: '#f471b5',
          neutral: '#BDCEE3',
          'base-100': '#002840',
          'base-content': '#ffffff',
          info: '#23BFF2',
          success: '#0DCA7A',
          warning: '#FF9500',
          error: '#F24165',
        },
      },
    ],
  },
};
