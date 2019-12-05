import axios from 'axios'

const network = (urlDefault) => {
    const retornar = {};

    retornar.connect = (options) => {
        options = typeof options == "undefined" ? {} : options;
        const optionsDefault = {}
        
        const optionsUse = Object.assign(options, optionsDefault);

        optionsUse.url = urlDefault + optionsUse.url;

        return axios(optionsUse);
    }

    return retornar;
}

export default network;