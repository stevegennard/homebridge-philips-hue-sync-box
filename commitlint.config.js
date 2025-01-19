export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'never', '100'],
    'body-max-length': [2, 'never', '100'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
  },
};
