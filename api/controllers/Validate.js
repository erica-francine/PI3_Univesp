const Joi = require('@hapi/joi');

module.exports = {
    // Validação para registro de usuário
    registerValidate: (data) => {
        const schema = Joi.object({
            nome: Joi.string().min(3).required(), // Nome com no mínimo 3 caracteres
            cpf: Joi.string().pattern(/^\d{11}$/).required().messages({
                'string.pattern.base': 'CPF deve conter exatamente 11 dígitos numéricos'
            }), // CPF com 11 dígitos numéricos
            email: Joi.string().email().required(), // Valida se é um email
            telefone: Joi.string().pattern(/^\d{10,11}$/).required().messages({
                'string.pattern.base': 'Telefone deve conter 10 ou 11 dígitos numéricos'
            }), // Telefone com 10 ou 11 dígitos numéricos
            sexo: Joi.string().valid('Masculino', 'Feminino', 'Outro').required(), // Valores permitidos para sexo
            dataNascimento: Joi.date().required().messages({
                'date.base': 'Data de nascimento deve ser uma data válida'
            }), // Data de nascimento obrigatória
            senha: Joi.string().min(8).required(), // Senha com no mínimo 8 caracteres
            status: Joi.boolean().default(true) // Booleano com valor padrão
        });

        return schema.validate(data);
    },

    // Validação para login de usuário
    loginValidate: (data) => {
        const schema = Joi.object({
            cpf: Joi.string().pattern(/^\d{11}$/).required().messages({
                'string.pattern.base': 'CPF deve conter exatamente 11 dígitos numéricos'
            }), // CPF com 11 dígitos numéricos
            senha: Joi.string().min(8).required().messages({
                'string.min': 'A senha deve ter no mínimo 8 caracteres'
            }) // Senha com no mínimo 8 caracteres
        });

        return schema.validate(data);
    }
};