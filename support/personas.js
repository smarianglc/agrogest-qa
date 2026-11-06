// Personas da especificação e do seed da API (dados fictícios, domínio .test)
const SENHA_SEED = process.env.SENHA_SEED || 'Agro@2026';

const PERSONAS = {
  roberto: { email: 'roberto@boasafra.test', fazenda: 'Fazenda Boa Safra', perfil: 'ADMIN' },
  juliana: { email: 'juliana@agrogest.test', fazenda: 'Fazenda Boa Safra', perfil: 'AGRONOMO' }, // vínculo também na Rio Verde
  carlos: { email: 'carlos@boasafra.test', fazenda: 'Fazenda Boa Safra', perfil: 'FINANCEIRO' },
  helena: { email: 'helena@rioverde.test', fazenda: 'Fazenda Rio Verde', perfil: 'ADMIN' },
  tiago: { email: 'tiago@rioverde.test', fazenda: 'Fazenda Rio Verde', perfil: 'AGRONOMO' },
  sandra: { email: 'sandra@rioverde.test', fazenda: 'Fazenda Rio Verde', perfil: 'FINANCEIRO' },
};

module.exports = { PERSONAS, SENHA_SEED };
