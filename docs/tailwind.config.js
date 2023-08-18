export default {
  content: ['./src/**/*.{astro,html,svelte,vue,js,ts,jsx,tsx}'],
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
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
      },
    ],
  },
};
