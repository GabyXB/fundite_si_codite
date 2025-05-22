const APP_VARIANT = process.env.APP_VARIANT || 'main';

module.exports = ({ config }) => {
  let name = 'FunditeSiCodite';
  let appVariant = 'main'; //main e cealalta
  if (APP_VARIANT === 'operator') {
    name = 'OperatorApp';
    appVariant = 'main';
  }
  return {
    ...config,
    name,
    slug: 'operator-app',
    extra: {
      ...config.extra,
      appVariant,
      eas: {
        projectId: '39e76015-cc29-4850-afaa-f0d664066565',
      },
    },
  };
}; 