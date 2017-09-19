//  Created by Tobias Schultka
//  Copyright © 2017 annecy.media. All rights reserved.

const BASE_URL = 'https://api.annecy.media';
const API_VERSION = '1.0';

class RequestService {
    constructor() {
        this._token = null;
    }

    /**
     * Request Annecy Media API.
     *
     * @param  {Object} params
     * @return {Promise}
     */
    request(params) {
        return new Promise((resolve, reject) => {
            let requestUrl = params.path
                ? `${ BASE_URL }${ params.path }`
                : params.url;

            const requestParams = {
                method: params.method || 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${ this._token || '' }`,
                    'Content-Type': 'application/json',
                    'API-VERSION': API_VERSION
                }
            };

            if (params.body) {
                requestParams.body = JSON.stringify(params.body);
            } else if (params.formData) {
                requestParams.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                requestUrl += this._getQueryString(params.formData);
            }

            fetch(requestUrl, requestParams).then((response) => {
                if (response.status >= 400) {
                    return reject(new Error(`HTTP ${ response.status }`));
                }

                response.json().then((responseJson) => {
                    if ((responseJson || {}).data) {
                        resolve(responseJson.data);
                    } else {
                        resolve(responseJson);
                    }
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * Set request token.
     *
     * @param  {String}
     */
    setToken(token) {
        this._token = token;
    }

    /**
     * Get an HTTP GET params string from an object.
     *
     * @param  {Object} formData
     * @return {String}
     */
    _getQueryString(formData) {
        let queryString = '';

        for (let key in formData) {
            if (formData.hasOwnProperty(key)) {
                if (queryString !== '') {
                    queryString += '&';
                }

                queryString += `${ key }=${ encodeURIComponent(formData[key]) }`;
            }
        }

        return queryString ? `?${ queryString }` : '';
    }
}

export default new RequestService();
