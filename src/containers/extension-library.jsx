import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import log from '../lib/log';
import {manuallyTrustExtension} from './tw-security-manager.jsx';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';
import extensionTags from '../lib/libraries/extension-tags';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    },
    // extensionUrl: {
    //     defaultMessage: 'Enter the URL of the extension',
    //     description: 'Prompt for unoffical extension url',
    //     id: 'gui.extensionLibrary.extensionUrl'
    // },
    incompatible: {
        // eslint-disable-next-line max-len
        defaultMessage: 'This extension is incompatible with Scratch. Projects made with it cannot be uploaded to the Scratch website. Are you sure you want to enable it?',
        description: 'Confirm loading Scratch-incompatible extension',
        id: 'tw.confirmIncompatibleExtension'
    }
});

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
    }
    handleItemSelect (item) {
        // eslint-disable-next-line no-alert
        // if (item.incompatibleWithScratch && !confirm(this.props.intl.formatMessage(messages.incompatible))) {
        //     return;
        // }
        // const id = item.extensionId;
        // let url = item.extensionURL ? item.extensionURL : id;
        // const isCustomURL = !item.disabled && !id;
        // if (isCustomURL) {
        //     // eslint-disable-next-line no-alert
        //     url = prompt(this.props.intl.formatMessage(messages.extensionUrl));
        // }
        const extensionId = item.extensionId;
        const isCustomURL = !item.disabled && !extensionId;
        if (isCustomURL) {
            this.props.onOpenCustomExtensionModal();
            return;
        }
        if (extensionId === 'special_pengodExtensionLibrary') {
            window.open('https://extensions.penmod.com/');
            return;
        }
        const url = item.extensionURL ? item.extensionURL : extensionId;
        if (item._unsandboxed && url.startsWith("data:")) {
            manuallyTrustExtension(url);
        }
        if (!item.disabled) {
            if (this.props.vm.extensionManager.isExtensionLoaded(extensionId)) {
                this.props.onCategorySelected(extensionId);
            } else {
                this.props.vm.extensionManager.loadExtensionURL(url)
                    .then(() => {
                        this.props.onCategorySelected(extensionId);
                        // if (isCustomURL) {
                        //     let newUrl = location.pathname;
                        //     if (location.search) {
                        //         newUrl += location.search;
                        //         newUrl += '&';
                        //     } else {
                        //         newUrl += '?';
                        //     }
                        //     newUrl += `extension=${encodeURIComponent(url)}`;
                        //     history.replaceState('', '', newUrl);
                        // }
                    })
                    .catch(err => {
                        log.error(err);
                        // eslint-disable-next-line no-alert
                        alert(err);
                    });
            }
        }
    }
    render () {
        const extensionLibraryThumbnailData = extensionLibraryContent.map(extension => ({
            rawURL: extension.iconURL || extensionIcon,
            disabled: extension.disabled && !this.props.liveTest,
            ...extension
        }));
        return (
            <LibraryComponent
                data={extensionLibraryThumbnailData}
                filterable={true}
                tags={extensionTags}
                id="extensionLibrary"
                actor="ExtensionLibrary"
                header={"Extensions"}
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onOpenCustomExtensionModal: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

export default injectIntl(ExtensionLibrary);
