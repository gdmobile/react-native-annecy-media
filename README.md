# Annecy Media SDK for React Native

## Install

```bash
$ npm i react-native-annecy-media --save
```

## Services, Models and Views

```javascript
import {
    AnnecyService,
    Offer,
    TrackingView,
} from 'react-native-annecy-media';
```

#### AnnecyService

| Method | Arguments | Notes |
| ------ | --------- | ----- |
| init   | config&nbsp;`{Object}` | Initialize Annecy Media SDK |
| onScroll | none | Tell the SDK, that the user has scrolled a `TableView` |
| getOffers | onLazyOffersLoaded&nbsp;`Function` | Returns a promise that resolves `Offer`s |

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

#### Offer

A `Offer` model represents a campaign.

| Key         | Type        | Example                     |
| ----------- | ----------- | --------------------------- |
| attributes  | `{Object}`  | `{color: '#F00'}`           |
| costType    | `{String}`  | `"cpi"`, `"cpa"`, `"cps"`   |
| credits     | `{Number}`  | `100`                       |
| ctaText     | `{String}`  | `"Finish the task!"`        |
| ctaTitle    | `{String}`  | `"Company Name"`            |
| id          | `{String}`  | `"foo"`                     |
| isVisible   | `{Boolean}` | `true`                      |
| imageUrl    | `{String}`  | `"http://foo.com/bar.png"`  |
| payout      | `{Number}`  | `10`                        |
| text        | `{String}`  | `"Finish the task"`         |
| title       | `{String}`  | `"Company Name"`            |
| trackingUrl | `{String}`  | `"http://foo.com/bar.html"` |
| type        | `{String}`  | `Offer.TYPE.OFFER`          |

## Example

```javascript
export default class AppView extends Component {
    constructor(props) {
        super(props);

        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            isRefreshing: true,
            offers: this._ds.cloneWithRows([])
        };

        AnnecyService.init({
            country: 'US',
            idfaGaid: '00000000-0000-0000-0000-000000000000',
            locale: 'en',
            token: 'annecy-media-token',
            userId: 'foo'
        });
    }

    componentDidMount() {
        this._refreshOffers();
    }

    _refreshOffers() {
        this.setState({isRefreshing: true});

        AnnecyService.getOffers((updatedOffers) => {
            this.setState({offers: this._ds.cloneWithRows(updatedOffers)});
        }).then((offers) => {
            this.setState({
                isRefreshing: false,
                offers: this._ds.cloneWithRows(offers)
            });
        }).catch(() => {
            this.setState({isRefreshing: false});
        });
    }

    _renderRow(offer) {
        if (!offer.isVisible || offer.type !== Offer.TYPE.OFFER) {
            return null;
        }

        return (
            <TrackingView id={offer.id}>
                <YourCustomRow offer={offer} />
            </TrackingView>
        );
    }

    _renderRefreshControl() {
        return (
            <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this._refreshOffers.bind(this)} />
        );
    }

    render() {
        return (
            <ListView
                dataSource={this.state.offers}
                renderRow={this._renderRow.bind(this)}
                onScroll={() => AnnecyService.onScroll()} // Do not bind!
                refreshControl={this._renderRefreshControl()} />
        );
    }
}

```
