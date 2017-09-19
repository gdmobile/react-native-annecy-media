//  Created by Tobias Schultka
//  Copyright © 2017 annecy.media. All rights reserved.

export default class LazyOffer {
    constructor(lazyOfferJson) {
        this.lazyId = lazyOfferJson.lazy_id;

        this.fields = [];
        (lazyOfferJson.fields || []).forEach((fieldJson) => {
            this.fields.push({
                key: fieldJson.search,
                value: fieldJson.replace
            });
        });
    }
}
