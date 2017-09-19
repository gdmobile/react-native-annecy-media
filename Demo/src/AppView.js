//  Created by Tobias Schultka
//  Copyright © 2017 annecy.media. All rights reserved.

import React, {Component} from 'react';
import {
    AnnecyService,
    Offer,
    TrackingView
} from 'react-native-annecy-media';
import {
    Linking,
    ListView,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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
            userId: '1'
        });
    }

    /**
     * Load offers as soon as component is mounted.
     */
    componentDidMount() {
        this._refreshOffers();
    }

    /**
     * Refresh offers.
     */
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

    /**
     * Render offer row.
     *
     * @param  {Offer} offer
     * @return {Object}
     */
    _renderRow(offer) {
        if (!offer.isVisible || offer.type !== Offer.TYPE.OFFER) {
            return null;
        }

        return (
            <TrackingView id={offer.id}>
                <TouchableOpacity
                    onPress={() => Linking.openURL(offer.trackingUrl)}
                    activeOpacity={.5}
                    style={styles.rowContainer}>
                    <Text>{offer.title}</Text>
                    <Text>{offer.text}</Text>
                </TouchableOpacity>
            </TrackingView>
        );
    }

    /**
     * Render refresh control.
     *
     * @return {Object}
     */
    _renderRefreshControl() {
        return (
            <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this._refreshOffers.bind(this)} />
        );
    }

    /**
     * Render app.
     *
     * @return {Object}
     */
    render() {
        return (
            <View style={styles.appContainer}>
                <Text style={styles.appTitle}>
                    Annecy Offerwall
                </Text>
                <ListView
                    dataSource={this.state.offers}
                    renderRow={this._renderRow.bind(this)}
                    enableEmptySections={true}
                    onScroll={() => AnnecyService.onScroll()} // Do not bind!
                    refreshControl={this._renderRefreshControl()} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1
    },
    appTitle: {
        padding: 30,
        fontSize: 20,
        textAlign: 'center'
    },
    rowContainer: {
        padding: 10
    }
});
