const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = !isEnvProduction;
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === 'true' || isEnvDevelopment;
module.exports = {
    isEnvProduction, isEnvDevelopment, shouldUseSourceMap
};


