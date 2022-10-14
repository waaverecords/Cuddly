/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {},
            brightness: {
                20: '.2',
                25: '.25',
                30: '.3',
                35: '.35',
                40: '.4',
                45: '.45',
            }
        },
    },
    plugins: [],
}
