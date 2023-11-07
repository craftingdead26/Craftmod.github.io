/**
 * Copyright (C) 2021 Thomas Weber
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { getIsLoading } from '../reducers/project-state.js';
import DOMElementRenderer from '../containers/dom-element-renderer.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import ErrorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import TWProjectMetaFetcherHOC from '../lib/tw-project-meta-fetcher-hoc.jsx';
import TWStateManagerHOC from '../lib/tw-state-manager-hoc.jsx';
import TWThemeHOC from '../lib/tw-theme-hoc.jsx';
import SBFileUploaderHOC from '../lib/sb-file-uploader-hoc.jsx';
import TWPackagerIntegrationHOC from '../lib/tw-packager-integration-hoc.jsx';
import SettingsStore from '../addons/settings-store-singleton';
import '../lib/tw-fix-history-api';
import GUI from './render-gui.jsx';
import VoteFrame from './vote-frame.jsx';
import MenuBar from '../components/menu-bar/menu-bar.jsx';
import ProjectInput from '../components/tw-project-input/project-input.jsx';
import FeaturedProjects from '../components/tw-featured-projects/featured-projects.jsx';
import Description from '../components/tw-description/description.jsx';
import BrowserModal from '../components/browser-modal/browser-modal.jsx';
import CloudVariableBadge from '../containers/tw-cloud-variable-badge.jsx';
import {isBrowserSupported} from '../lib/tw-environment-support-prober';
import AddonChannels from '../addons/channels';
import { loadServiceWorker } from './load-service-worker';
import runAddons from '../addons/entry';

import styles from './interface.css';
import restore from './restore.js';

const urlparams = new URLSearchParams(location.search);
const restoring = urlparams.get("restore");
const restoreHandler = urlparams.get("handler");
if (String(restoring) === "true") {
    // console.log(restore)
    restore(restoreHandler);
}

let announcement = null;
if (process.env.ANNOUNCEMENT) {
    announcement = document.createElement('p');
    // This is safe because process.env.ANNOUNCEMENT is set at build time.
    announcement.innerHTML = process.env.ANNOUNCEMENT;
}

const handleClickAddonSettings = () => {
    const path = process.env.ROUTING_STYLE === 'wildcard' ? 'addons' : 'addons.html';
    window.open(`${process.env.ROOT}${path}`);
};

const messages = defineMessages({
    defaultTitle: {
        defaultMessage: 'A mod of Penguinmod',
        description: 'Title of homepage',
        id: 'tw.guiDefaultTitle'
    }
});

const WrappedMenuBar = compose(
    SBFileUploaderHOC,
    TWPackagerIntegrationHOC
)(MenuBar);

if (AddonChannels.reloadChannel) {
    AddonChannels.reloadChannel.addEventListener('message', () => {
        location.reload();
    });
}

if (AddonChannels.changeChannel) {
    AddonChannels.changeChannel.addEventListener('message', e => {
        SettingsStore.setStoreWithVersionCheck(e.data);
    });
}

runAddons();

/* todo: fix this and make it work properly */
// const projectDetailCache = {};
// const getProjectDetailsById = async (id) => {
//     // if we have already gotten the details of this project, avoid making another request since they likely never changed
//     if (projectDetailCache[String(id)] != null) return projectDetailCache[String(id)];

//     const response = await fetch(`https://projects.penguinmod.com/api/projects/getPublished?id=${id}`);
//     // Don't continue if the api never returned 200-299 since we would cache an error as project details
//     if (!response.ok) return {};

//     const project = await response.json();
//     projectDetailCache[String(id)] = project;
//     return projectDetailCache[String(id)];
// };

