import { css, StyleSheet } from "aphrodite";
import colors from "../../config/themes/colors";
import CommentAvatars from "../Comment/CommentAvatars";
import { PredictionMarketVote } from "./lib/types";
import UserTooltip from "../Tooltips/User/UserTooltip";
import ALink from "../ALink";
import { ReactElement } from "react";
import { breakpoints } from "~/config/themes/screen";
import ResearchCoinIcon from "../Icons/ResearchCoinIcon";

export type PredictionMarketVoteItemProps = {
  vote: PredictionMarketVote;
};

const PredictionMarketVoteItem = ({
  vote,
}: PredictionMarketVoteItemProps): ReactElement => {
  return (
    <div className={css(styles.content)}>
      <div className={css(styles.leftContent)}>
        <CommentAvatars
          people={[vote.createdBy]}
          spacing={-20}
          withTooltip={true}
        />

        <div className={css(styles.nameWrapper)}>
          <div className={css(styles.nameRow)}>
            <div className={css(styles.leftContentWrapper)}>
              <div className={css(styles.name)}>
                <UserTooltip
                  createdBy={vote.createdBy}
                  targetContent={
                    <ALink
                      href={`/user/${vote.createdBy.authorProfile?.id}/overview`}
                      key={`/user/${vote.createdBy.authorProfile?.id}/overview-key`}
                    >
                      {vote.createdBy.authorProfile.firstName}
                      {vote.createdBy.authorProfile.lastName && " "}
                      {vote.createdBy.authorProfile.lastName}
                    </ALink>
                  }
                />
              </div>
              <div className={css(styles.lightText)}>voted</div>
              <div
                className={css(
                  vote.vote === "YES" ? styles.greenText : styles.redText
                )}
              >
                {vote.vote}
              </div>
            </div>
          </div>
          <div className={css(styles.lightText)}>{vote.timeAgo}</div>
        </div>
      </div>
      <div className={css(styles.rightContent)}>
        <ResearchCoinIcon width={18} height={18} />
        <span className={css(styles.betText)}>
          {(vote.betAmount || 0).toFixed(0)}
          &nbsp;RSC
        </span>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  content: {
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
    },
    width: "100%",
  },
  leftContent: {
    display: "flex",
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      alignItems: "flex-start",
    },
    width: "100%",
  },

  lightText: {
    color: colors.BLACK(0.6),
  },
  greenText: {
    color: colors.PASTEL_GREEN(),
  },
  redText: {
    color: colors.PASTEL_RED(),
  },

  nameWrapper: {
    marginLeft: 6,
    width: "100%",
  },
  nameRow: {
    display: "flex",
    columnGap: "5px",
    fontSize: 15,
    alignItems: "flex-start",
    marginBottom: 2,
    minHeight: 21,
  },
  name: {
    display: "flex",
    whiteSpace: "pre",
    alignItems: "center",
  },
  leftContentWrapper: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "5px",
  },

  rightContent: {
    display: "flex",
    alignItems: "center",
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      marginLeft: 40,
    },
  },
  betText: {
    fontSize: 16,
    fontWeight: 400,
    marginLeft: 8,
    color: colors.ORANGE_LIGHT2(),
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      fontSize: 14,
    },
  },
});

export default PredictionMarketVoteItem;
