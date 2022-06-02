import * as Joi from 'joi'

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number(),
  SECRET_KEY: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),

  MONGO_DATABASE_URL: Joi.string().required(),
  MONGO_DATABASE_TEST_URL: Joi.string().required(),
  PASSWORD_RESET_URL: Joi.string().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM: Joi.string().required()
})

export const dtoValidationMessages = {
  mandatoryEmail: 'E-mail é obrigatório e deve estar em formato adequado',
  mandatoryPassword: 'Senha é obrigatória',
  mandatoryPasswordConfirmation: 'Confirmação de senha é obrigatória',
  mandatoryThirdPartyCredential: 'Credencial de serviço terceiro obrigatória',

  mandatoryLayers: 'Lista de camadas é obrigatória',
  mandatorySearchArea: 'Área de busca é obrigatória'
}
