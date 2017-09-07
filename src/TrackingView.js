//  Created by Tobias Schultka
//  Copyright © 2017 annecy.media. All rights reserved.

import AnnecyService from './AnnecyService.js';
import React, {Component} from 'react';
import {Dimensions, View} from 'react-native';

const PADDING = 5;

export default class TrackingView extends Component {

    /**
     * Component did mount.
     */
    componentDidMount() {
        this._startTrackingCheckEvent = () => this._startTrackingCheck();
        AnnecyService.addTrackingChecker(this._startTrackingCheckEvent);

        // Wait until views have their real heights.
        // Otherwise every view will be tracked.
        setTimeout(this._startTrackingCheck.bind(this));
    }

    /**
     * Component will unmount.
     */
    componentWillUnmount() {
        AnnecyService.removeTrackingChecker(this._startTrackingCheckEvent);
    }

    /**
     * Start tracking check.
     */
    _startTrackingCheck() {
        if (!this.refs.trackingView) {
            return;
        }

        this.refs.trackingView.measure((ox, oy, width, height, pageX, pageY) => {
            const viewTop = pageY + PADDING;
            const viewBottom = pageY + height - PADDING;
            const viewLeft = pageX + PADDING;
            const viewRight = pageX + width - PADDING;

            const dimensionsWindow = Dimensions.get('window');
            const isOnScreen = (
                viewTop > 0 &&
                viewBottom < dimensionsWindow.height &&
                viewLeft > 0 &&
                viewRight < dimensionsWindow.width
            );

            if (isOnScreen) {
                AnnecyService.trackOfferId(this.props.id);
                AnnecyService.removeTrackingChecker(this._startTrackingCheckEvent);
            }
        });
    }

    /**
     * React Native render.
     *
     * @return {Object}
     */
    render() {
        return (
            <View {...this.props} collapsable={false} ref="trackingView">
                {this.props.children}
            </View>
        );
    }
}
