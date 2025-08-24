module.exports = {
    env: {
        node: true,
        'vue/setup-compiler-macros': true
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended'
    ],
    rules: {
        'vue/script-setup-uses-vars': 'error'
    },
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineModel: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly'
    }
}