const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.footerContent}>
            <div className={styles.footerText}>
                <FormattedMessage
                    // eslint-disable-next-line max-len
                    defaultMessage="Craftmod, Dinosaurmod and TurboWarp are not affiliated with Scratch, the Scratch Team, or the Scratch Foundation."
                    description="Disclaimer that Craftmod, Dinosaurmod and TurboWarp are not connected to Scratch"
                    id="tw.footer.disclaimer"
                />
            </div>
            <div className={styles.footerColumns}>
                <div className={styles.footerSection}>
                    <a href="credits.html">
                        <FormattedMessage
                            defaultMessage="Credits"
                            description="Credits link in footer"
                            id="tw.footer.credits"
                        />
                    </a>
                    <a href="https://github.com/sponsors/GarboMuffin">
                        <FormattedMessage
                            defaultMessage="Donate to TurboWarp Developer"
                            description="Donation link in footer"
                            id="tw.footer.donate"
                        />
                    </a>
                </div>
                <div className={styles.footerSection}>
                    <a href="privacy.html">
                        <FormattedMessage
                            defaultMessage="Privacy Policy"
                            description="Link to privacy policy"
                            id="tw.privacy"
                        />
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

class Interface extends React.Component {
    constructor(props) {
        super(props);
        this.handleUpdateProjectTitle = this.handleUpdateProjectTitle.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.isLoading && !this.props.isLoading) {
            loadServiceWorker();
        }
    }
    handleUpdateProjectTitle(title, isDefault) {
        if (isDefault || !title) {
            document.title = `Craftmod - ${this.props.intl.formatMessage(messages.defaultTitle)}`;
        } else {
            document.title = `${title} - DinosaurMod`;
        }
    }
    render() {
        const {
            /* eslint-disable no-unused-vars */
            intl,
            hasCloudVariables,
            description,
            extraProjectInfo,
            remixedProjectInfo,
            isFullScreen,
            isLoading,
            isPlayerOnly,
            isRtl,
            onClickTheme,
            projectId,
            /* eslint-enable no-unused-vars */
            ...props
        } = this.props;
        const isHomepage = isPlayerOnly && !isFullScreen;
        const isEditor = !isPlayerOnly;
        return (
            <div
                className={classNames(styles.container, {
                    [styles.playerOnly]: isHomepage,
                    [styles.editor]: isEditor
                })}
            >
                {isHomepage ? (
                    <div className={styles.menu}>
                        <WrappedMenuBar
                            canChangeLanguage
                            canManageFiles
                            enableSeeInside
                            onClickAddonSettings={handleClickAddonSettings}
                            onClickTheme={onClickTheme}
                        />
                    </div>
                ) : null}
                <div
                    className={styles.center}
                    style={isPlayerOnly ? ({
                        // add a couple pixels to account for border (TODO: remove weird hack)
                        width: `${Math.max(480, props.customStageSize.width) + 2}px`
                    }) : null}
                >
                    {isHomepage && announcement ? <DOMElementRenderer domElement={announcement} /> : null}
                    <GUI
                        onClickAddonSettings={handleClickAddonSettings}
                        onClickTheme={onClickTheme}
                        onUpdateProjectTitle={this.handleUpdateProjectTitle}
                        backpackVisible
                        backpackHost="_local_"
                        {...props}
                    />
                    {isHomepage ? (
                        <React.Fragment>
                            {/* project not approved message */}
                            {(!extraProjectInfo.accepted) && (
                                <div className={styles.remixWarningBox}>
                                    <p>This project is not approved. Be careful when running this project.</p>
                                </div>
                            )}
                            {/* remix info */}
                            {(extraProjectInfo.isRemix && remixedProjectInfo.loaded) && (
                                <div className={styles.unsharedUpdate}>
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <a
                                            style={{ height: "32px" }}
                                            target="_blank"
                                            href={`https://nmod.com/profile?user=${remixedProjectInfo.author}`}
                                        >
                                            <img
                                                className={styles.remixAuthorImage}
                                                title={remixedProjectInfo.author}
                                                alt={remixedProjectInfo.author}
                                                src={`https://trampoline.turbowarp.org/avatars/by-username/${remixedProjectInfo.author}`}
                                            />
                                        </a>
                                        <p>
                                            Thanks to <b>
                                                <a
                                                    target="_blank"
                                                    href={`https://pumod.com/profile?user=${remixedProjectInfo.author}`}
                                                >
                                                    {remixedProjectInfo.author}
                                                </a>
                                            </b> for the original project <b>
                                                <a
                                                    href={`${window.location.origin}/#${extraProjectInfo.remixId}`}
                                                >
                                                    {remixedProjectInfo.name}
                                                </a>
                                            </b>.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {isBrowserSupported() ? null : (
                                <BrowserModal isRtl={isRtl} />
                            )}
                            {hasCloudVariables && projectId !== '0' && (
                                <div className={styles.section}>
                                    <CloudVariableBadge />
                                </div>
                            )}
                            {description.instructions || description.credits ? (
                                <div className={styles.section}>
                                    <Description
                                        instructions={description.instructions}
                                        credits={description.credits}
                                        projectId={projectId}
                                    />
                                </div>
                            ) : null}
                            <VoteFrame id={projectId} darkmode={this.props.isDark}></VoteFrame>
                            {extraProjectInfo.author && (
                                <a
                                    target="_blank"
                                    href={`https://pm/profile?user=${extraProjectInfo.author}`}
                                >
                                    View other projects by {extraProjectInfo.author}
                                </a>
                            )}
                            <div className={styles.section}>
                                <p>
                                    <FormattedMessage
                                        // eslint-disable-next-line max-len
                                        defaultMessage="Craftmod is a mod of Dinosaurmod that has added new blocks and features in extensions or in Craftmod's main toolbox. Dinosaurmod is a cool mod of turbowarp where you can share your projects. TurboWarp is a Scratch mod that compiles projects to JavaScript to make them run really fast. Try it out by choosing an uploaded project below or making your own in the editor."
                                        description="Description of Dinosaurmod and TurboWarp"
                                        id="tw.home.description"
                                    />
                                </p>
                            </div>
                            <div className={styles.section}>
                                <FeaturedProjects />
                            </div>
                            <a
                                target="_blank"
                                href="https://nmod.com/search?q=all:projects"
                            >
                                See more projects
                            </a>
                        </React.Fragment>
                    ) : null}
                </div>
                {isHomepage && <Footer />}
            </div>
        );
    }
}

Interface.propTypes = {
    intl: intlShape,
    hasCloudVariables: PropTypes.bool,
    customStageSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    description: PropTypes.shape({
        credits: PropTypes.string,
        instructions: PropTypes.string
    }),
    extraProjectInfo: PropTypes.shape({
        accepted: PropTypes.bool,
        isRemix: PropTypes.bool,
        remixId: PropTypes.number,
        tooLarge: PropTypes.bool,
        author: PropTypes.string
    }),
    remixedProjectInfo: PropTypes.shape({
        loaded: PropTypes.bool,
        name: PropTypes.string,
        author: PropTypes.string
    }),
    isFullScreen: PropTypes.bool,
    isLoading: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isRtl: PropTypes.bool,
    onClickTheme: PropTypes.func,
    projectId: PropTypes.string
};

const mapStateToProps = state => ({
    hasCloudVariables: state.scratchGui.tw.hasCloudVariables,
    customStageSize: state.scratchGui.customStageSize,
    description: state.scratchGui.tw.description,
    extraProjectInfo: state.scratchGui.tw.extraProjectInfo,
    remixedProjectInfo: state.scratchGui.tw.remixedProjectInfo,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isLoading: getIsLoading(state.scratchGui.projectState.loadingState),
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
    isRtl: state.locales.isRtl,
    projectId: state.scratchGui.projectState.projectId
});

const mapDispatchToProps = () => ({});

const ConnectedInterface = injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(Interface));

const WrappedInterface = compose(
    AppStateHOC,
    ErrorBoundaryHOC('TW Interface'),
    TWProjectMetaFetcherHOC,
    TWStateManagerHOC,
    TWThemeHOC,
    TWPackagerIntegrationHOC
)(ConnectedInterface);

export default WrappedInterface;
