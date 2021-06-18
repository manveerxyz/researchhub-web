import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, SyntheticEvent, useState } from "react";
import Button from "./Form/Button";
import NewPostModal from "./Modals/NewPostModal";
import PermissionNotificationWrapper from "./PermissionNotificationWrapper";
import { css, StyleSheet } from "aphrodite";

export type NewPostButtonProps = {
  customButtonStyle: StyleSheet;
  onClick: (e: SyntheticEvent) => void;
};

export default function NewPostButton({ customButtonStyle, onClick }) {
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  return (
    <Fragment>
      {/* @ts-ignore */}
      <PermissionNotificationWrapper
        onClick={() => setIsNewPostModalOpen(true)}
        modalMessage="create a new post"
        loginRequired={true}
        permissionKey="CreatePaper"
      >
        {/* @ts-ignore */}
        <Button
          customButtonStyle={customButtonStyle}
          hideRipples={true}
          label={
            // isLink prop does not allow onClick to trigger on link click
            <div className={css(styles.newPostLabel)}>
              <FontAwesomeIcon
                style={{ fontSize: "1.5em", marginRight: 8 }}
                icon={["far", "plus"]}
              />
              <span> New Post </span>{" "}
            </div>
          }
          onClick={onClick}
        />
      </PermissionNotificationWrapper>
      <NewPostModal
        isOpen={isNewPostModalOpen}
        setIsOpen={setIsNewPostModalOpen}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  newPostLabel: {
    display: "flex",
    alignItems: "center",
  },
});
