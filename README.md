# Annecy Media SDK for React Native

## Install

```bash
$ npm i react-native-annecy-media --save
```

### iOS

Add `annecy.media` to your `NSExceptionDomains` in your project's `Info.plist`.

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>annecy.media</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

## View tracking example

This JSX shows an example offerwall component:

```javascript
import {
    AnnecyService,
    TrackingView
} from 'react-native-annecy-media';

import {
    ListView,
    RefreshControl
} from 'react-native';

export default class YourCustomOfferWall extends Component {
    constructor(props) {
        super(props);

        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: this._ds.cloneWithRows(props.offers)
        };
    }

    _renderRow(offer) {
        return (
            <TrackingView id={offer.id}>
                <YourCustomRow offer={offer} />
            </TrackingView>
        );
    }

    _renderRefreshControl() {
        return (
            <RefreshControl
                refreshing={this.props.refreshOffers}
                onRefresh={this._onRefresh.bind(this)} />
        );
    }

    render() {
        return (
            <ListView
                dataSource={this.state.dataSource}
                renderRow={this._renderRow.bind(this)}
                onScroll={() => AnnecyService.onScroll()} // Do not bind!
                refreshControl={this._renderRefreshControl()} />
        );
    }
}
```

You can use it like this:

```javascript
import {
    AnnecyService,
    TrackingView
} from 'react-native-annecy-media';

export default class YourCustomApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            offers: []
        };

        AnnecyService.init({
            country: 'GB',
            idfaGaid: 'idfa-or-gaid',
            locale: 'en',
            token: 'annecy-token',
            userId: 'user-id'
        });

        this._refreshOffers();
    }

    _refreshOffers() {
        AnnecyService.resetViews();
        YourOfferFactory.getOffers().then(({offers, requestId}) => {
            AnnecyService.setRequestId(requestId);
            this.setState({offers: offers});
        });
    }

    render() {
        return (
            <YourCustomOfferWall
                offers={this.state.offers}
                refreshOffers={this._refreshOffers.bind(this)} />
        );
    }
}
```