import React from "react";
import { connect } from "react-redux";
import { StyleSheet, css } from "aphrodite";
import Link from "next/link";
import * as Sentry from "@sentry/browser";

// Component
import Button from "../Form/Button";
import PermissionNotificationWrapper from "../../components/PermissionNotificationWrapper";

// Redux
import { AuthActions } from "~/redux/auth";
import { MessageActions } from "~/redux/message";
import { ModalActions } from "~/redux/modals";
import { HubActions } from "~/redux/hub";

// Config
import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import colors from "~/config/themes/colors";
import icons from "~/config/themes/icons";
import EditHubModal from "../modal/EditHubModal";

class HubCard extends React.Component {
  constructor(props) {
    super(props);
    this.linkRef = React.createRef();
    this.state = {
      transition: false,
    };
  }

  componentDidMount = () => {
    this.setState({
      subscribed: this.props.hub.user_is_subscribed,
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.auth.isLoggedIn !== this.props.auth.isLoggedIn ||
      prevProps.auth.user !== this.props.auth.user
    ) {
      this.updateSubscribedHubs();
    }
  };

  updateSubscribedHubs = () => {
    let auth = this.props.auth;
    let hubs = this.props.hubState.hubs;
    if (auth.isLoggedIn) {
      let subscribedHubs = {};

      let subscribed = auth.user.subscribed || [];
      subscribed.forEach((hub) => {
        subscribedHubs[hub.id] = true;
      });

      let updatedSubscribedHubs = hubs.map((hub) => {
        if (subscribed[hub.id]) {
          hub.user_is_subscribed = true;
        }
      });

      this.props.updateSubscribedHubs(updatedSubscribedHubs);

      if (this.props.hub.id in subscribedHubs) {
        this.setState({ subscribed: true });
      }
    } else {
      let updatedSubscribedHubs = hubs.map((hub) => {
        hub.user_is_subscribed = false;
        return hub;
      });

      this.props.updateSubscribedHubs(updatedSubscribedHubs);
    }
  };

  subscribeToHub = () => {
    const { hub, showMessage, setMessage, updateHub, hubState } = this.props;
    showMessage({ show: false });
    this.setState({ transition: true }, () => {
      let config = API.POST_CONFIG();
      if (this.state.subscribed) {
        return fetch(API.HUB_UNSUBSCRIBE({ hubId: hub.id }), config)
          .then(Helpers.checkStatus)
          .then(Helpers.parseJSON)
          .then((res) => {
            updateHub(hubState, { ...res });
            setMessage("Unsubscribed!");
            showMessage({ show: true });
            this.setState({
              transition: false,
              subscribed: false,
            });
          })
          .catch((error) => {
            if (error.response.status === 429) {
              this.props.openRecaptchaPrompt(true);
            } else {
              Sentry.captureException(error);
            }
          });
      } else {
        return fetch(API.HUB_SUBSCRIBE({ hubId: hub.id }), config)
          .then(Helpers.checkStatus)
          .then(Helpers.parseJSON)
          .then((res) => {
            updateHub(hubState, { ...res });
            setMessage("Subscribed!");
            showMessage({ show: true });
            this.setState({
              transition: false,
              subscribed: true,
            });
          })
          .catch((error) => {
            if (error.response.status === 429) {
              this.props.openRecaptchaPrompt(true);
            } else {
              Sentry.captureException(error);
            }
          });
      }
    });
  };

  onMouseEnterSubscribe = () => {
    this.setState({
      subscribeHover: true,
    });
  };

  onMouseExitSubscribe = () => {
    this.setState({
      subscribeHover: false,
    });
  };

  renderSubscribe = () => {
    const { hub } = this.props;
    if (!this.props.auth.isLoggedIn) return;
    let buttonStyle, buttonLabel;
    if (this.state.subscribed) {
      buttonStyle = this.state.subscribeHover
        ? styles.unsubscribeButton
        : styles.subscribed;
      buttonLabel = this.state.subscribeHover ? "Unsubscribe" : "Subscribed";
    } else {
      buttonStyle = styles.subscribeButton;
      buttonLabel = "Subscribe";
    }
    return (
      <button
        className={css(buttonStyle)}
        onMouseEnter={this.onMouseEnterSubscribe}
        onMouseLeave={this.onMouseExitSubscribe}
        onClick={(e) => {
          e.stopPropagation();
          this.subscribeToHub();
        }}
      >
        {buttonLabel}
      </button>
    );
  };

  openEditHubModal = (e) => {
    e.stopPropagation();
    this.props.openEditHubModal(true, this.props.hub);
  };

  render() {
    const { hub } = this.props;
    return (
      <div
        className={css(styles.slugLink)}
        onClick={() => {
          this.linkRef.current.click();
        }}
      >
        <div className={css(styles.hubCard)}>
          <img
            loading="lazy"
            className={css(styles.roundedImage)}
            src={
              hub.hub_image
                ? hub.hub_image
                : "/static/background/twitter-banner.jpg"
            }
            alt="Hub Background Image"
          ></img>
          <EditHubModal />
          {/* <PermissionNotificationWrapper
              modalMessage="Edit the Hub"
              loginRequired={true}
              permissionKey="EditHub"
            > */}
          <div
            className={css(styles.editButton)}
            onClick={this.openEditHubModal}
          >
            {icons.pencil}
          </div>
          {/* </PermissionNotificationWrapper> */}
          <div key={hub.id} className={css(styles.hubInfo)}>
            <div className={css(styles.hubTitle)}>
              <div className={css(styles.hubName)}>{hub.name}</div>
              {this.renderSubscribe()}
            </div>
            <div className={css(styles.hubDescription)}>{hub.description}</div>
            <div className={css(styles.hubStats)}>
              <div>
                <span className={css(styles.statIcon)}>{icons.paper}</span>
                {hub.paper_count} Paper
                {hub.paper_count != 1 ? "s" : ""}
              </div>
              <div>
                <span className={css(styles.statIcon)}>{icons.chat}</span>
                {hub.discussion_count} Comment
                {hub.discussion_count != 1 ? "s" : ""}
              </div>
              <div>
                <span className={css(styles.statIcon)}>{icons.user}</span>
                {hub.subscriber_count} Subscriber
                {hub.subscriber_count != 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <Link
            href="/hubs/[slug]"
            as={`/hubs/${encodeURIComponent(hub.slug)}`}
            key={`hub_${hub.id}`}
          >
            <a ref={this.linkRef}></a>
          </Link>
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  slugLink: {
    zIndex: 1,
    cursor: "pointer",
    textDecoration: "none",
    width: "364px",
    height: "264px",
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 21,
    marginRight: 21,
    transition: "transform 0.1s",
    ":hover": {
      transition: "transform 0.1s",
      transform: "scale(1.05)",
    },
    "@media only screen and (max-width: 415px)": {
      zoom: 0.9,
    },
    "@media only screen and (max-width: 376px)": {
      zoom: 0.8,
    },
    "@media only screen and (max-width: 321px)": {
      zoom: 0.7,
    },
  },
  hubCard: {
    fontSize: "16px",
    color: "#241F3A",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(93, 83, 254, 0.18)",
    marginBottom: 50,
  },
  roundedImage: {
    borderRadius: "8px 8px 0 0",
    width: "364px",
    height: "128px",
    objectFit: "cover",
    pointerEvents: "none",
  },
  hubInfo: {
    boxSizing: "border-box",
    padding: "0 15px",
  },
  hubTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "10px 0 0 0",
  },
  hubName: {
    fontSize: 18,
    textTransform: "capitalize",
    fontWeight: 500,
  },
  subscribeButton: {
    height: 20,
    width: 80,
    border: `${colors.BLUE()} 1px solid`,
    backgroundColor: colors.BLUE(),
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
    borderRadius: 5,
    cursor: "pointer",
    highlight: "none",
    outline: "none",
    userSelect: "none",
    ":hover": {
      backgroundColor: "#3E43E8",
    },
  },
  unsubscribeButton: {
    height: 20,
    width: 80,
    color: "#fff",
    backgroundColor: colors.RED(1),
    border: `${colors.RED(1)} 1px solid`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
    borderRadius: 5,
    cursor: "pointer",
    highlight: "none",
    outline: "none",
    userSelect: "none",
  },
  subscribed: {
    height: 20,
    width: 80,
    border: `${colors.BLUE()} 1px solid`,
    color: colors.BLUE(),
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
    borderRadius: 5,
    cursor: "pointer",
    highlight: "none",
    outline: "none",
    userSelect: "none",
  },
  hubDescription: {
    fontSize: 13,
    height: "70px",
    padding: "10px 0 0 0",
    opacity: "0.8",
  },
  hubStats: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: "0 0 15px 0",
    color: "#C1C1CF",
    fontSize: "12px",
  },
  statIcon: {
    marginRight: "5px",
  },
  editButton: {
    position: "absolute",
    cursor: "pointer",
    fontSize: 30,
    top: 6,
    right: 8,
    color: "black",
  },
});

const mapStateToProps = (state) => ({
  auth: state.auth,
  hubState: state.hubs,
});

const mapDispatchToProps = {
  showMessage: MessageActions.showMessage,
  setMessage: MessageActions.setMessage,
  updateHub: HubActions.updateHub,
  openEditHubModal: ModalActions.openEditHubModal,
  openRecaptchaPrompt: ModalActions.openRecaptchaPrompt,
  updateSubscribedHubs: HubActions.updateSubscribedHubs,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HubCard);
