//  Created by Tobias Schultka
//  Copyright © 2017 annecy.media. All rights reserved.

import {
    AppState,
    Platform
} from 'react-native';

const BASE_URL = 'https://api.annecy.media';
const API_VERSION = '1.0';

class AnnecyService {
    constructor() {
        this._config = null;
        this._hasScrolledSinceLastTracking = true;
        this._requestId = null;
        this._trackedOffers = [];
        this._trackingChecker = [];

        // Views will be tracked every 800 milliseconds.
        setInterval(this._trackViews.bind(this), 800);

        // Views will be sent to API every 30 seconds, if there are new.
        setInterval(this.sendViews.bind(this), 30000);

        // Views will be sent to API, as soon as the user put the app in background.
        AppState.addEventListener('change', (currentAppState) => {
            if (currentAppState === 'inactive' || currentAppState === 'background') {
                this.sendViews();
            }
        });
    }

    /**
     * Set request ID.
     *
     * @param {Object} config
     */
    init(config) {
        this._config = config;
    }

    /**
     * Set request ID.
     */
    setRequestId(requestId) {
        this._requestId = requestId;
    }

    /**
     * Detect when list view has scrolled.
     */
    onScroll() {
        this._hasScrolledSinceLastTracking = true;
    }

    /**
     * Add tracking checker.
     *
     * @param {Function} trackingChecker
     */
    addTrackingChecker(trackingChecker) {
        this._trackingChecker.push(trackingChecker);
    }

    /**
     * Remove tracking checker.
     *
     * @param  {Function} trackingChecker
     */
    removeTrackingChecker(trackingChecker) {
        const index = this._trackingChecker.indexOf(trackingChecker);

        if (index > -1) {
            this._trackingChecker.splice(index, 1);
        }
    }

    /**
     * Send views to Annecy API and reset tracked offer IDs.
     */
    resetViews() {
        this.sendViews();
        this._hasScrolledSinceLastTracking = true;
        this._trackedOffers = [];
    }

    /**
     * Track offer ID.
     *
     * @param {String} offerId
     */
    trackOfferId(offerId) {
        if (typeof offerId === 'string') {
            let isOfferAlreadyTracked = false;

            this._trackedOffers.forEach((trackedOffer) => {
                if (trackedOffer.uuid === offerId) {
                    isOfferAlreadyTracked = true;
                }
            });

            if (!isOfferAlreadyTracked) {
                this._trackedOffers.push({
                    isNew: true,
                    uuid: offerId,
                    view_time: Math.round(((new Date()).valueOf()) / 1000)
                });
            }
        }
    }

    /**
     * Send views to Annecy API.
     */
    sendViews() {
        if (typeof this._config !== 'object' || this._requestId === null) {
            return;
        }

        const newTrackedOffers = [];

        this._trackedOffers.forEach((trackedOffer) => {
            if (trackedOffer.isNew) {
                delete trackedOffer.isNew;
                newTrackedOffers.push(trackedOffer);
            }
        });

        if (newTrackedOffers.length === 0) {
            return;
        }

        const requestParams = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${ this._config.token || '' }`,
                'Content-Type': 'application/json',
                'API-VERSION': API_VERSION
            },
            body: JSON.stringify({
                offers: newTrackedOffers,
                params: {
                    advertiser_id: this._config.idfaGaid || '',
                    country: this._config.country || '',
                    locale: this._config.locale || '',
                    platform: Platform.OS,
                    user_id: this._config.userId || ''
                },
                request_id: this._requestId
            })
        };

        fetch(`${ BASE_URL }/views`, requestParams).then(() => null).catch(() => {
            // TODO: handle errors!
        });
    }

    /**
     * Start view tracking.
     */
    _trackViews() {
        if (this._hasScrolledSinceLastTracking) {
            this._hasScrolledSinceLastTracking = false;
            this._trackingChecker.forEach((trackingChecker) => {
                trackingChecker();
            });
        }
    }
}

export default new AnnecyService();
