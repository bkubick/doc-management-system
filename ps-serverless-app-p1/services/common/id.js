import * as KSUID from 'ksuid';

export const generateId = () => {
    return KSUID.randomSync().string;
};
