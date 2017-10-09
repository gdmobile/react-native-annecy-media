//  Created by Tobias Schultka
//  Copyright © 2017 annecy.media. All rights reserved.

import LazyOffer from './LazyOffer.js';
import Offer from './Offer.js';
import RequestService from './RequestService.js';
import {
    AppState,
    Platform
} from 'react-native';

class AnnecyService {
    constructor() {
        this._config = null;
        this._hasScrolledSinceLastTracking = true;
        this._offerRequestCount = 0;
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
        RequestService.setToken(config.token);
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
     * @param {Function} trackingChecker
     */
    removeTrackingChecker(trackingChecker) {
        const index = this._trackingChecker.indexOf(trackingChecker);

        if (index > -1) {
            this._trackingChecker.splice(index, 1);
        }
    }

    /**
     * Reset tracked offer IDs.
     */
    _resetViews() {
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
     * Get offers.
     *
     * @param  {Function} onLazyOffersLoaded
     * @return {Promise}
     */
    getOffers(onLazyOffersLoaded) {
        return new Promise((resolve, reject) => {
            this.sendViews();
            this._resetViews();
            this._offerRequestCount++;

            const formData = {
                advertiser_id: this._config.idfaGaid || '',
                country: this._config.country || '',
                locale: this._config.locale || '',
                platform: Platform.OS,
                user_id: this._config.userId || '',
            };

            RequestService.request({
                method: 'GET',
                path: '/offers',
                formData: formData
            }).then((offersJson) => {
                this._getOffersFromOffersJson(
                    offersJson,
                    this._offerRequestCount,
                    onLazyOffersLoaded
                ).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * Get offers from offers JSON.
     *
     * @param  {Object} offersJson
     * @param  {Number} offerRequestCount
     * @param  {Function} onLazyOffersLoaded
     * @return {Promise}
     */
    _getOffersFromOffersJson(offersJson, offerRequestCount, onLazyOffersLoaded) {
        return new Promise((resolve, reject) => {
            const offers = [];

            if (typeof offersJson !== 'object') {
                return reject();
            }

            (offersJson.offers || []).forEach((offerJson) => {
                if (typeof offerJson === 'object') {
                    offers.push(new Offer(offerJson));
                }
            });

            if (typeof offersJson.request_id === 'string') {
                this._requestId = offersJson.request_id;
            }

            (offersJson.lazy_calls || []).forEach((lazyUrl) => {
                this._getLazyOffers(lazyUrl).then((lazyOffers) => {

                    // Make sure, that user hasn't refreshed offers since last request.
                    if (this._offerRequestCount !== offerRequestCount) {
                        return;
                    }

                    // Replace tracking URL keys with values from lazy advertisers.
                    lazyOffers.forEach((lazyOffer) => {
                        offers.forEach((offer, index) => {
                            if (offer.lazyId !== lazyOffer.lazyId) {
                                return;
                            }

                            lazyOffer.fields.forEach((field) => {
                                offer.trackingUrl = offer.trackingUrl.replace(field.key, field.value);
                            });

                            offer.isVisible = true;
                        });
                    });

                    onLazyOffersLoaded(offers);

                }).catch(() => null);
            });

            this._hasScrolledSinceLastTracking = true;
            resolve(offers);
        });
    }

    /**
     * Get lazy offers.
     *
     * @param  {String} lazyUrl
     * @return {Promise}
     */
    _getLazyOffers(lazyUrl) {
        return new Promise((resolve, reject) => {
            RequestService.request({
                method: 'GET',
                url: lazyUrl
            }).then((lazyOffersJson) => {
                const lazyOffers = [];

                if (typeof lazyOffersJson === 'object') {
                    (lazyOffersJson.lazy_offers || []).forEach((lazyOfferJson) => {
                        lazyOffers.push(new LazyOffer(lazyOfferJson));
                    });
                }

                this._hasScrolledSinceLastTracking = true;
                resolve(lazyOffers);
            }).catch(reject);
        });
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

        const body = {
            offers: newTrackedOffers,
            params: {
                advertiser_id: this._config.idfaGaid || '',
                country: this._config.country || '',
                locale: this._config.locale || '',
                platform: Platform.OS,
                user_id: this._config.userId || ''
            },
            request_id: this._requestId
        };

        RequestService.request({
            method: 'POST',
            path: '/views',
            body: body
        }).then(() => null).catch(() => null);
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
