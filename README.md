# Annecy Media SDK for React Native

## Install

```bash
$ npm i react-native-annecy-media --save
```

#### iOS

Add `annecy.media` to your **NSExceptionDomains** in your project's `Info.plist`.

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

## Services and Components

```javascript
import {
    AnnecyService,
    TrackingView
} from 'react-native-annecy-media';
```

#### AnnecyService

| Method | Arguments | Notes |
| ------ | --------- | ----- |
| init   | config&nbsp;`{Object}` | Initialize Annecy Media SDK |
| setRequestId | requestId&nbsp;`{String}` | Set request ID |
| onScroll | none | Tell the SDK, that the user has scrolled the `TableView` |
| resetViews | none | Send all tracked offers to Annecy Media and clear them afterwards |

#### TrackingView

A `TrackingView` will automatically handle views of your offers. Use it as a wrapper around your offer view.

```html
<TrackingView id={offer.id}>
	<Text>{offer.title}</Text>
</TrackingView>

```

| Attribute | Type         | Notes    |
| --------- | ------------ | -------- |
| id        | `{String}`   | Offer ID |

## Examples

#### TrackingView

This JSX shows an example offerwall component:

```javascript
import {
    ListView,
    RefreshControl
} from 'react-native';

export default class YourOfferWall extends Component {
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
                <YourRow offer={offer} />
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

#### AnnecyService

```javascript
export default class YourApp extends Component {
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
            <YourOfferWall
                offers={this.state.offers}
                refreshOffers={this._refreshOffers.bind(this)} />
        );
    }
}

```
