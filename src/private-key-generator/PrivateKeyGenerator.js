const { Validation } = require('monet');

const CryptID = require('@cryptid/cryptid-js');

const logger = require('../logger');
const { IbeExtractError, MissingParametersError } = require('../exception');
const { IbeParametersService } = require('../ibe-parameters/IbeParametersService');

const makePrivateKeyGenerator = function makePrivateKeyGenerator({ IbeParametersService, CryptID }) {
    return {
        async generate(parametersId, identity) {
            const parameters = await IbeParametersService.getParametersForId(parametersId);

            logger.info('Extracting private key for identity.', { identity });

            if (parameters.isNothing()) {
                return Validation.Fail(MissingParametersError(parametersId));
            }

            const client = await CryptID.getInstance();

            const convertedIdentity = identity; // IdentityConverter.convert(identity);

            const { success, privateKey } = client.extract(parameters.just().publicParameters, parameters.just().masterSecret, convertedIdentity);

            if (!success) {
                logger.info('Could not extract private key for identity.', { id });
            }

            return success ? Validation.Success(privateKey) : Validation.Fail(IbeExtractError(parametersId, identity));
        }
    };
};

module.exports = {
    makePrivateKeyGenerator,
    PrivateKeyGenerator: makePrivateKeyGenerator({ IbeParametersService, CryptID })
};
