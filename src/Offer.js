//  Created by Tobias Schultka
//  Copyright © 2017 annecy.media. All rights reserved.

export default class Offer {
    constructor(offerJson) {
        this.attributes = offerJson.attributes || {};
        this.costType = offerJson.cost_type || 'cpa';
        this.credits = offerJson.credits || 0;
        this.ctaText = offerJson.cta_text || null;
        this.ctaTitle = offerJson.cta_title || null;
        this.id = offerJson.campaign_uuid;
        this.imageUrl = offerJson.image_url || 'https://admin.annecy.media/images/logo-colored.png';
        this.isLazy = !!offerJson.lazy;
        this.isVisible = !offerJson.lazy;
        this.lazyId = offerJson.lazy_id || null;
        this.payout = offerJson.payout || 0;
        this.text = offerJson.text || '';
        this.title = offerJson.title || '';
        this.trackingUrl = offerJson.tracking_url;
        this.type = offerJson.type || Offer.TYPE.OFFER;
    }

    /**
     * Type.
     */
    static get TYPE() {
        return {
            OFFER: 'offer'
        };
    }
}
